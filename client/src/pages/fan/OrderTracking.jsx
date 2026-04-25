import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import api from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import { Trophy, Map, Clock, ShoppingBag, Ticket, Star, CheckCircle, Package } from 'lucide-react';

const sidebarItems = [
  { path: '/fan', label: 'Dashboard', icon: Trophy },
  { path: '/fan/navigate', label: 'Navigation', icon: Map },
  { path: '/fan/queue', label: 'Queue Monitor', icon: Clock },
  { path: '/fan/order', label: 'Food Order', icon: ShoppingBag },
  { path: '/fan/orders', label: 'My Orders', icon: Ticket },
  { path: '/fan/rewards', label: 'Rewards', icon: Star },
];

const statusSteps = ['placed', 'confirmed', 'preparing', 'ready', 'delivered'];
const statusIcons = { placed: '📋', confirmed: '✅', preparing: '👨‍🍳', ready: '📦', delivered: '🎉', cancelled: '❌' };
const statusColors = { placed: '#3b82f6', confirmed: '#8b5cf6', preparing: '#f59e0b', ready: '#10b981', delivered: '#10b981', cancelled: '#ef4444' };

export default function OrderTracking() {
  const { socket } = useSocket();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders/my').then(r => setOrders(r.data.orders)).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on('order:statusUpdate', ({ orderId, status }) => {
      setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status } : o));
    });
    return () => socket.off('order:statusUpdate');
  }, [socket]);

  const activeOrders = orders.filter(o => !['delivered', 'cancelled'].includes(o.status));
  const pastOrders = orders.filter(o => ['delivered', 'cancelled'].includes(o.status));

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />
      <div style={{ display: 'flex' }}>
        <Sidebar items={sidebarItems} />
        <main style={{ flex: 1, padding: '2rem' }}>
          <h1 style={{ fontFamily: 'Outfit', fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Package size={28} color="#3b82f6" /> Order Tracking
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Live status updates</p>

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {[1,2].map(i => <div key={i} className="shimmer" style={{ height: 200, borderRadius: 16 }} />)}
            </div>
          ) : orders.length === 0 ? (
            <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
              <ShoppingBag size={50} style={{ margin: '0 auto 1rem', opacity: 0.2 }} />
              <p style={{ color: 'var(--text-secondary)' }}>No orders yet. <a href="/fan/order" style={{ color: '#60a5fa' }}>Order some food!</a></p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {[...activeOrders, ...pastOrders].map(order => {
                const stepIdx = statusSteps.indexOf(order.status);
                const sc = statusColors[order.status] || '#94a3b8';
                return (
                  <div key={order._id} className="glass-card fade-in" style={{ padding: '1.5rem', borderLeft: `3px solid ${sc}` }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <div>
                        <p style={{ fontWeight: 700 }}>{order.stall?.name}</p>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>#{order.orderId} · {new Date(order.createdAt).toLocaleTimeString()}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <span style={{ fontSize: '1.2rem' }}>{statusIcons[order.status]}</span>
                        <p style={{ fontSize: '0.75rem', fontWeight: 700, color: sc, textTransform: 'uppercase' }}>{order.status}</p>
                      </div>
                    </div>

                    <div style={{ marginBottom: '1rem', padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: 10 }}>
                      {order.items.map(item => (
                        <div key={item.menuItem} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', padding: '2px 0' }}>
                          <span>{item.name} × {item.quantity}</span>
                          <span style={{ color: '#fbbf24' }}>₹{item.subtotal}</span>
                        </div>
                      ))}
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, marginTop: 8, paddingTop: 8, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                        <span>Total</span><span style={{ color: '#fbbf24' }}>₹{order.totalAmount}</span>
                      </div>
                    </div>

                    {order.status !== 'cancelled' && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        {statusSteps.map((step, i) => (
                          <div key={step} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                            <div style={{ width: 24, height: 24, borderRadius: '50%', background: i <= stepIdx ? sc : 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.3s' }}>
                              {i < stepIdx ? <CheckCircle size={14} color="white" /> : <div style={{ width: 8, height: 8, borderRadius: '50%', background: i === stepIdx ? 'white' : 'transparent' }} />}
                            </div>
                            <p style={{ fontSize: '0.6rem', color: i <= stepIdx ? sc : 'var(--text-secondary)', marginTop: 4, textTransform: 'capitalize', fontWeight: i === stepIdx ? 700 : 400 }}>{step}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    {order.rewardPointsEarned > 0 && order.status === 'delivered' && (
                      <p style={{ fontSize: '0.8rem', color: '#10b981', marginTop: 8 }}>+{order.rewardPointsEarned} pts earned ⭐</p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
