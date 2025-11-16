import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Content from './pages/Content';
import ContentEdit from './pages/ContentEdit';
import Settings from './pages/Settings';
import Transactions from './pages/Transactions';
import Products from './pages/Products';
import Categories from './pages/Categories';
import Customers from './pages/Customers';
import Affiliates from './pages/Affiliates';
import Reports from './pages/Reports';
import Refunds from './pages/Refunds';
import DownloadLog from './pages/DownloadLog';
import MailLog from './pages/MailLog';
import DayTRX from './pages/DayTRX';
import Invoices from './pages/Invoices';
import Docs from './pages/Docs';
import FastDocs from './pages/FastDocs';
import Layout from './components/Layout';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <PrivateRoute>
            <Layout />
          </PrivateRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="transactions" element={<Transactions />} />
        <Route path="customers" element={<Customers />} />
        <Route path="content" element={<Content />} />
        <Route path="content/new" element={<ContentEdit />} />
        <Route path="content/:id" element={<ContentEdit />} />
        <Route path="categories" element={<Categories />} />
        <Route path="products" element={<Products />} />
        <Route path="affiliates" element={<Affiliates />} />
        <Route path="reports" element={<Reports />} />
        <Route path="refunds" element={<Refunds />} />
        <Route path="download-log" element={<DownloadLog />} />
        <Route path="mail-log" element={<MailLog />} />
        <Route path="day-trx" element={<DayTRX />} />
        <Route path="invoices" element={<Invoices />} />
        <Route path="docs" element={<Docs />} />
        <Route path="fast-docs" element={<FastDocs />} />
        <Route path="users" element={<Users />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}

export default App;
