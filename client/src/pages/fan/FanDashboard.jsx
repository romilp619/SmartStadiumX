import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import api from '../../services/api';
import { Ticket, Map, Clock, ShoppingBag, Bell, Star, ChevronRight, Trophy, Zap, AlertTriangle, Tv2 } from 'lucide-react';

const sidebarItems = [
  { path: '/fan', label: 'Dashboard', icon: Trophy },
  { path: '/fan/navigate', label: 'Navigation', icon: Map },
  { path: '/fan/queue', label: 'Queue Monitor', icon: Clock },
  { path: '/fan/order', label: 'Food Order', icon: ShoppingBag },
  { path: '/fan/orders', label: 'My Orders', icon: Ticket },
  { path: '/fan/rewards', label: 'Rewards', icon: Star },
  { path: '/ipl', label: '🏏 IPL Live', icon: Zap },
];

export default function FanDashboard() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const navigate = useNavigate();
  const [tickets, setTickets] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [t, a, z] = await Promise.all([
          api.get('/tickets/my'),
          api.get('/alerts/active'),
          api.get('/zones'),
        ]);
        setTickets(t.data.tickets);
        setAlerts(a.data.alerts);
        setZones(z.data.zones);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on('alert:new', ({ alert }) => setAlerts(prev => [alert, ...prev]));
    socket.on('zone:update', ({ zone }) => setZones(prev => prev.map(z => z._id === zone._id ? zone : z)));
    return () => { socket.off('alert:new'); socket.off('zone:update'); };
  }, [socket]);

  const criticalAlerts = alerts.filter(a => a.severity === 'critical' && a.isActive);
  const myZone = tickets[0]?.zone || '';

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar alerts={alerts} />
      <div style={{ display: 'flex' }}>
        <Sidebar items={sidebarItems} />
        <main style={{ flex: 1, padding: '2rem', maxWidth: 1100 }}>
          {/* Emergency banner */}
          {criticalAlerts.map(a => (
            <div key={a._id} style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: 12, padding: '1rem 1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: 12 }}>
              <AlertTriangle size={20} color="#ef4444" />
              <div>
                <p style={{ fontWeight: 700, color: '#f87171' }}>{a.title}</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{a.message}</p>
              </div>
            </div>
          ))}

          {/* Welcome */}
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontFamily: 'Outfit', fontSize: '2rem', fontWeight: 800, marginBottom: 4 }}>
              Hey, {user?.name?.split(' ')[0]} 👋
            </h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              {user?.rewardPoints || 0} reward points · Match day experience
            </p>
          </div>

          {/* Tickets */}
          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Ticket size={20} color="#3b82f6" /> My Tickets
            </h2>
            {loading ? (
              <div className="shimmer" style={{ height: 100, borderRadius: 16 }} />
            ) : tickets.length === 0 ? (
              <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <Ticket size={40} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                <p>No tickets found. Contact the admin to get your ticket assigned.</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                {tickets.map(t => (
                  <div key={t._id} className="glass-card fade-in" style={{ padding: '1.5rem', cursor: 'pointer', transition: 'transform 0.2s' }}
                    onClick={() => navigate(`/fan/ticket/${t._id}`)}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                      <span className={`badge ${t.category === 'vip' ? 'badge-purple' : 'badge-blue'}`}>{t.category?.toUpperCase()}</span>
                      <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>#{t.ticketId}</span>
                    </div>
                    <p style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: 4 }}>{t.event?.title || 'Event'}</p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', marginBottom: 8 }}>
                      {new Date(t.event?.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })} · {t.event?.kickoffTime}
                    </p>
                    <div style={{ display: 'flex', gap: 12, fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                      <span>📍 {t.zone}</span>
                      <span>🚪 {t.gate}</span>
                      <span>💺 {t.seat?.section}{t.seat?.row}-{t.seat?.number}</span>
                    </div>
                    <p style={{ marginTop: '0.75rem', color: '#60a5fa', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 4 }}>
                      View QR Ticket <ChevronRight size={14} />
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Quick Actions */}
          <section style={{ marginBottom: '2rem' }}>
            <h2 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '1.2rem', marginBottom: '1rem' }}>Quick Actions</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1rem' }}>
              {[
                { label: 'Navigate', icon: Map, path: '/fan/navigate', color: '#3b82f6', desc: 'Find your way' },
                { label: 'Queue Times', icon: Clock, path: '/fan/queue', color: '#10b981', desc: 'Live wait times' },
                { label: 'Order Food', icon: ShoppingBag, path: '/fan/order', color: '#f59e0b', desc: 'Browse menus' },
                { label: 'My Rewards', icon: Star, path: '/fan/rewards', color: '#8b5cf6', desc: `${user?.rewardPoints || 0} pts` },
              ].map(action => {
                const Icon = action.icon;
                return (
                  <button key={action.label} onClick={() => navigate(action.path)}
                    style={{ background: `${action.color}15`, border: `1px solid ${action.color}30`, borderRadius: 14, padding: '1.25rem', cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s' }}
                    onMouseEnter={e => { e.currentTarget.style.background = `${action.color}25`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = `${action.color}15`; e.currentTarget.style.transform = 'translateY(0)'; }}>
                    <Icon size={24} color={action.color} style={{ marginBottom: 8 }} />
                    <p style={{ fontWeight: 700, color: 'var(--text-primary)', fontSize: '0.95rem' }}>{action.label}</p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginTop: 2 }}>{action.desc}</p>
                  </button>
                );
              })}
            </div>
          </section>

          {/* Zone Status */}
          <section>
            <h2 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Zap size={20} color="#f59e0b" /> Live Zone Status
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
              {zones.map(z => {
                const pct = z.capacity ? Math.round((z.currentOccupancy / z.capacity) * 100) : 0;
                const colors = { low: '#10b981', medium: '#f59e0b', high: '#fb923c', critical: '#ef4444' };
                const c = colors[z.congestionLevel] || '#94a3b8';
                return (
                  <div key={z._id} className="glass-card" style={{ padding: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                      <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{z.label}</p>
                      <span style={{ fontSize: '0.7rem', fontWeight: 700, color: c, background: `${c}20`, padding: '2px 8px', borderRadius: 99 }}>{z.congestionLevel?.toUpperCase()}</span>
                    </div>
                    <div className="progress-bar-outer">
                      <div className="progress-bar-inner" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${c}80, ${c})` }} />
                    </div>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 6 }}>
                      {z.currentOccupancy.toLocaleString()} / {z.capacity.toLocaleString()} · {pct}% full
                    </p>
                    {z.isRerouting && <p style={{ fontSize: '0.75rem', color: '#fbbf24', marginTop: 6 }}>⚠️ {z.rerouteMessage}</p>}
                  </div>
                );
              })}
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}
