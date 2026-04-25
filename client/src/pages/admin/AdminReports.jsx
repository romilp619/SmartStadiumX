import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import api from '../../services/api';
import { LayoutDashboard, Map, AlertTriangle, BarChart2, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const sidebarItems = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/crowd', label: 'Crowd Management', icon: Map },
  { path: '/admin/incidents', label: 'Incidents', icon: AlertTriangle },
  { path: '/admin/reports', label: 'Reports', icon: BarChart2 },
];

const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];

export default function AdminReports() {
  const [stalls, setStalls] = useState([]);
  const [userStats, setUserStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/analytics/revenue'), api.get('/analytics/users')])
      .then(([r, u]) => { setStalls(r.data.stalls); setUserStats(u.data.stats); })
      .finally(() => setLoading(false));
  }, []);

  const totalRevenue = stalls.reduce((s, st) => s + st.revenue, 0);
  const totalOrders = stalls.reduce((s, st) => s + st.totalOrdersToday, 0);
  const userPieData = userStats ? [
    { name: 'Fans', value: userStats.fans },
    { name: 'Staff', value: userStats.staff },
    { name: 'Vendors', value: userStats.vendors },
  ] : [];

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />
      <div style={{ display: 'flex' }}>
        <Sidebar items={sidebarItems} />
        <main style={{ flex: 1, padding: '2rem' }}>
          <h1 style={{ fontFamily: 'Outfit', fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: 10 }}>
            <BarChart2 size={28} color="#8b5cf6" /> Reports & Analytics
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Today's venue performance summary</p>

          {/* Summary Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '2rem' }}>
            <div className="stat-card"><p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Total Revenue</p><p style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '2rem', color: '#10b981' }}>₹{(totalRevenue / 1000).toFixed(1)}K</p></div>
            <div className="stat-card"><p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Total Orders</p><p style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '2rem', color: '#f59e0b' }}>{totalOrders}</p></div>
            <div className="stat-card"><p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', fontWeight: 600, textTransform: 'uppercase' }}>Avg Order Value</p><p style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '2rem', color: '#3b82f6' }}>₹{totalOrders ? Math.round(totalRevenue / totalOrders) : 0}</p></div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
            {/* Revenue by Stall */}
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <h2 style={{ fontFamily: 'Outfit', fontWeight: 700, marginBottom: '1rem', fontSize: '1rem' }}>Revenue by Stall</h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={stalls.map(s => ({ name: s.name.split(' ')[0], revenue: s.revenue }))}>
                  <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#94a3b8', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${(v/1000).toFixed(0)}K`} />
                  <Tooltip contentStyle={{ background: '#151d2e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, color: '#f1f5f9' }} formatter={v => [`₹${v.toLocaleString()}`, 'Revenue']} />
                  <Bar dataKey="revenue" fill="#3b82f6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* User distribution */}
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <h2 style={{ fontFamily: 'Outfit', fontWeight: 700, marginBottom: '1rem', fontSize: '1rem' }}>User Distribution</h2>
              <ResponsiveContainer width="100%" height={220}>
                <PieChart>
                  <Pie data={userPieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                    {userPieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Legend />
                  <Tooltip contentStyle={{ background: '#151d2e', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Stall Table */}
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontFamily: 'Outfit', fontWeight: 700, marginBottom: '1rem', fontSize: '1rem' }}>Stall Performance</h2>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr>
                    {['Stall', 'Zone', 'Orders Today', 'Revenue', 'Rating', 'Status'].map(h => (
                      <th key={h} style={{ textAlign: 'left', padding: '0.5rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.75rem', textTransform: 'uppercase' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {stalls.map(s => (
                    <tr key={s._id} style={{ borderTop: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '0.6rem 0.5rem', fontWeight: 600 }}>{s.name}</td>
                      <td style={{ padding: '0.6rem 0.5rem', color: 'var(--text-secondary)' }}>{s.zone}</td>
                      <td style={{ padding: '0.6rem 0.5rem' }}>{s.totalOrdersToday}</td>
                      <td style={{ padding: '0.6rem 0.5rem', color: '#10b981', fontWeight: 600 }}>₹{s.revenue.toLocaleString()}</td>
                      <td style={{ padding: '0.6rem 0.5rem', color: '#fbbf24' }}>⭐ {s.rating}</td>
                      <td style={{ padding: '0.6rem 0.5rem' }}><span className="badge badge-green">Open</span></td>
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
