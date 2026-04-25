import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import api from '../../services/api';
import { useCart } from '../../context/CartContext';
import toast from 'react-hot-toast';
import { Trophy, Map, Clock, ShoppingBag, Ticket, Star, Plus, Minus, ShoppingCart, ChevronRight, Loader } from 'lucide-react';

const sidebarItems = [
  { path: '/fan', label: 'Dashboard', icon: Trophy },
  { path: '/fan/navigate', label: 'Navigation', icon: Map },
  { path: '/fan/queue', label: 'Queue Monitor', icon: Clock },
  { path: '/fan/order', label: 'Food Order', icon: ShoppingBag },
  { path: '/fan/orders', label: 'My Orders', icon: Ticket },
  { path: '/fan/rewards', label: 'Rewards', icon: Star },
];

const categoryIcons = { burger: '🍔', pizza: '🍕', drinks: '🥤', snacks: '🍟', desserts: '🍦', combo: '🍱' };

export default function FoodOrder() {
  const navigate = useNavigate();
  const { cart, addItem, removeItem, stallId, stallName, total, itemCount, clearCart } = useCart();
  const [stalls, setStalls] = useState([]);
  const [selectedStall, setSelectedStall] = useState(null);
  const [category, setCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [placing, setPlacing] = useState(false);
  const [payMethod, setPayMethod] = useState('card');

  useEffect(() => {
    api.get('/stalls').then(r => {
      setStalls(r.data.stalls);
      if (r.data.stalls.length) setSelectedStall(r.data.stalls[0]);
    }).finally(() => setLoading(false));
  }, []);

  const categories = selectedStall ? ['all', ...new Set(selectedStall.menu.map(i => i.category))] : ['all'];
  const filteredMenu = selectedStall?.menu.filter(item => category === 'all' || item.category === category) || [];
  const getQty = (itemId) => cart.find(i => i.menuItem === itemId)?.quantity || 0;

  const placeOrder = async () => {
    if (!cart.length) return;
    setPlacing(true);
    try {
      await api.post('/orders', {
        stallId,
        items: cart,
        paymentMethod: payMethod,
        deliveryLocation: 'Seat',
      });
      clearCart();
      toast.success('Order placed! Track it live 🎉');
      navigate('/fan/orders');
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to place order');
    } finally { setPlacing(false); }
  };

  return (
    <div style={{ minHeight: '100vh' }}>
      <Navbar />
      <div style={{ display: 'flex' }}>
        <Sidebar items={sidebarItems} />
        <main style={{ flex: 1, padding: '2rem' }}>
          <h1 style={{ fontFamily: 'Outfit', fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: 10 }}>
            <ShoppingBag size={28} color="#f59e0b" /> Food Order
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Browse menus and order from your seat</p>

          {/* Stall Selector */}
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            {stalls.map(s => (
              <button key={s._id} onClick={() => { setSelectedStall(s); setCategory('all'); }}
                style={{ padding: '0.6rem 1.2rem', borderRadius: 10, border: `1px solid ${selectedStall?._id === s._id ? '#f59e0b' : 'rgba(255,255,255,0.1)'}`, background: selectedStall?._id === s._id ? 'rgba(245,158,11,0.15)' : 'transparent', color: selectedStall?._id === s._id ? '#fbbf24' : 'var(--text-secondary)', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem', transition: 'all 0.2s' }}>
                {s.name} · {s.estimatedWaitTime}min
                {!s.isOpen && <span style={{ color: '#ef4444', marginLeft: 6 }}>Closed</span>}
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '1.5rem' }}>
            {/* Menu */}
            <div>
              {selectedStall && (
                <>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <div>
                      <h2 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '1.2rem' }}>{selectedStall.name}</h2>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>{selectedStall.stallNumber} · {selectedStall.zone} · ⭐ {selectedStall.rating} · ~{selectedStall.estimatedWaitTime} min</p>
                    </div>
                    <span className={selectedStall.isOpen ? 'badge badge-green' : 'badge badge-red'}>{selectedStall.isOpen ? '● OPEN' : '● CLOSED'}</span>
                  </div>

                  {/* Category pills */}
                  <div style={{ display: 'flex', gap: 8, marginBottom: '1.25rem', flexWrap: 'wrap' }}>
                    {categories.map(c => (
                      <button key={c} onClick={() => setCategory(c)}
                        style={{ padding: '0.35rem 0.9rem', borderRadius: 99, border: `1px solid ${category === c ? '#f59e0b' : 'rgba(255,255,255,0.1)'}`, background: category === c ? 'rgba(245,158,11,0.15)' : 'transparent', color: category === c ? '#fbbf24' : 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600, transition: 'all 0.2s' }}>
                        {categoryIcons[c] || '🍽️'} {c.charAt(0).toUpperCase() + c.slice(1)}
                      </button>
                    ))}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    {filteredMenu.map(item => {
                      const qty = getQty(item._id);
                      return (
                        <div key={item._id} className="glass-card fade-in" style={{ padding: '1.25rem', display: 'flex', gap: '1rem', alignItems: 'center', opacity: item.isAvailable ? 1 : 0.5 }}>
                          <div style={{ width: 56, height: 56, borderRadius: 12, background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', flexShrink: 0 }}>
                            {categoryIcons[item.category] || '🍽️'}
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <div>
                                <p style={{ fontWeight: 600, fontSize: '0.95rem' }}>{item.name}</p>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.78rem', marginTop: 2 }}>{item.description}</p>
                                <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 4 }}>⏱ {item.prepTime} min · {item.calories} cal</p>
                              </div>
                              <p style={{ fontWeight: 800, fontSize: '1rem', color: '#f59e0b', flexShrink: 0 }}>₹{item.price}</p>
                            </div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                            {qty > 0 ? (
                              <>
                                <button onClick={() => removeItem(item._id)} style={{ width: 30, height: 30, borderRadius: '50%', border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <Minus size={14} />
                                </button>
                                <span style={{ fontWeight: 700, minWidth: 20, textAlign: 'center' }}>{qty}</span>
                                <button onClick={() => item.isAvailable && addItem(item, selectedStall._id, selectedStall.name)} style={{ width: 30, height: 30, borderRadius: '50%', background: 'linear-gradient(135deg, #f59e0b, #d97706)', border: 'none', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                  <Plus size={14} />
                                </button>
                              </>
                            ) : (
                              <button onClick={() => item.isAvailable && addItem(item, selectedStall._id, selectedStall.name)} disabled={!item.isAvailable}
                                style={{ padding: '0.4rem 0.9rem', borderRadius: 8, background: item.isAvailable ? 'rgba(245,158,11,0.2)' : 'rgba(255,255,255,0.05)', border: `1px solid ${item.isAvailable ? 'rgba(245,158,11,0.4)' : 'rgba(255,255,255,0.1)'}`, color: item.isAvailable ? '#fbbf24' : 'var(--text-secondary)', cursor: item.isAvailable ? 'pointer' : 'not-allowed', fontSize: '0.82rem', fontWeight: 600 }}>
                                {item.isAvailable ? '+ Add' : 'Unavail.'}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {/* Cart */}
            <div style={{ position: 'sticky', top: 80, height: 'fit-content' }}>
              <div className="glass-card" style={{ padding: '1.5rem' }}>
                <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, fontSize: '1.1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ShoppingCart size={20} color="#f59e0b" /> Your Cart
                  {stallName && <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 400 }}>— {stallName}</span>}
                </h3>

                {cart.length === 0 ? (
                  <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem 0', fontSize: '0.9rem' }}>
                    Your cart is empty.<br />Add items from the menu!
                  </p>
                ) : (
                  <>
                    {cart.map(item => (
                      <div key={item.menuItem} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <div>
                          <p style={{ fontSize: '0.88rem', fontWeight: 600 }}>{item.name}</p>
                          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>₹{item.price} × {item.quantity}</p>
                        </div>
                        <p style={{ fontWeight: 700, color: '#fbbf24' }}>₹{item.subtotal}</p>
                      </div>
                    ))}
                    <div style={{ paddingTop: '1rem', marginTop: '0.5rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Subtotal ({itemCount} items)</span>
                        <span style={{ fontWeight: 700 }}>₹{total}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <span style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Reward points</span>
                        <span style={{ color: '#10b981', fontWeight: 600 }}>+{Math.floor(total / 10)} pts</span>
                      </div>

                      <select value={payMethod} onChange={e => setPayMethod(e.target.value)} className="input-field" style={{ marginBottom: '1rem' }}>
                        <option value="card">💳 Card</option>
                        <option value="upi">📱 UPI</option>
                        <option value="wallet">👛 Wallet</option>
                      </select>

                      <button onClick={placeOrder} disabled={placing || !selectedStall?.isOpen} className="btn-success" style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, padding: '0.85rem', fontSize: '0.95rem' }}>
                        {placing ? <><Loader size={18} className="spin" /> Placing...</> : <><ChevronRight size={18} /> Place Order · ₹{total}</>}
                      </button>
                      {!selectedStall?.isOpen && <p style={{ color: '#ef4444', fontSize: '0.78rem', textAlign: 'center', marginTop: 6 }}>This stall is currently closed</p>}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
      <style>{`.spin { animation: spin 1s linear infinite; } @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
