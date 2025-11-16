import { useState } from 'react';
import { authApi } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { Lock, User, Mail } from 'lucide-react';

const Settings = () => {
  const { user } = useAuth();
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setMessage({ type: 'error', text: '新しいPasswordが一致しません' });
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Passwordは6文字以上である必要があります' });
      return;
    }

    setLoading(true);

    try {
      await authApi.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      setMessage({ type: 'success', text: 'PasswordをChangeしました' });
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (error: any) {
      setMessage({ 
        type: 'error', 
        text: error.response?.data?.error || 'PasswordのChangeにfailed' 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">アカウントSettingsのManage</p>
      </div>

      {/* User Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <User className="mr-2" size={24} />
          Account Information
        </h2>
        <div className="space-y-4">
          <div className="flex items-center py-3 border-b">
            <div className="w-32 text-sm font-medium text-gray-700">Username</div>
            <div className="text-sm text-gray-900">{user?.username}</div>
          </div>
          <div className="flex items-center py-3 border-b">
            <div className="w-32 text-sm font-medium text-gray-700">Email</div>
            <div className="text-sm text-gray-900">{user?.email}</div>
          </div>
          <div className="flex items-center py-3 border-b">
            <div className="w-32 text-sm font-medium text-gray-700">Full Name</div>
            <div className="text-sm text-gray-900">{user?.full_name || '-'}</div>
          </div>
          <div className="flex items-center py-3 border-b">
            <div className="w-32 text-sm font-medium text-gray-700">Role</div>
            <div>
              <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                user?.role === 'admin' 
                  ? 'bg-purple-100 text-purple-800' 
                  : 'bg-blue-100 text-blue-800'
              }`}>
                {user?.role === 'admin' ? 'Admin' : 'ユーザー'}
              </span>
            </div>
          </div>
          <div className="flex items-center py-3">
            <div className="w-32 text-sm font-medium text-gray-700">Created</div>
            <div className="text-sm text-gray-900">
              {user?.created_at && new Date(user.created_at).toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Password Change */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
          <Lock className="mr-2" size={24} />
          PasswordChange
        </h2>

        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-800' 
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              現在のPassword *
            </label>
            <input
              type="password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="現在のPassword"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              新しいPassword *
            </label>
            <input
              type="password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="新しいPassword（6文字以上）"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              新しいPassword（Confirm） *
            </label>
            <input
              type="password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              placeholder="新しいPassword（再入力）"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Change中...' : 'PasswordをChange'}
          </button>
        </form>
      </div>

      {/* System Info */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">
          System Information
        </h2>
        <div className="space-y-3 text-sm text-gray-600">
          <div className="flex justify-between py-2 border-b">
            <span className="font-medium">Version</span>
            <span>1.0.0</span>
          </div>
          <div className="flex justify-between py-2 border-b">
            <span className="font-medium">Environment</span>
            <span>Development</span>
          </div>
          <div className="flex justify-between py-2">
            <span className="font-medium">Last Updated</span>
            <span>{new Date().toLocaleDateString('ja-JP')}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
