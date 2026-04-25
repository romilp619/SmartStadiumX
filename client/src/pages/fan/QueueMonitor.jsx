import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import api from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import { Trophy, Map, Clock, ShoppingBag, Ticket, Star, RefreshCw } from 'lucide-react';

const sidebarItems = [
  { path: '/fan', label: 'Dashboard', icon: Trophy },
  { path: '/fan/navigate', label: 'Navigation', icon: Map },
  { path: '/fan/queue', label: 'Queue Monitor', icon: Clock },
  { path: '/fan/order', label: 'Food Order', icon: ShoppingBag },
  { path: '/fan/orders', label: 'My Orders', icon: Ticket },
  { path: '/fan/rewards', label: 'Rewards', icon: Star },
];

export default function QueueMonitor() {
  const { socket } = useSocket();
  const navigate = useNavigate();
  const [stalls, setStalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const loadStalls = async () => {
    try {
      const r = await api.get('/stalls');
      setStalls(r.data.stalls);
      setLastUpdated(new Date());
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { loadStalls(); }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on('stall:update', ({ stallId, isOpen, currentQueueLength, estimatedWaitTime }) => {
      setStalls(prev => prev.map(s => s._id === stallId ? { ...s, isOpen, currentQueueLength, estimatedWaitTime } : s));
      setLastUpdated(new Date());
    });
    return () => socket.off('stall:update');
  }, [socket]);

  const waitColor = (mins) => {
    if (mins <= 5) return '#10b981';
    if (mins <= 15) return '#f59e0b';
    return '#ef4444';
  };

  const sortedStalls = [...stalls].sort((a, b) => a.estimatedWaitTime - b.estimatedWaitTime);

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />
      <div style={{ display: 'flex' }}>
        <Sidebar items={sidebarItems} />
        <main style={{ flex: 1, padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div>
              <h1 style={{ fontFamily: 'Outfit', fontSize: '1.8rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
                <Clock size={28} color="#10b981" /> Queue Monitor
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginTop: 4 }}>
                Last updated: {lastUpdated.toLocaleTimeString()} · Updates in real-time
              </p>
            </div>
            <button onClick={loadStalls} className="btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <RefreshCw size={16} /> Refresh
            </button>
          </div>

          {/* Summary */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
            {[
              { label: 'Open Stalls', value: stalls.filter(s => s.isOpen).length, color: '#10b981' },
              { label: 'Avg Wait Time', value: `${Math.round(stalls.reduce((s, st) => s + st.estimatedWaitTime, 0) / (stalls.length || 1))} min`, color: '#f59e0b' },
              { label: 'Lowest Wait', value: `${Math.min(...stalls.map(s => s.estimatedWaitTime), 99)} min`, color: '#3b82f6' },
            ].map(s => (
              <div key={s.label} className="stat-card">
                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>{s.label}</p>
                <p style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '2rem', color: s.color, marginTop: 4 }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Stall Cards */}
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
              {[1,2,3].map(i => <div key={i} className="shimmer" style={{ height: 200, borderRadius: 16 }} />)}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
              {sortedStalls.map(stall => {
                const wc = waitColor(stall.estimatedWaitTime);
                return (
                  <div key={stall._id} className="glass-card fade-in" style={{ padding: '1.5rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <div>
                        <h3 style={{ fontWeight: 700, fontSize: '1rem' }}>{stall.name}</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: 2 }}>{stall.stallNumber} · {stall.zone}</p>
                      </div>
                      <span className={stall.isOpen ? 'badge badge-green' : 'badge badge-red'}>
                        {stall.isOpen ? '● OPEN' : '● CLOSED'}
                      </span>
                    </div>

                    {/* Wait time */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1rem', background: `${wc}15`, borderRadius: 12, padding: '0.75rem' }}>
                      <Clock size={24} color={wc} />
                      <div>
                        <p style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'Outfit', color: wc }}>{stall.estimatedWaitTime} min</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Estimated wait</p>
                      </div>
                      <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
                        <p style={{ fontWeight: 700, color: 'var(--text-primary)' }}>{stall.currentQueueLength}</p>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>in queue</p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <span style={{ color: '#fbbf24' }}>⭐</span>
                        <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{stall.rating}</span>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>· {stall.cuisine}</span>
                      </div>
                      <button onClick={() => navigate('/fan/order')} className="btn-primary" style={{ padding: '0.4rem 1rem', fontSize: '0.82rem' }}>
                        Order Now
                      </button>
                    </div>
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
