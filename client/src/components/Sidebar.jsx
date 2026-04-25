import { useNavigate, useLocation } from 'react-router-dom';

export default function Sidebar({ items }) {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <aside style={{ width: 220, minHeight: 'calc(100vh - 64px)', background: 'rgba(10,14,26,0.6)', borderRight: '1px solid rgba(255,255,255,0.06)', padding: '1.5rem 1rem', flexShrink: 0 }}>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`sidebar-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span>{item.label}</span>
              {item.badge && (
                <span style={{ marginLeft: 'auto', background: '#ef4444', color: 'white', borderRadius: 99, padding: '1px 7px', fontSize: '0.7rem', fontWeight: 700 }}>{item.badge}</span>
              )}
            </button>
          );
        })}
      </nav>
    </aside>
  );
}
