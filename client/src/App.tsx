import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Quiz from './pages/Quiz';
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminQuestions from './pages/AdminQuestions';
import AdminHomepage from './pages/AdminHomepage';
import AdminSettings from './pages/AdminSettings';
import Home from './pages/Home';
import { useAuthStore } from './store/authStore';
import Layout from './components/Layout';

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const user = useAuthStore((state) => state.user);

  const AdminRoute = ({ children }: { children: React.ReactNode }) => {
    if (!isAuthenticated) return <Navigate to="/login" />;
    if (!['ADMIN', 'STAFF'].includes(user?.role || '')) return <Navigate to="/dashboard" />;
    return <Layout>{children}</Layout>;
  };

  const CustomerRoute = ({ children }: { children: React.ReactNode }) => {
    if (!isAuthenticated) return <Navigate to="/login" />;
    if (['ADMIN', 'STAFF'].includes(user?.role || '')) return <Navigate to="/admin" />;
    return <Layout>{children}</Layout>;
  };

  return (
    <Router>
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to={['ADMIN', 'STAFF'].includes(user?.role || '') ? '/admin' : '/dashboard'} />} />
          <Route path="/signup" element={!isAuthenticated ? <Signup /> : <Navigate to={['ADMIN', 'STAFF'].includes(user?.role || '') ? '/admin' : '/dashboard'} />} />

          <Route path="/dashboard" element={<CustomerRoute><Dashboard /></CustomerRoute>} />
          <Route path="/quiz" element={<CustomerRoute><Quiz /></CustomerRoute>} />
          <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
          <Route path="/admin/questions" element={<AdminRoute><AdminQuestions /></AdminRoute>} />
          <Route path="/admin/homepage" element={<AdminRoute><AdminHomepage /></AdminRoute>} />
          <Route path="/admin/settings" element={<AdminRoute><AdminSettings /></AdminRoute>} />
          <Route path="*" element={<Navigate to={isAuthenticated ? (['ADMIN', 'STAFF'].includes(user?.role || '') ? '/admin' : '/dashboard') : '/'} />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
