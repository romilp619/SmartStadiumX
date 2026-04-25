import { Link } from 'react-router-dom';
import { Trophy, Zap, Map, ShoppingBag, Bell, Star, ChevronRight, Shield, Clock, Users } from 'lucide-react';

const features = [
  { icon: Map, title: 'Smart Navigation', desc: 'Find your seat, nearest restrooms, food stalls, and best exit routes in real-time.', color: '#3b82f6' },
  { icon: Clock, title: 'Queue Monitoring', desc: 'Live wait times for every food stall so you never miss a minute of the action.', color: '#10b981' },
  { icon: ShoppingBag, title: 'Food Ordering', desc: 'Order from your seat. Track your order live as it\'s being prepared.', color: '#f59e0b' },
  { icon: Bell, title: 'Smart Alerts', desc: 'Instant gate alerts, crowd rerouting, match updates, and emergency notifications.', color: '#ef4444' },
  { icon: Star, title: 'Rewards Program', desc: 'Earn points on every order and redeem for discounts, upgrades, and more.', color: '#8b5cf6' },
  { icon: Shield, title: 'Admin Command Centre', desc: 'Real-time crowd maps, incident management, and analytics for venue operators.', color: '#ec4899' },
];

const credentials = [
  { role: 'Fan', email: 'fan@stadium.com', password: 'password123', color: '#3b82f6', icon: '🎟️' },
  { role: 'Admin', email: 'admin@stadium.com', password: 'password123', color: '#8b5cf6', icon: '🛡️' },
  { role: 'Staff', email: 'staff@stadium.com', password: 'password123', color: '#f59e0b', icon: '👷' },
  { role: 'Vendor', email: 'vendor@stadium.com', password: 'password123', color: '#10b981', icon: '🍔' },
];

export default function LandingPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--navy)' }}>
      {/* Navbar */}
      <nav style={{ padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, #3b82f6, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Trophy size={20} color="white" />
          </div>
          <span style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.3rem', background: 'linear-gradient(135deg, #60a5fa, #a78bfa)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>SmartStadiumX</span>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Link to="/login" className="btn-ghost">Login</Link>
          <Link to="/register" className="btn-primary">Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '5rem 2rem 3rem', textAlign: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: 600, height: 600, background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} />
        <div className="badge badge-blue" style={{ display: 'inline-flex', marginBottom: '1.5rem', fontSize: '0.85rem', padding: '0.4rem 1rem' }}>
          <Zap size={14} style={{ marginRight: 6 }} /> Live Match Experience Platform
        </div>
        <h1 style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: 'clamp(2.5rem, 7vw, 5rem)', lineHeight: 1.1, marginBottom: '1.5rem' }}>
          The Smartest Way to{' '}
          <span style={{ background: 'linear-gradient(135deg, #60a5fa, #a78bfa, #f472b6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Experience Live Sport
          </span>
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: 600, margin: '0 auto 2.5rem', lineHeight: 1.7 }}>
          SmartStadiumX eliminates congestion, long queues, and missed moments. Real-time navigation, food ordering, and alerts — all in one platform.
        </p>
        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/register" className="btn-primary" style={{ padding: '0.85rem 2rem', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            Start Your Experience <ChevronRight size={18} />
          </Link>
          <Link to="/login" className="btn-ghost" style={{ padding: '0.85rem 2rem', fontSize: '1rem' }}>
            Sign In
          </Link>
        </div>

        {/* Live stats bar */}
        <div style={{ display: 'flex', gap: 32, justifyContent: 'center', marginTop: '4rem', flexWrap: 'wrap' }}>
          {[['48,500', 'Live Attendees'], ['3', 'Active Zones'], ['5', 'Food Stalls'], ['₹1.6L+', "Today's Revenue"]].map(([val, lab]) => (
            <div key={lab} style={{ textAlign: 'center' }}>
              <p style={{ fontFamily: 'Outfit', fontSize: '2rem', fontWeight: 800, color: '#60a5fa' }}>{val}</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>{lab}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '4rem 2rem' }}>
        <h2 style={{ textAlign: 'center', fontFamily: 'Outfit', fontSize: '2rem', fontWeight: 800, marginBottom: '3rem' }}>
          Everything you need, <span className="gradient-text">inside the stadium</span>
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div key={f.title} className="glass-card" style={{ padding: '1.75rem', transition: 'transform 0.2s', cursor: 'default' }}
                onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
                onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: `${f.color}20`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
                  <Icon size={24} color={f.color} />
                </div>
                <h3 style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.5rem' }}>{f.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7 }}>{f.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Demo Credentials */}
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem 2rem 5rem' }}>
        <div className="glass-card" style={{ padding: '2rem' }}>
          <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '1.3rem', marginBottom: '0.5rem', textAlign: 'center' }}>🎯 Demo Credentials</h3>
          <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '1.5rem', fontSize: '0.9rem' }}>Try any role — all data is pre-seeded</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
            {credentials.map(c => (
              <div key={c.role} style={{ background: `${c.color}10`, border: `1px solid ${c.color}30`, borderRadius: 12, padding: '1.25rem' }}>
                <p style={{ fontSize: '1.5rem', marginBottom: 6 }}>{c.icon}</p>
                <p style={{ fontWeight: 700, color: c.color, fontSize: '0.95rem', marginBottom: 8 }}>{c.role}</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 2 }}>{c.email}</p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>password123</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', padding: '1.5rem 2rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>© 2024 SmartStadiumX · Built with MERN Stack ⚽🏟️</p>
      </div>
    </div>
  );
}
