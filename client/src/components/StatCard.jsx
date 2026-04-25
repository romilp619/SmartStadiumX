export default function StatCard({ label, value, icon: Icon, color = '#3b82f6', sub, trend }) {
  return (
    <div className="stat-card fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
          <p style={{ fontSize: '2rem', fontWeight: 800, color, marginTop: 4, fontFamily: 'Outfit' }}>{value}</p>
          {sub && <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: 4 }}>{sub}</p>}
        </div>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: `${color}20`, border: `1px solid ${color}30`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={22} color={color} />
        </div>
      </div>
      {trend !== undefined && (
        <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: '0.8rem', color: trend >= 0 ? '#10b981' : '#ef4444', fontWeight: 600 }}>
            {trend >= 0 ? '▲' : '▼'} {Math.abs(trend)}%
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>vs last hour</span>
        </div>
      )}
    </div>
  );
}
