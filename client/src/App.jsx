import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { CartProvider } from './context/CartContext';

// Pages
import LandingPage from './pages/LandingPage';
import IPLScoreboard from './pages/IPLScoreboard';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';

// Fan
import FanDashboard from './pages/fan/FanDashboard';
import TicketView from './pages/fan/TicketView';
import NavigationPage from './pages/fan/NavigationPage';
import QueueMonitor from './pages/fan/QueueMonitor';
import FoodOrder from './pages/fan/FoodOrder';
import OrderTracking from './pages/fan/OrderTracking';
import RewardsPage from './pages/fan/RewardsPage';

// Admin
import AdminDashboard from './pages/admin/AdminDashboard';
import CrowdManagement from './pages/admin/CrowdManagement';
import IncidentManagement from './pages/admin/IncidentManagement';
import AdminReports from './pages/admin/AdminReports';

// Staff
import StaffDashboard from './pages/staff/StaffDashboard';

// Vendor
import VendorDashboard from './pages/vendor/VendorDashboard';
import VendorMenu from './pages/vendor/VendorMenu';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    const roleRedirects = { fan: '/fan', admin: '/admin', staff: '/staff', vendor: '/vendor' };
    return <Navigate to={roleRedirects[user.role] || '/'} replace />;
  }
  return children;
};

const AppRoutes = () => {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to={`/${user.role}`} /> : <LandingPage />} />
      <Route path="/login" element={user ? <Navigate to={`/${user.role}`} /> : <LoginPage />} />
      <Route path="/register" element={user ? <Navigate to={`/${user.role}`} /> : <RegisterPage />} />

      {/* Fan Routes */}
      <Route path="/fan" element={<ProtectedRoute allowedRoles={['fan']}><FanDashboard /></ProtectedRoute>} />
      <Route path="/fan/ticket/:id" element={<ProtectedRoute allowedRoles={['fan']}><TicketView /></ProtectedRoute>} />
      <Route path="/fan/navigate" element={<ProtectedRoute allowedRoles={['fan']}><NavigationPage /></ProtectedRoute>} />
      <Route path="/fan/queue" element={<ProtectedRoute allowedRoles={['fan']}><QueueMonitor /></ProtectedRoute>} />
      <Route path="/fan/order" element={<ProtectedRoute allowedRoles={['fan']}><FoodOrder /></ProtectedRoute>} />
      <Route path="/fan/orders" element={<ProtectedRoute allowedRoles={['fan']}><OrderTracking /></ProtectedRoute>} />
      <Route path="/fan/rewards" element={<ProtectedRoute allowedRoles={['fan']}><RewardsPage /></ProtectedRoute>} />

      {/* Admin Routes */}
      <Route path="/admin" element={<ProtectedRoute allowedRoles={['admin']}><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/crowd" element={<ProtectedRoute allowedRoles={['admin']}><CrowdManagement /></ProtectedRoute>} />
      <Route path="/admin/incidents" element={<ProtectedRoute allowedRoles={['admin']}><IncidentManagement /></ProtectedRoute>} />
      <Route path="/admin/reports" element={<ProtectedRoute allowedRoles={['admin']}><AdminReports /></ProtectedRoute>} />

      {/* Staff Routes */}
      <Route path="/staff" element={<ProtectedRoute allowedRoles={['staff']}><StaffDashboard /></ProtectedRoute>} />

      {/* Vendor Routes */}
      <Route path="/vendor" element={<ProtectedRoute allowedRoles={['vendor']}><VendorDashboard /></ProtectedRoute>} />
      <Route path="/vendor/menu" element={<ProtectedRoute allowedRoles={['vendor']}><VendorMenu /></ProtectedRoute>} />

      <Route path="/ipl" element={<IPLScoreboard />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <CartProvider>
          <BrowserRouter>
            <Toaster position="top-right" toastOptions={{
              style: { background: '#151d2e', color: '#f1f5f9', border: '1px solid rgba(255,255,255,0.08)' },
              success: { iconTheme: { primary: '#10b981', secondary: '#f1f5f9' } },
              error: { iconTheme: { primary: '#ef4444', secondary: '#f1f5f9' } },
            }} />
            <AppRoutes />
          </BrowserRouter>
        </CartProvider>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
