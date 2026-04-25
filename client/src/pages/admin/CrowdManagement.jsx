import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useSocket } from '../../context/SocketContext';
import { LayoutDashboard, Map, AlertTriangle, BarChart2, Zap, RefreshCw } from 'lucide-react';

const sidebarItems = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/crowd', label: 'Crowd Management', icon: Map },
  { path: '/admin/incidents', label: 'Incidents', icon: AlertTriangle },
  { path: '/admin/reports', label: 'Reports', icon: BarChart2 },
];

const congestionLevels = ['low', 'medium', 'high', 'critical'];
const congestionColors = { low: '#10b981', medium: '#f59e0b', high: '#fb923c', critical: '#ef4444' };

export default function CrowdManagement() {
  const { socket } = useSocket();
  const [zones, setZones] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/zones').then(r => setZones(r.data.zones)).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on('zone:update', ({ zone }) => setZones(prev => prev.map(z => z._id === zone._id ? { ...z, ...zone } : z)));
    return () => socket.off('zone:update');
  }, [socket]);

  const startEdit = (zone) => {
    setEditing(zone._id);
    setForm({ currentOccupancy: zone.currentOccupancy, congestionLevel: zone.congestionLevel, isRerouting: zone.isRerouting, rerouteMessage: zone.rerouteMessage });
  };

  const saveZone = async (zoneId) => {
    try {
      await api.put(`/zones/${zoneId}/congestion`, form);
      toast.success('Zone updated!');
      setEditing(null);
    } catch (e) { toast.error('Update failed'); }
  };

  const simulate = () => {
    zones.forEach(z => {
      const levels = congestionLevels;
      const randomLevel = levels[Math.floor(Math.random() * levels.length)];
      socket?.emit('zone:simulate', { zone: { ...z, congestionLevel: randomLevel, currentOccupancy: Math.floor(Math.random() * z.capacity) } });
    });
    toast.success('Simulation sent! Crowd levels randomized.');
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />
      <div style={{ display: 'flex' }}>
        <Sidebar items={sidebarItems} />
        <main style={{ flex: 1, padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div>
              <h1 style={{ fontFamily: 'Outfit', fontSize: '1.8rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
                <Map size={28} color="#3b82f6" /> Crowd Management
              </h1>
              <p style={{ color: 'var(--text-secondary)' }}>Monitor and control zone congestion in real-time</p>
            </div>
            <button onClick={simulate} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Zap size={16} /> Simulate Movement
            </button>
          </div>

          {/* SVG Map */}
          <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <p style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>LIVE CROWD HEAT MAP</p>
            <svg viewBox="0 0 400 400" style={{ width: '100%', maxHeight: 320 }}>
              <rect x="115" y="130" width="170" height="140" rx="12" fill="rgba(16,185,129,0.1)" stroke="rgba(16,185,129,0.3)" strokeWidth="2" />
              <text x="200" y="200" textAnchor="middle" fill="rgba(16,185,129,0.5)" fontSize="12" fontWeight="700">PITCH</text>
              {zones.map(z => {
                const c = congestionColors[z.congestionLevel] || '#94a3b8';
                const pct = z.capacity ? (z.currentOccupancy / z.capacity) : 0;
                const positions = {
                  'zone-a': { x: 30, y: 15, w: 340, h: 65, tx: 200, ty: 52 },
                  'zone-b': { x: 30, y: 320, w: 340, h: 65, tx: 200, ty: 357 },
                  'zone-c': { x: 295, y: 90, w: 95, h: 220, tx: 342, ty: 200 },
                  'zone-d': { x: 10, y: 90, w: 95, h: 220, tx: 57, ty: 200 },
                  'zone-vip': { x: 130, y: 155, w: 140, h: 90, tx: 200, ty: 204 },
                };
                const pos = positions[z.name];
                if (!pos) return null;
                return (
                  <g key={z._id}>
                    <rect x={pos.x} y={pos.y} width={pos.w} height={pos.h} rx="10"
                      fill={`${c}${Math.round(pct * 80 + 20).toString(16).padStart(2,'0')}`}
                      stroke={c} strokeWidth="2" style={{ cursor: 'pointer' }}
                      onClick={() => startEdit(z)} />
                    <text x={pos.tx} y={pos.ty} textAnchor="middle" fill="white" fontSize="10" fontWeight="600">{z.label?.split(' - ')[0]}</text>
                    <text x={pos.tx} y={pos.ty + 14} textAnchor="middle" fill="rgba(255,255,255,0.7)" fontSize="9">{Math.round(pct * 100)}% full</text>
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Zone Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
            {zones.map(z => {
              const c = congestionColors[z.congestionLevel] || '#94a3b8';
              const pct = z.capacity ? Math.round((z.currentOccupancy / z.capacity) * 100) : 0;
              const isEdit = editing === z._id;
              return (
                <div key={z._id} className="glass-card" style={{ padding: '1.5rem', borderLeft: `3px solid ${c}` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <p style={{ fontWeight: 700 }}>{z.label}</p>
                    <span style={{ fontSize: '0.72rem', fontWeight: 700, color: c, background: `${c}20`, padding: '2px 8px', borderRadius: 99 }}>{z.congestionLevel?.toUpperCase()}</span>
                  </div>

                  {isEdit ? (
                    <div>
                      <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Occupancy</label>
                      <input type="number" className="input-field" style={{ marginBottom: 8 }} value={form.currentOccupancy} max={z.capacity}
                        onChange={e => setForm(f => ({ ...f, currentOccupancy: +e.target.value }))} />
                      <label style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Congestion Level</label>
                      <select className="input-field" style={{ marginBottom: 8 }} value={form.congestionLevel}
                        onChange={e => setForm(f => ({ ...f, congestionLevel: e.target.value }))}>
                        {congestionLevels.map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                        <input type="checkbox" id={`rerout-${z._id}`} checked={form.isRerouting}
                          onChange={e => setForm(f => ({ ...f, isRerouting: e.target.checked }))} />
                        <label htmlFor={`rerout-${z._id}`} style={{ fontSize: '0.82rem' }}>Enable Rerouting</label>
                      </div>
                      {form.isRerouting && (
                        <input type="text" className="input-field" style={{ marginBottom: 8 }} placeholder="Reroute message..." value={form.rerouteMessage}
                          onChange={e => setForm(f => ({ ...f, rerouteMessage: e.target.value }))} />
                      )}
                      <div style={{ display: 'flex', gap: 8 }}>
                        <button onClick={() => saveZone(z._id)} className="btn-success" style={{ flex: 1, padding: '0.5rem' }}>Save</button>
                        <button onClick={() => setEditing(null)} className="btn-ghost" style={{ flex: 1, padding: '0.5rem' }}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="progress-bar-outer" style={{ marginBottom: 8 }}>
                        <div className="progress-bar-inner" style={{ width: `${pct}%`, background: c }} />
                      </div>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                        {z.currentOccupancy?.toLocaleString()} / {z.capacity?.toLocaleString()} · {pct}%
                      </p>
                      {z.isRerouting && <p style={{ fontSize: '0.75rem', color: '#fbbf24', marginBottom: 8 }}>⚠️ Rerouting active</p>}
                      <button onClick={() => startEdit(z)} className="btn-ghost" style={{ width: '100%', padding: '0.45rem' }}>Edit Zone</button>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </main>
      </div>
    </div>
  );
}
