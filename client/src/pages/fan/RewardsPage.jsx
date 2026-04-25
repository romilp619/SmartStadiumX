import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { Trophy, Map, Clock, ShoppingBag, Ticket, Star, Gift } from 'lucide-react';

const sidebarItems = [
  { path: '/fan', label: 'Dashboard', icon: Trophy },
  { path: '/fan/navigate', label: 'Navigation', icon: Map },
  { path: '/fan/queue', label: 'Queue Monitor', icon: Clock },
  { path: '/fan/order', label: 'Food Order', icon: ShoppingBag },
  { path: '/fan/orders', label: 'My Orders', icon: Ticket },
  { path: '/fan/rewards', label: 'Rewards', icon: Star },
];

export default function RewardsPage() {
  const { user, updateUserLocal } = useAuth();
  const [reward, setReward] = useState(null);
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [redeeming, setRedeeming] = useState(null);

  useEffect(() => {
    Promise.all([api.get('/rewards/my'), api.get('/rewards/offers')])
      .then(([r, o]) => { setReward(r.data.reward); setOffers(o.data.offers); })
      .finally(() => setLoading(false));
  }, []);

  const redeem = async (offerId) => {
    setRedeeming(offerId);
    try {
      const r = await api.post(`/rewards/redeem/${offerId}`);
      toast.success(r.data.message);
      updateUserLocal({ rewardPoints: r.data.remainingPoints });
      const r2 = await api.get('/rewards/my');
      setReward(r2.data.reward);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Redemption failed');
    } finally { setRedeeming(null); }
  };

  const pts = user?.rewardPoints || 0;
  const tier = pts >= 500 ? 'Gold' : pts >= 200 ? 'Silver' : 'Bronze';
  const tierColors = { Bronze: '#cd7f32', Silver: '#94a3b8', Gold: '#f59e0b' };
  const tc = tierColors[tier];

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />
      <div style={{ display: 'flex' }}>
        <Sidebar items={sidebarItems} />
        <main style={{ flex: 1, padding: '2rem' }}>
          <h1 style={{ fontFamily: 'Outfit', fontSize: '1.8rem', fontWeight: 800, marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Star size={28} color="#f59e0b" /> Rewards
          </h1>

          {/* Points Card */}
          <div style={{ background: 'linear-gradient(135deg, #1e1b4b, #312e81)', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 20, padding: '2rem', marginBottom: '2rem', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: -40, right: -40, width: 200, height: 200, borderRadius: '50%', background: 'rgba(139,92,246,0.1)' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.85rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your Balance</p>
                <p style={{ fontFamily: 'Outfit', fontWeight: 900, fontSize: '3.5rem', color: 'white', lineHeight: 1.1 }}>{pts.toLocaleString()}</p>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '0.9rem' }}>reward points</p>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: `${tc}30`, border: `3px solid ${tc}`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                  <Star size={36} color={tc} />
                </div>
                <p style={{ color: tc, fontWeight: 700, marginTop: 8, fontSize: '1.1rem' }}>{tier}</p>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '0.75rem' }}>Member Tier</p>
              </div>
            </div>
            {tier !== 'Gold' && (
              <div style={{ marginTop: '1.5rem' }}>
                <p style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.6)', marginBottom: 8 }}>
                  {tier === 'Bronze' ? `${200 - pts} pts to Silver` : `${500 - pts} pts to Gold`}
                </p>
                <div className="progress-bar-outer" style={{ background: 'rgba(255,255,255,0.1)' }}>
                  <div className="progress-bar-inner" style={{ width: `${tier === 'Bronze' ? (pts/200)*100 : (pts/500)*100}%`, background: `linear-gradient(90deg, ${tc}80, ${tc})` }} />
                </div>
              </div>
            )}
          </div>

          {/* Offers */}
          <h2 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '1.2rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Gift size={20} color="#8b5cf6" /> Available Offers
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem' }}>
            {loading ? [1,2,3].map(i => <div key={i} className="shimmer" style={{ height: 150, borderRadius: 16 }} />) :
              offers.map(offer => {
                const canRedeem = pts >= offer.pointsCost;
                return (
                  <div key={offer._id} className="glass-card" style={{ padding: '1.5rem', opacity: canRedeem ? 1 : 0.6 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '2rem' }}>{offer.icon}</span>
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#a78bfa', background: 'rgba(139,92,246,0.2)', padding: '3px 8px', borderRadius: 99 }}>{offer.pointsCost} pts</span>
                    </div>
                    <p style={{ fontWeight: 700, fontSize: '0.95rem', marginBottom: 4 }}>{offer.title}</p>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.8rem', marginBottom: '1rem' }}>{offer.description}</p>
                    <button onClick={() => redeem(offer._id)} disabled={!canRedeem || redeeming === offer._id}
                      className={canRedeem ? 'btn-primary' : 'btn-ghost'}
                      style={{ width: '100%', fontSize: '0.85rem', padding: '0.5rem' }}>
                      {redeeming === offer._id ? 'Redeeming...' : canRedeem ? 'Redeem Now' : `Need ${offer.pointsCost - pts} more pts`}
                    </button>
                  </div>
                );
              })}
          </div>

          {/* Transaction History */}
          {reward?.transactions?.length > 0 && (
            <div style={{ marginTop: '2rem' }}>
              <h2 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '1.2rem', marginBottom: '1rem' }}>Transaction History</h2>
              <div className="glass-card" style={{ padding: '1rem' }}>
                {reward.transactions.slice(-10).reverse().map((t, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.6rem 0.5rem', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <div>
                      <p style={{ fontSize: '0.85rem', fontWeight: 600 }}>{t.description}</p>
                      <p style={{ fontSize: '0.72rem', color: 'var(--text-secondary)', marginTop: 2 }}>{new Date(t.createdAt).toLocaleDateString()}</p>
                    </div>
                    <span style={{ fontWeight: 700, color: t.type === 'earned' ? '#10b981' : '#ef4444', fontSize: '0.95rem' }}>
                      {t.type === 'earned' ? '+' : '-'}{t.points}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
