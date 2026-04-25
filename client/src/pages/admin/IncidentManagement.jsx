import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useSocket } from '../../context/SocketContext';
import { LayoutDashboard, Map, AlertTriangle, BarChart2, Plus, X, Zap } from 'lucide-react';

const sidebarItems = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/crowd', label: 'Crowd Management', icon: Map },
  { path: '/admin/incidents', label: 'Incidents', icon: AlertTriangle },
  { path: '/admin/reports', label: 'Reports', icon: BarChart2 },
];

const alertTypes = ['emergency', 'gate', 'match', 'crowd', 'general'];
const severities = ['info', 'warning', 'critical'];
const severityColors = { info: '#3b82f6', warning: '#f59e0b', critical: '#ef4444' };

export default function IncidentManagement() {
  const { socket } = useSocket();
  const [alerts, setAlerts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ type: 'general', title: '', message: '', severity: 'info', targetZone: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.get('/alerts').then(r => setAlerts(r.data.alerts));
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on('alert:new', ({ alert }) => setAlerts(prev => [alert, ...prev]));
    socket.on('alert:deactivated', ({ alertId }) => setAlerts(prev => prev.map(a => a._id === alertId ? { ...a, isActive: false } : a)));
    return () => { socket.off('alert:new'); socket.off('alert:deactivated'); };
  }, [socket]);

  const sendAlert = async () => {
    if (!form.title || !form.message) return toast.error('Fill in title and message');
    setSubmitting(true);
    try {
      const r = await api.post('/alerts', { ...form, targetRoles: ['all'] });
      toast.success('Alert broadcasted!');
      setAlerts(prev => [r.data.alert, ...prev]);
      setShowForm(false);
      setForm({ type: 'general', title: '', message: '', severity: 'info', targetZone: '' });
    } catch (e) { toast.error('Failed to send alert'); }
    finally { setSubmitting(false); }
  };

  const deactivate = async (id) => {
    try {
      await api.put(`/alerts/${id}/deactivate`);
      toast.success('Alert deactivated');
    } catch (e) { toast.error('Error'); }
  };

  const quickAlerts = [
    { title: '🚨 Emergency Evacuation', message: 'Evacuate Zone D immediately via Exit D1. Follow staff instructions.', type: 'emergency', severity: 'critical' },
    { title: '⚠️ Gate 2 Congested', message: 'Gate 2 is at capacity. Please use Gate 3 or Gate 4 as alternative.', type: 'gate', severity: 'warning' },
    { title: '⚽ Kickoff in 15 Minutes', message: 'The match begins in 15 minutes. Please find your seats.', type: 'match', severity: 'info' },
    { title: '👥 Zone A Overcrowded', message: 'Zone A has reached capacity. Please reroute to Zone B or C.', type: 'crowd', severity: 'warning' },
  ];

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />
      <div style={{ display: 'flex' }}>
        <Sidebar items={sidebarItems} />
        <main style={{ flex: 1, padding: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
            <div>
              <h1 style={{ fontFamily: 'Outfit', fontSize: '1.8rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: 10 }}>
                <AlertTriangle size={28} color="#ef4444" /> Incident Management
              </h1>
              <p style={{ color: 'var(--text-secondary)' }}>Broadcast alerts to fans, staff, and vendors</p>
            </div>
            <button onClick={() => setShowForm(!showForm)} className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Plus size={16} /> New Alert
            </button>
          </div>

          {showForm && (
            <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
              <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, marginBottom: '1.25rem' }}>Create Alert</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Type</label>
                  <select className="input-field" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                    {alertTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Severity</label>
                  <select className="input-field" value={form.severity} onChange={e => setForm(f => ({ ...f, severity: e.target.value }))}>
                    {severities.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Title</label>
                <input type="text" className="input-field" placeholder="Alert title..." value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Message</label>
                <textarea className="input-field" rows={3} placeholder="Alert message..." value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} style={{ resize: 'vertical' }} />
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={sendAlert} disabled={submitting} className="btn-danger" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Zap size={16} /> {submitting ? 'Broadcasting...' : 'Broadcast Now'}
                </button>
                <button onClick={() => setShowForm(false)} className="btn-ghost">Cancel</button>
              </div>
            </div>
          )}

          {/* Quick Alerts */}
          <div style={{ marginBottom: '1.5rem' }}>
            <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', fontWeight: 600, marginBottom: '0.75rem', textTransform: 'uppercase' }}>Quick Templates</p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '0.75rem' }}>
              {quickAlerts.map(qa => {
                const sc = severityColors[qa.severity];
                return (
                  <button key={qa.title} onClick={async () => {
                    try {
                      await api.post('/alerts', { ...qa, targetRoles: ['all'] });
                      toast.success('Alert sent!');
                      const r = await api.get('/alerts');
                      setAlerts(r.data.alerts);
                    } catch (e) { toast.error('Failed'); }
                  }} style={{ background: `${sc}10`, border: `1px solid ${sc}30`, borderRadius: 10, padding: '0.75rem', cursor: 'pointer', textAlign: 'left', color: 'var(--text-primary)', transition: 'all 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.background = `${sc}20`}
                    onMouseLeave={e => e.currentTarget.style.background = `${sc}10`}>
                    <p style={{ fontWeight: 600, fontSize: '0.85rem' }}>{qa.title}</p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: 4 }}>{qa.message.slice(0, 60)}...</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Alert Log */}
          <h2 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '1.1rem', marginBottom: '1rem' }}>Alert Log</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {alerts.map(a => {
              const sc = severityColors[a.severity] || '#94a3b8';
              return (
                <div key={a._id} className="glass-card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '1rem', borderLeft: `3px solid ${sc}`, opacity: a.isActive ? 1 : 0.5 }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>{a.title}</span>
                      <span className={`badge badge-${a.severity === 'critical' ? 'red' : a.severity === 'warning' ? 'amber' : 'blue'}`}>{a.severity}</span>
                      {!a.isActive && <span className="badge badge-gray">INACTIVE</span>}
                    </div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{a.message}</p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.72rem', marginTop: 4 }}>{new Date(a.createdAt).toLocaleString()}</p>
                  </div>
                  {a.isActive && (
                    <button onClick={() => deactivate(a._id)} style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '0.4rem 0.8rem', cursor: 'pointer', color: '#f87171', fontSize: '0.8rem', fontWeight: 600 }}>
                      Deactivate
                    </button>
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
