import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Trophy, Mail, Lock, User, Phone, Loader } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', role: 'fan' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await register(form);
      toast.success(`Welcome to SmartStadiumX, ${user.name}!`);
      navigate('/fan');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem', background: 'radial-gradient(ellipse at top, rgba(99,102,241,0.1) 0%, transparent 60%)' }}>
      <div style={{ width: '100%', maxWidth: 440 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: 56, height: 56, borderRadius: 16, background: 'linear-gradient(135deg, #3b82f6, #6366f1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1rem' }}>
            <Trophy size={28} color="white" />
          </div>
          <h1 style={{ fontFamily: 'Outfit', fontWeight: 800, fontSize: '1.8rem' }}>Join SmartStadiumX</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: 6, fontSize: '0.9rem' }}>Create your fan account</p>
        </div>

        <form onSubmit={handleSubmit} className="glass-card" style={{ padding: '2rem' }}>
          {[
            { id: 'reg-name', label: 'Full Name', key: 'name', type: 'text', icon: User, placeholder: 'James Wilson' },
            { id: 'reg-email', label: 'Email', key: 'email', type: 'email', icon: Mail, placeholder: 'you@example.com' },
            { id: 'reg-phone', label: 'Phone (optional)', key: 'phone', type: 'tel', icon: Phone, placeholder: '+91 98765 43210' },
            { id: 'reg-password', label: 'Password', key: 'password', type: 'password', icon: Lock, placeholder: 'Min 6 characters' },
          ].map(field => {
            const Icon = field.icon;
            return (
              <div key={field.key} style={{ marginBottom: '1.25rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>{field.label}</label>
                <div style={{ position: 'relative' }}>
                  <Icon size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                  <input id={field.id} type={field.type} className="input-field" style={{ paddingLeft: '2.5rem' }} placeholder={field.placeholder}
                    value={form[field.key]} onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                    required={field.key !== 'phone'} minLength={field.key === 'password' ? 6 : undefined} />
                </div>
              </div>
            );
          })}

          <button id="register-submit" type="submit" disabled={loading} className="btn-primary" style={{ width: '100%', padding: '0.85rem', fontSize: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            {loading ? <><Loader size={18} style={{ animation: 'spin 1s linear infinite' }} /> Creating account...</> : 'Create Account'}
          </button>
          <p style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Already have an account? <Link to="/login" style={{ color: '#60a5fa', fontWeight: 600 }}>Sign in</Link>
          </p>
        </form>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    </div>
  );
}
