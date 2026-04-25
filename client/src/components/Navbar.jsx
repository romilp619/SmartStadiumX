import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import {
  Trophy, Bell, ShoppingCart, LogOut, Menu, X,
  Zap, Shield, ChefHat, User
} from 'lucide-react';

const roleConfig = {
  fan: { color: '#3b82f6', icon: User, label: 'Fan' },
  admin: { color: '#8b5cf6', icon: Shield, label: 'Admin' },
  staff: { color: '#f59e0b', icon: Zap, label: 'Staff' },
  vendor: { color: '#10b981', icon: ChefHat, label: 'Vendor' },
};

export default function Navbar({ alerts = [] }) {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showAlerts, setShowAlerts] = useState(false);

  const rc = roleConfig[user?.role] || roleConfig.fan;
  const RoleIcon = rc.icon;

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav style={{ background: 'rgba(10,14,26,0.95)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.06)', position: 'sticky', top: 0, zIndex: 100 }}>
      <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #3b82f6, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Trophy size={20} color="white" />
          </div>
          <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.2rem', background: 'linear-gradient(135deg, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            SmartStadiumX
          </span>
        </Link>

        {/* Right side */}
        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Role badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '4px 10px', borderRadius: 8, background: `${rc.color}20`, border: `1px solid ${rc.color}40` }}>
              <RoleIcon size={14} color={rc.color} />
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: rc.color }}>{rc.label}</span>
            </div>

            {/* Cart (fan only) */}
            {user.role === 'fan' && (
              <button onClick={() => navigate('/fan/order')} style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 6 }}>
                <ShoppingCart size={22} />
                {itemCount > 0 && (
                  <span style={{ position: 'absolute', top: 0, right: 0, background: '#3b82f6', color: 'white', borderRadius: '50%', width: 18, height: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.65rem', fontWeight: 700 }}>{itemCount}</span>
                )}
              </button>
            )}

            {/* Alerts bell */}
            <div style={{ position: 'relative' }}>
              <button onClick={() => setShowAlerts(!showAlerts)} style={{ position: 'relative', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 6 }}>
                <Bell size={22} />
                {alerts.filter(a => a.isActive).length > 0 && (
                  <span style={{ position: 'absolute', top: 2, right: 2, width: 8, height: 8, background: '#ef4444', borderRadius: '50%' }} />
                )}
              </button>
              {showAlerts && (
                <div style={{ position: 'absolute', right: 0, top: '110%', width: 320, background: '#151d2e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '0.5rem', boxShadow: '0 20px 60px rgba(0,0,0,0.5)', zIndex: 200 }}>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', padding: '0.5rem', fontWeight: 600 }}>ALERTS</p>
                  {alerts.filter(a => a.isActive).slice(0, 5).map(a => (
                    <div key={a._id} style={{ padding: '0.6rem 0.75rem', borderRadius: 8, marginBottom: 4, background: a.severity === 'critical' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)', borderLeft: `3px solid ${a.severity === 'critical' ? '#ef4444' : '#f59e0b'}` }}>
                      <p style={{ fontWeight: 600, fontSize: '0.85rem' }}>{a.title}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 2 }}>{a.message}</p>
                    </div>
                  ))}
                  {alerts.filter(a => a.isActive).length === 0 && <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '1rem', fontSize: '0.85rem' }}>No active alerts</p>}
                </div>
              )}
            </div>

            {/* User avatar + logout */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg, #3b82f6, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem' }}>
                {user.name?.charAt(0)}
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: 500, display: 'none' }}>{user.name}</span>
            </div>
            <button onClick={handleLogout} className="btn-ghost" style={{ padding: '6px 12px', display: 'flex', alignItems: 'center', gap: 6 }}>
              <LogOut size={16} />
              <span style={{ fontSize: '0.85rem' }}>Logout</span>
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}
