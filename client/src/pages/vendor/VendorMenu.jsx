import { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { LayoutDashboard, ChefHat, Plus, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';

const sidebarItems = [
  { path: '/vendor', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/vendor/menu', label: 'Menu Management', icon: ChefHat },
];

const categories = ['burger', 'pizza', 'drinks', 'snacks', 'desserts', 'combo'];
const categoryIcons = { burger: '🍔', pizza: '🍕', drinks: '🥤', snacks: '🍟', desserts: '🍦', combo: '🍱' };

const emptyItem = { name: '', description: '', price: '', category: 'snacks', prepTime: 10, calories: 0 };

export default function VendorMenu() {
  const [stall, setStall] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [newItem, setNewItem] = useState(emptyItem);
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    api.get('/stalls/my').then(r => setStall(r.data.stall));
  }, []);

  const addItem = async () => {
    if (!newItem.name || !newItem.price) return toast.error('Name and price required');
    setAdding(true);
    try {
      const r = await api.post(`/stalls/${stall._id}/menu/item`, { ...newItem, price: +newItem.price, calories: +newItem.calories, isAvailable: true });
      setStall(r.data.stall);
      setNewItem(emptyItem);
      setShowForm(false);
      toast.success('Item added!');
    } catch (e) { toast.error('Failed to add item'); }
    finally { setAdding(false); }
  };

  const removeItem = async (itemId) => {
    if (!window.confirm('Remove this item?')) return;
    try {
      const r = await api.delete(`/stalls/${stall._id}/menu/${itemId}`);
      setStall(r.data.stall);
      toast.success('Item removed');
    } catch (e) { toast.error('Failed'); }
  };

  const toggleAvailability = async (itemId, current) => {
    const updatedMenu = stall.menu.map(i => i._id === itemId ? { ...i, isAvailable: !current } : i);
    try {
      const r = await api.put(`/stalls/${stall._id}/menu`, { menu: updatedMenu });
      setStall(r.data.stall);
    } catch (e) { toast.error('Failed'); }
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
                <ChefHat size={28} color="#10b981" /> Menu Management
              </h1>
              <p style={{ color: 'var(--text-secondary)' }}>{stall?.name} · {stall?.menu?.length || 0} items</p>
            </div>
            <button onClick={() => setShowForm(!showForm)} className="btn-success" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Plus size={16} /> Add Item
            </button>
          </div>

          {showForm && (
            <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
              <h3 style={{ fontFamily: 'Outfit', fontWeight: 700, marginBottom: '1.25rem' }}>New Menu Item</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Item Name *</label>
                  <input className="input-field" placeholder="e.g. Chicken Burger" value={newItem.name} onChange={e => setNewItem(f => ({ ...f, name: e.target.value }))} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Price (₹) *</label>
                  <input type="number" className="input-field" placeholder="0" value={newItem.price} onChange={e => setNewItem(f => ({ ...f, price: e.target.value }))} />
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Category</label>
                  <select className="input-field" value={newItem.category} onChange={e => setNewItem(f => ({ ...f, category: e.target.value }))}>
                    {categories.map(c => <option key={c} value={c}>{categoryIcons[c]} {c}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Prep Time (min)</label>
                  <input type="number" className="input-field" value={newItem.prepTime} onChange={e => setNewItem(f => ({ ...f, prepTime: +e.target.value }))} />
                </div>
              </div>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'block', marginBottom: 4 }}>Description</label>
                <input className="input-field" placeholder="Brief description..." value={newItem.description} onChange={e => setNewItem(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <button onClick={addItem} disabled={adding} className="btn-success">
                  {adding ? 'Adding...' : 'Add Item'}
                </button>
                <button onClick={() => { setShowForm(false); setNewItem(emptyItem); }} className="btn-ghost">Cancel</button>
              </div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1rem' }}>
            {stall?.menu?.map(item => (
              <div key={item._id} className="glass-card fade-in" style={{ padding: '1.25rem', opacity: item.isAvailable ? 1 : 0.6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                  <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                    <span style={{ fontSize: '1.5rem' }}>{categoryIcons[item.category] || '🍽️'}</span>
                    <div>
                      <p style={{ fontWeight: 700, fontSize: '0.95rem' }}>{item.name}</p>
                      <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>{item.description}</p>
                    </div>
                  </div>
                  <p style={{ fontWeight: 800, color: '#fbbf24', fontSize: '1.1rem' }}>₹{item.price}</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
                  <span>⏱ {item.prepTime}min</span>
                  <span>· {item.calories}cal</span>
                  <span className={`badge ${item.isAvailable ? 'badge-green' : 'badge-red'}`} style={{ marginLeft: 'auto' }}>{item.isAvailable ? 'Available' : 'Unavailable'}</span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => toggleAvailability(item._id, item.isAvailable)} className="btn-ghost" style={{ flex: 1, padding: '0.4rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                    {item.isAvailable ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                    {item.isAvailable ? 'Disable' : 'Enable'}
                  </button>
                  <button onClick={() => removeItem(item._id)} style={{ padding: '0.4rem 0.8rem', borderRadius: 8, background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#f87171', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem' }}>
                    <Trash2 size={14} /> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
