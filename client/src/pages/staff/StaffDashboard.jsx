import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import { LayoutDashboard, AlertTriangle, MapPin, Zap, Bell } from 'lucide-react';

const sidebarItems = [
  { path: '/staff', label: 'Dashboard', icon: LayoutDashboard },
];

export default function StaffDashboard() {
  const { user } = useAuth();
  const { socket } = useSocket();
  const [zones, setZones] = useState([]);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    Promise.all([api.get('/zones'), api.get('/alerts/active')])
      .then(([z, a]) => { setZones(z.data.zones); setAlerts(a.data.alerts); });
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on('zone:update', ({ zone }) => setZones(prev => prev.map(z => z._id === zone._id ? { ...z, ...zone } : z)));
    socket.on('alert:new', ({ alert }) => setAlerts(prev => [alert, ...prev]));
    return () => { socket.off('zone:update'); socket.off('alert:new'); };
  }, [socket]);

  const congestionColors = { low: '#10b981', medium: '#f59e0b', high: '#fb923c', critical: '#ef4444' };
  const criticalZones = zones.filter(z => z.congestionLevel === 'critical' || z.congestionLevel === 'high');

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar alerts={alerts} />
      <div style={{ display: 'flex' }}>
        <Sidebar items={sidebarItems} />
        <main style={{ flex: 1, padding: '2rem' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontFamily: 'Outfit', fontSize: '2rem', fontWeight: 800 }}>Staff Dashboard</h1>
            <p style={{ color: 'var(--text-secondary)' }}>
              Welcome, {user?.name} · <span style={{ color: '#f59e0b' }}>Assigned: {user?.assignedZone || 'All Zones'}</span>
            </p>
          </div>

          {/* Critical Alerts */}
          {alerts.filter(a => a.severity === 'critical').map(a => (
            <div key={a._id} style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: 12, padding: '1rem 1.5rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 12 }}>
              <AlertTriangle size={20} color="#ef4444" />
              <div>
                <p style={{ fontWeight: 700, color: '#f87171' }}>{a.title}</p>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{a.message}</p>
              </div>
            </div>
          ))}

          {/* Priority zones */}
          {criticalZones.length > 0 && (
            <div style={{ marginBottom: '2rem' }}>
              <h2 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '1.1rem', marginBottom: '1rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: 8 }}>
                <Zap size={20} /> Zones Requiring Attention
              </h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
                {criticalZones.map(z => {
                  const c = congestionColors[z.congestionLevel];
                  return (
                    <div key={z._id} className="glass-card" style={{ padding: '1.5rem', borderLeft: `3px solid ${c}` }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <p style={{ fontWeight: 700 }}>{z.label}</p>
                        <span style={{ fontSize: '0.72rem', fontWeight: 700, color: c, background: `${c}20`, padding: '2px 8px', borderRadius: 99 }}>{z.congestionLevel?.toUpperCase()}</span>
                      </div>
                      <div className="progress-bar-outer">
                        <div className="progress-bar-inner" style={{ width: `${Math.round((z.currentOccupancy/z.capacity)*100)}%`, background: c }} />
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 6 }}>
                        {z.currentOccupancy?.toLocaleString()} / {z.capacity?.toLocaleString()}
                      </p>
                      {z.isRerouting && <p style={{ color: '#fbbf24', fontSize: '0.8rem', marginTop: 6 }}>⚠️ Rerouting active — assist fans</p>}
                      <div style={{ marginTop: '0.75rem', padding: '0.6rem', background: 'rgba(255,255,255,0.04)', borderRadius: 8 }}>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>Exits: {z.exits?.join(', ')}</p>
                        <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 2 }}>Restrooms: {z.restrooms}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* All Zones */}
          <h2 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <MapPin size={20} color="#3b82f6" /> All Zones Status
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1rem' }}>
            {zones.map(z => {
              const c = congestionColors[z.congestionLevel] || '#94a3b8';
              const pct = z.capacity ? Math.round((z.currentOccupancy / z.capacity) * 100) : 0;
              return (
                <div key={z._id} className="glass-card" style={{ padding: '1rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                    <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{z.label}</p>
                    <span style={{ color: c, fontSize: '0.72rem', fontWeight: 700 }}>{pct}%</span>
                  </div>
                  <div className="progress-bar-outer">
                    <div className="progress-bar-inner" style={{ width: `${pct}%`, background: c }} />
                  </div>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 4 }}>{z.currentOccupancy?.toLocaleString()} attendees</p>
                </div>
              );
            })}
          </div>

          {/* Active Alerts */}
          <div style={{ marginTop: '2rem' }}>
            <h2 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Bell size={20} color="#8b5cf6" /> Active Alerts
            </h2>
            {alerts.filter(a => a.isActive).map(a => (
              <div key={a._id} className="glass-card" style={{ padding: '1rem', marginBottom: '0.75rem', borderLeft: `3px solid ${a.severity === 'critical' ? '#ef4444' : a.severity === 'warning' ? '#f59e0b' : '#3b82f6'}` }}>
                <p style={{ fontWeight: 600 }}>{a.title}</p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{a.message}</p>
              </div>
            ))}
            {alerts.filter(a => a.isActive).length === 0 && <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>No active alerts. All clear ✅</p>}
          </div>
        </main>
      </div>
    </div>
  );
}
