import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import api from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import toast from 'react-hot-toast';
import { LayoutDashboard, ChefHat, TrendingUp, Clock, CheckCircle } from 'lucide-react';

const sidebarItems = [
  { path: '/vendor', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/vendor/menu', label: 'Menu Management', icon: ChefHat },
];

const statusFlow = { placed: 'confirmed', confirmed: 'preparing', preparing: 'ready', ready: 'delivered' };
const statusColors = { placed: '#3b82f6', confirmed: '#8b5cf6', preparing: '#f59e0b', ready: '#10b981', delivered: '#10b981', cancelled: '#ef4444' };

export default function VendorDashboard() {
  const { socket } = useSocket();
  const [stall, setStall] = useState(null);
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');

  useEffect(() => {
    api.get('/stalls/my').then(r => {
      setStall(r.data.stall);
      return api.get(`/orders/stall/${r.data.stall._id}`);
    }).then(r => setOrders(r.data.orders)).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!socket || !stall) return;
    socket.emit('join:stall', stall._id);
    socket.on('order:new', ({ order }) => {
      setOrders(prev => [order, ...prev]);
      toast(`New order from ${order.fan?.name || 'Fan'}! 🍽️`);
    });
    return () => socket.off('order:new');
  }, [socket, stall]);

  const advanceOrder = async (orderId, currentStatus) => {
    const next = statusFlow[currentStatus];
    if (!next) return;
    try {
      await api.put(`/orders/${orderId}/status`, { status: next, note: `Updated to ${next}` });
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status: next } : o));
      toast.success(`Order ${next}`);
    } catch (e) { toast.error('Update failed'); }
  };

  const activeOrders = orders.filter(o => !['delivered', 'cancelled'].includes(o.status));
  const pastOrders = orders.filter(o => ['delivered', 'cancelled'].includes(o.status));

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />
      <div style={{ display: 'flex' }}>
        <Sidebar items={sidebarItems} />
        <main style={{ flex: 1, padding: '2rem' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontFamily: 'Outfit', fontSize: '2rem', fontWeight: 800 }}>{stall?.name || 'Vendor Dashboard'}</h1>
            <p style={{ color: 'var(--text-secondary)' }}>{stall?.stallNumber} · {stall?.zone} · {stall?.cuisine}</p>
          </div>

          {/* Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
            {[
              { label: 'Active Orders', value: activeOrders.length, color: '#3b82f6' },
              { label: 'In Queue', value: stall?.currentQueueLength || 0, color: '#f59e0b' },
              { label: 'Orders Today', value: stall?.totalOrdersToday || 0, color: '#8b5cf6' },
              { label: 'Revenue', value: `₹${((stall?.revenue || 0) / 1000).toFixed(1)}K`, color: '#10b981' },
            ].map(s => (
              <div key={s.label} className="stat-card">
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>{s.label}</p>
                <p style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.8rem', color: s.color, marginTop: 4 }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: '1.25rem' }}>
            {[['active', `Active (${activeOrders.length})`], ['past', `Completed (${pastOrders.length})`]].map(([tab, label]) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                style={{ padding: '0.5rem 1.25rem', borderRadius: 99, border: `1px solid ${activeTab === tab ? '#3b82f6' : 'rgba(255,255,255,0.1)'}`, background: activeTab === tab ? 'rgba(59,130,246,0.15)' : 'transparent', color: activeTab === tab ? '#60a5fa' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }}>
                {label}
              </button>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {(activeTab === 'active' ? activeOrders : pastOrders).map(order => {
              const sc = statusColors[order.status] || '#94a3b8';
              const next = statusFlow[order.status];
              return (
                <div key={order._id} className="glass-card fade-in" style={{ padding: '1.25rem', borderLeft: `3px solid ${sc}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div>
                      <p style={{ fontWeight: 700 }}>#{order.orderId}</p>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                        {order.fan?.name} · {new Date(order.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                    <span style={{ fontSize: '0.78rem', fontWeight: 700, color: sc, background: `${sc}20`, padding: '3px 10px', borderRadius: 99, textTransform: 'uppercase' }}>{order.status}</span>
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.75rem' }}>
                    {order.items.map(item => (
                      <span key={item.menuItem} style={{ background: 'rgba(255,255,255,0.06)', padding: '3px 10px', borderRadius: 6, fontSize: '0.8rem' }}>
                        {item.name} ×{item.quantity}
                      </span>
                    ))}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ fontWeight: 700, color: '#fbbf24' }}>₹{order.totalAmount}</p>
                    {next && (
                      <button onClick={() => advanceOrder(order._id, order.status)} className="btn-success" style={{ padding: '0.4rem 1rem', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <CheckCircle size={14} /> Mark as {next}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
            {(activeTab === 'active' ? activeOrders : pastOrders).length === 0 && (
              <div className="glass-card" style={{ padding: '2.5rem', textAlign: 'center' }}>
                <Clock size={40} style={{ margin: '0 auto 1rem', opacity: 0.2 }} />
                <p style={{ color: 'var(--text-secondary)' }}>{activeTab === 'active' ? 'No active orders. Waiting for orders...' : 'No completed orders yet.'}</p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
