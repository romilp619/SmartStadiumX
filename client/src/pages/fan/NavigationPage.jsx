import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import api from '../../services/api';
import { Trophy, Map, Clock, ShoppingBag, Ticket, Star, MapPin, Navigation, AlertTriangle } from 'lucide-react';
import { useSocket } from '../../context/SocketContext';

const sidebarItems = [
  { path: '/fan', label: 'Dashboard', icon: Trophy },
  { path: '/fan/navigate', label: 'Navigation', icon: Map },
  { path: '/fan/queue', label: 'Queue Monitor', icon: Clock },
  { path: '/fan/order', label: 'Food Order', icon: ShoppingBag },
  { path: '/fan/orders', label: 'My Orders', icon: Ticket },
  { path: '/fan/rewards', label: 'Rewards', icon: Star },
];

const zoneCoords = {
  'zone-a': { x: 30, y: 15, w: 220, h: 100, label: 'Zone A\nNorth Stand' },
  'zone-b': { x: 30, y: 285, w: 220, h: 100, label: 'Zone B\nSouth Stand' },
  'zone-c': { x: 290, y: 80, w: 100, h: 240, label: 'Zone C\nEast' },
  'zone-d': { x: 10, y: 80, w: 95, h: 240, label: 'Zone D\nWest' },
  'zone-vip': { x: 115, y: 140, w: 150, h: 120, label: 'VIP\nLounge' },
  'pitch': { x: 115, y: 140, w: 150, h: 120 },
};

export default function NavigationPage() {
  const { socket } = useSocket();
  const [zones, setZones] = useState([]);
  const [selectedZone, setSelectedZone] = useState(null);
  const [myTicket, setMyTicket] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([api.get('/zones'), api.get('/tickets/my')])
      .then(([z, t]) => {
        setZones(z.data.zones);
        if (t.data.tickets?.[0]) setMyTicket(t.data.tickets[0]);
      })
      .finally(() => setLoading(false));
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
        <main style={{ flex: 1, padding: '2rem' }}>
          <h1 style={{ fontFamily: 'Outfit', fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Map size={28} color="#3b82f6" /> Smart Navigation
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>Live stadium map with real-time crowd data</p>

          {myTicket && (
            <div style={{ background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 12, padding: '1rem 1.5rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: 12 }}>
              <MapPin size={20} color="#3b82f6" />
              <div>
                <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>Your Seat</p>
                <p style={{ color: 'var(--text-secondary)', fontSize: 'sm' }}>
                  {myTicket.zone} · {myTicket.gate} · Section {myTicket.seat?.section}, Row {myTicket.seat?.row}, Seat {myTicket.seat?.number}
                </p>
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem', flexWrap: 'wrap' }}>
            {/* SVG Map */}
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <p style={{ fontWeight: 600, marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>STADIUM OVERVIEW — Click a zone for details</p>
              <svg viewBox="0 0 400 400" style={{ width: '100%', maxHeight: 380 }}>
                {/* Pitch */}
                <rect x="115" y="130" width="170" height="140" rx="12" fill="rgba(16,185,129,0.15)" stroke="rgba(16,185,129,0.4)" strokeWidth="2" />
                <rect x="130" y="145" width="140" height="110" rx="8" fill="rgba(16,185,129,0.1)" stroke="rgba(16,185,129,0.3)" strokeWidth="1" />
                <text x="200" y="200" textAnchor="middle" fill="rgba(16,185,129,0.7)" fontSize="12" fontWeight="700">PITCH</text>

                {/* Zone D (West) */}
                <rect x="10" y="90" width="95" height="220" rx="10" fill={`${congestionColors[zones.find(z=>z.name==='zone-d')?.congestionLevel||'low']}25`} stroke={congestionColors[zones.find(z=>z.name==='zone-d')?.congestionLevel||'low']} strokeWidth="2" className="map-zone"
                  onClick={() => setSelectedZone(zones.find(z => z.name === 'zone-d'))} />
                <text x="57" y="195" textAnchor="middle" fill="white" fontSize="11" fontWeight="600">Zone D</text>
                <text x="57" y="210" textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="9">West Stand</text>

                {/* Zone A (North) */}
                <rect x="30" y="15" width="340" height="65" rx="10" fill={`${congestionColors[zones.find(z=>z.name==='zone-a')?.congestionLevel||'low']}25`} stroke={congestionColors[zones.find(z=>z.name==='zone-a')?.congestionLevel||'low']} strokeWidth="2" className="map-zone"
                  onClick={() => setSelectedZone(zones.find(z => z.name === 'zone-a'))} />
                <text x="200" y="52" textAnchor="middle" fill="white" fontSize="11" fontWeight="600">Zone A — North Stand</text>

                {/* Zone B (South) */}
                <rect x="30" y="320" width="340" height="65" rx="10" fill={`${congestionColors[zones.find(z=>z.name==='zone-b')?.congestionLevel||'low']}25`} stroke={congestionColors[zones.find(z=>z.name==='zone-b')?.congestionLevel||'low']} strokeWidth="2" className="map-zone"
                  onClick={() => setSelectedZone(zones.find(z => z.name === 'zone-b'))} />
                <text x="200" y="357" textAnchor="middle" fill="white" fontSize="11" fontWeight="600">Zone B — South Stand</text>

                {/* Zone C (East) */}
                <rect x="295" y="90" width="95" height="220" rx="10" fill={`${congestionColors[zones.find(z=>z.name==='zone-c')?.congestionLevel||'low']}25`} stroke={congestionColors[zones.find(z=>z.name==='zone-c')?.congestionLevel||'low']} strokeWidth="2" className="map-zone"
                  onClick={() => setSelectedZone(zones.find(z => z.name === 'zone-c'))} />
                <text x="342" y="195" textAnchor="middle" fill="white" fontSize="11" fontWeight="600">Zone C</text>
                <text x="342" y="210" textAnchor="middle" fill="rgba(255,255,255,0.6)" fontSize="9">East Stand</text>

                {/* VIP */}
                <rect x="130" y="155" width="140" height="90" rx="8" fill="rgba(139,92,246,0.2)" stroke="#8b5cf6" strokeWidth="1.5" strokeDasharray="4,2" className="map-zone"
                  onClick={() => setSelectedZone(zones.find(z => z.name === 'zone-vip'))} />
                <text x="200" y="204" textAnchor="middle" fill="#a78bfa" fontSize="10" fontWeight="700">VIP LOUNGE</text>

                {/* Gates */}
                {[['Gate 1', 200, 5], ['Gate 2', 5, 200], ['Gate 3', 200, 395], ['Gate 4', 395, 200]].map(([g, x, y]) => (
                  <text key={g} x={x} y={y} textAnchor="middle" dominantBaseline="middle" fill="#f59e0b" fontSize="9" fontWeight="600">{g}</text>
                ))}
              </svg>

              {/* Legend */}
              <div style={{ display: 'flex', gap: 16, marginTop: '1rem', flexWrap: 'wrap' }}>
                {Object.entries(congestionColors).map(([level, color]) => (
                  <div key={level} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{level}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Zone Details Panel */}
            <div>
              {selectedZone ? (
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                  <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem' }}>{selectedZone.label}</h3>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: congestionColors[selectedZone.congestionLevel], background: `${congestionColors[selectedZone.congestionLevel]}20`, padding: '3px 10px', borderRadius: 99 }}>{selectedZone.congestionLevel?.toUpperCase()}</span>

                  <div style={{ marginTop: '1.25rem' }}>
                    <div className="progress-bar-outer">
                      <div className="progress-bar-inner" style={{ width: `${Math.round((selectedZone.currentOccupancy / selectedZone.capacity) * 100)}%`, background: congestionColors[selectedZone.congestionLevel] }} />
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: 6 }}>
                      {selectedZone.currentOccupancy?.toLocaleString()} / {selectedZone.capacity?.toLocaleString()} occupancy
                    </p>
                  </div>

                  {selectedZone.isRerouting && (
                    <div style={{ background: 'rgba(245,158,11,0.1)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 8, padding: '0.75rem', marginTop: '1rem' }}>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                        <AlertTriangle size={16} color="#f59e0b" style={{ flexShrink: 0 }} />
                        <p style={{ fontSize: '0.82rem', color: '#fbbf24' }}>{selectedZone.rerouteMessage}</p>
                      </div>
                    </div>
                  )}

                  <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: 8 }}>
                    <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>🚽 Restrooms: {selectedZone.restrooms}</p>
                    <div>
                      <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: 4 }}>🚪 Exits:</p>
                      {selectedZone.exits?.map(e => (
                        <span key={e} style={{ display: 'inline-block', background: 'rgba(59,130,246,0.15)', color: '#60a5fa', padding: '2px 8px', borderRadius: 6, fontSize: '0.75rem', marginRight: 6, marginBottom: 4 }}>{e}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  <Navigation size={40} style={{ margin: '0 auto 1rem', opacity: 0.3 }} />
                  <p style={{ fontSize: '0.9rem' }}>Click any zone on the map to see details, exits, and restroom locations.</p>
                </div>
              )}

              {/* Quick Find */}
              <div className="glass-card" style={{ padding: '1.5rem', marginTop: '1rem' }}>
                <p style={{ fontWeight: 600, marginBottom: '1rem', fontSize: '0.9rem' }}>Quick Find</p>
                {[
                  { label: 'Nearest Restroom', icon: '🚽', hint: `${myTicket?.zone || 'Zone A'} has ${zones.find(z => z.label?.includes(myTicket?.zone?.split(' ')[1] || 'A'))?.restrooms || 4} restrooms` },
                  { label: 'Nearest Food Stall', icon: '🍔', hint: 'S-101 · 12 min wait' },
                  { label: 'Best Exit Route', icon: '🚪', hint: selectedZone?.exits?.[0] || 'Exit A1 (least crowded)' },
                  { label: 'My Seat', icon: '💺', hint: myTicket ? `Section ${myTicket.seat?.section}, Row ${myTicket.seat?.row}, Seat ${myTicket.seat?.number}` : 'No ticket' },
                ].map(q => (
                  <div key={q.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '0.6rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ fontSize: '1.2rem' }}>{q.icon}</span>
                    <div>
                      <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>{q.label}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{q.hint}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
