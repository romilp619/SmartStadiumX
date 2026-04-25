import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import api from '../../services/api';
import { ArrowLeft, Download, Trophy, Map, ShoppingBag, Star, Ticket, Clock } from 'lucide-react';

const sidebarItems = [
  { path: '/fan', label: 'Dashboard', icon: Trophy },
  { path: '/fan/navigate', label: 'Navigation', icon: Map },
  { path: '/fan/queue', label: 'Queue Monitor', icon: Clock },
  { path: '/fan/order', label: 'Food Order', icon: ShoppingBag },
  { path: '/fan/orders', label: 'My Orders', icon: Ticket },
  { path: '/fan/rewards', label: 'Rewards', icon: Star },
];

export default function TicketView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/tickets/${id}`)
      .then(r => { setTicket(r.data.ticket); setQrDataUrl(r.data.qrDataUrl); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const qrPayload = ticket ? JSON.stringify({
    ticketId: ticket.ticketId,
    seat: ticket.seat,
    gate: ticket.gate,
    zone: ticket.zone,
  }) : '';

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />
      <div style={{ display: 'flex' }}>
        <Sidebar items={sidebarItems} />
        <main style={{ flex: 1, padding: '2rem' }}>
          <button onClick={() => navigate('/fan')} className="btn-ghost" style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <ArrowLeft size={16} /> Back to Dashboard
          </button>

          {loading ? (
            <div className="shimmer" style={{ height: 400, borderRadius: 20 }} />
          ) : !ticket ? (
            <p style={{ color: 'var(--text-secondary)' }}>Ticket not found.</p>
          ) : (
            <div style={{ maxWidth: 500, margin: '0 auto' }}>
              {/* Ticket Card */}
              <div style={{ background: 'linear-gradient(135deg, #0f172a, #1e1b4b)', border: '1px solid rgba(99,102,241,0.3)', borderRadius: 24, overflow: 'hidden', boxShadow: '0 30px 80px rgba(0,0,0,0.5)' }}>
                {/* Header */}
                <div style={{ background: 'linear-gradient(135deg, #3b82f6, #6366f1, #8b5cf6)', padding: '1.5rem 2rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Trophy size={20} color="white" />
                      <span style={{ color: 'rgba(255,255,255,0.9)', fontWeight: 700, fontFamily: 'Outfit' }}>SmartStadiumX</span>
                    </div>
                    <span style={{ background: 'rgba(255,255,255,0.2)', color: 'white', padding: '3px 10px', borderRadius: 99, fontSize: '0.75rem', fontWeight: 700 }}>{ticket.category?.toUpperCase()}</span>
                  </div>
                  <h2 style={{ color: 'white', marginTop: '1rem', fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.3rem' }}>{ticket.event?.title}</h2>
                  <div style={{ display: 'flex', gap: 16, marginTop: '0.5rem', fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)' }}>
                    <span>📅 {new Date(ticket.event?.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    <span>⏰ {ticket.event?.kickoffTime}</span>
                  </div>
                </div>

                {/* Dashed divider */}
                <div style={{ height: 1, borderTop: '2px dashed rgba(255,255,255,0.1)', margin: '0 1.5rem', position: 'relative' }}>
                  <div style={{ position: 'absolute', left: -28, top: -14, width: 28, height: 28, borderRadius: '50%', background: 'var(--navy)' }} />
                  <div style={{ position: 'absolute', right: -28, top: -14, width: 28, height: 28, borderRadius: '50%', background: 'var(--navy)' }} />
                </div>

                {/* Details */}
                <div style={{ padding: '1.5rem 2rem' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1.5rem' }}>
                    {[['Section', ticket.seat?.section], ['Row', ticket.seat?.row], ['Seat', ticket.seat?.number]].map(([l, v]) => (
                      <div key={l} style={{ textAlign: 'center', background: 'rgba(255,255,255,0.05)', borderRadius: 10, padding: '0.75rem' }}>
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>{l}</p>
                        <p style={{ fontWeight: 800, fontSize: '1.5rem', fontFamily: 'Outfit', marginTop: 2 }}>{v}</p>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                    {[['Gate', ticket.gate], ['Zone', ticket.zone], ['Ticket ID', ticket.ticketId]].map(([l, v]) => (
                      <div key={l}>
                        <p style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase' }}>{l}</p>
                        <p style={{ fontWeight: 600, marginTop: 2 }}>{v}</p>
                      </div>
                    ))}
                  </div>

                  {/* QR Code */}
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                    <div style={{ background: 'white', padding: '1rem', borderRadius: 16 }}>
                      <QRCodeSVG value={qrPayload || 'SmartStadiumX'} size={180} level="H" />
                    </div>
                    <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                      Show this QR code at the gate entrance
                    </p>
                    <p style={{ fontWeight: 700, fontSize: '1.1rem', letterSpacing: '0.2em', color: '#60a5fa' }}>{ticket.ticketId}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
