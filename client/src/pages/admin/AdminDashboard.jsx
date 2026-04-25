import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import StatCard from '../../components/StatCard';
import api from '../../services/api';
import { useSocket } from '../../context/SocketContext';
import { LayoutDashboard, Map, AlertTriangle, BarChart2, Users, ShoppingBag, Trophy, TrendingUp, Activity, Zap } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const sidebarItems = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/crowd', label: 'Crowd Management', icon: Map },
  { path: '/admin/incidents', label: 'Incidents', icon: AlertTriangle },
  { path: '/admin/reports', label: 'Reports', icon: BarChart2 },
];

const mockChartData = Array.from({ length: 12 }, (_, i) => ({
  time: `${8 + i}:00`,
  orders: Math.floor(30 + Math.random() * 80),
  occupancy: Math.floor(40000 + Math.random() * 10000),
}));

export default function AdminDashboard() {
  const { socket } = useSocket();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [zones, setZones] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics/dashboard').then(r => {
      setStats(r.data.stats);
      setZones(r.data.zones);
      setRecentOrders(r.data.recentOrders);
    }).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on('zone:update', ({ zone }) => setZones(prev => prev.map(z => z._id === zone._id ? { ...z, ...zone } : z)));
    return () => socket.off('zone:update');
  }, [socket]);

  const congestionColors = { low: '#10b981', medium: '#f59e0b', high: '#fb923c', critical: '#ef4444' };

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />
      <div style={{ display: 'flex' }}>
        <Sidebar items={sidebarItems} />
        <main style={{ flex: 1, padding: '2rem', maxWidth: 1200 }}>
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontFamily: 'Outfit', fontSize: '2rem', fontWeight: 800 }}>Admin Command Centre</h1>
            <p style={{ color: 'var(--text-secondary)' }}>Live stadium operations dashboard</p>
          </div>

          {/* Stats */}
          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              {[1,2,3,4].map(i => <div key={i} className="shimmer" style={{ height: 100, borderRadius: 16 }} />)}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
              <StatCard label="Total Users" value={stats?.totalUsers || 0} icon={Users} color="#3b82f6" trend={12} />
              <StatCard label="Active Orders" value={stats?.activeOrders || 0} icon={ShoppingBag} color="#f59e0b" trend={-3} />
              <StatCard label="Occupancy" value={`${Math.round(((stats?.totalOccupancy || 0) / (stats?.totalCapacity || 1)) * 100)}%`} icon={Activity} color="#10b981" sub={`${(stats?.totalOccupancy || 0).toLocaleString()} attendees`} />
              <StatCard label="Revenue Today" value={`₹${((stats?.totalRevenue || 0) / 1000).toFixed(0)}K`} icon={TrendingUp} color="#8b5cf6" trend={8} />
            </div>
          )}

          {/* Live Event Banner */}
          {stats?.liveEvents > 0 && (
            <div style={{ background: 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(239,68,68,0.05))', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 14, padding: '1rem 1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444', animation: 'pulse 1s infinite' }} />
              <p style={{ fontWeight: 700, color: '#f87171' }}>🔴 LIVE — City Wolves vs Red Eagles · SmartStadiumX Arena</p>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
            {/* Zone status */}
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h2 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '1.1rem' }}>Zone Congestion</h2>
                <button onClick={() => navigate('/admin/crowd')} style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}>Manage →</button>
              </div>
              {zones.map(z => {
                const pct = Math.round((z.currentOccupancy / z.capacity) * 100);
                const c = congestionColors[z.congestionLevel] || '#94a3b8';
                return (
                  <div key={z._id} style={{ marginBottom: '0.75rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{z.label}</span>
                      <span style={{ fontSize: '0.75rem', color: c, fontWeight: 700 }}>{pct}%</span>
                    </div>
                    <div className="progress-bar-outer">
                      <div className="progress-bar-inner" style={{ width: `${pct}%`, background: `linear-gradient(90deg, ${c}80, ${c})` }} />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Orders chart */}
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <h2 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '1.1rem', marginBottom: '1rem' }}>Orders — Today</h2>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={mockChartData}>
                  <XAxis dataKey="time" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ background: '#151d2e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#f1f5f9' }} />
                  <Line type="monotone" dataKey="orders" stroke="#3b82f6" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Recent Orders */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '1.1rem', marginBottom: '1rem' }}>Recent Orders</h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr>
                    {['Order ID', 'Fan', 'Stall', 'Amount', 'Status', 'Time'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '0.5rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map(o => (
                    <tr key={o._id} style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '0.6rem 0.5rem', fontFamily: 'monospace', color: '#60a5fa' }}>{o.orderId}</td>
                      <td style={{ padding: '0.6rem 0.5rem' }}>{o.fan?.name}</td>
                      <td style={{ padding: '0.6rem 0.5rem' }}>{o.stall?.name}</td>
                      <td style={{ padding: '0.6rem 0.5rem', color: '#fbbf24', fontWeight: 600 }}>₹{o.totalAmount}</td>
                      <td style={{ padding: '0.6rem 0.5rem' }}>
                        <span className={`badge badge-${o.status === 'delivered' ? 'green' : o.status === 'cancelled' ? 'red' : 'amber'}`}>{o.status}</span>
                      </td>
                      <td style={{ padding: '0.6rem 0.5rem', color: 'var(--text-secondary)' }}>{new Date(o.createdAt).toLocaleTimeString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
