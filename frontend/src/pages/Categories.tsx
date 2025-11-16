import { useEffect, useState } from 'react';
import { categoriesApi } from '../services/api';
import type { Category } from '../types';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

const Categories = () => {
  const { user } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    status: 'active' as 'active' | 'inactive',
  });

  useEffect(() => {
    loadCategories();
  }, [search]);

  const loadCategories = async () => {
    try {
      const response = await categoriesApi.getAll({ search });
      setCategories(response.data.categories);
    } catch (error) {
      console.error('Failed to load categories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await categoriesApi.update(editingCategory.id, formData);
      } else {
        await categoriesApi.create(formData);
      }
      setShowModal(false);
      setEditingCategory(null);
      resetForm();
      loadCategories();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Error occurred');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure?')) return;
    try {
      await categoriesApi.delete(id);
      loadCategories();
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to delete');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', slug: '', description: '', status: 'active' });
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-96"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
          <p className="text-gray-600 mt-1">Manage product categories</p>
        </div>
        {user?.role === 'admin' && (
          <button onClick={() => { resetForm(); setShowModal(true); }} className="flex items-center px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg">
            <Plus size={20} className="mr-2" />Add Category
          </button>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search categories..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg"
        />
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Slug</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
              {user?.role === 'admin' && <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categories.map((cat) => (
              <tr key={cat.id} className="hover:bg-gray-50">
                <td className="px-6 py-4"><div className="text-sm font-medium text-gray-900">{cat.name}</div></td>
                <td className="px-6 py-4"><span className="text-sm text-gray-500">{cat.slug}</span></td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${cat.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {cat.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">{new Date(cat.created_at).toLocaleDateString()}</td>
                {user?.role === 'admin' && (
                  <td className="px-6 py-4 text-right text-sm">
                    <button onClick={() => { setEditingCategory(cat); setFormData({ name: cat.name, slug: cat.slug, description: cat.description || '', status: cat.status }); setShowModal(true); }} className="text-primary-600 hover:text-primary-900 mr-4">
                      <Edit size={18} />
                    </button>
                    <button onClick={() => handleDelete(cat.id)} className="text-red-600 hover:text-red-900">
                      <Trash2 size={18} />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">{editingCategory ? 'Edit Category' : 'Add Category'}</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Slug *</label>
                  <input type="text" value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} required className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
                  <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })} className="w-full px-3 py-2 border border-gray-300 rounded-lg">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                </div>
                <div className="flex justify-end space-x-3 pt-4">
                  <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700">Cancel</button>
                  <button type="submit" className="px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg">{editingCategory ? 'Update' : 'Create'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categories;
