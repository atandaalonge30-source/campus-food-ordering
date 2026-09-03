import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import NotificationBell from '../components/NotificationBell.jsx';

export default function DashboardLayout({ title, navItems, notificationsPath, children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="dash-shell">
      <aside className={`dash-sidebar ${sidebarOpen ? 'open' : ''}`}>
        <Link to="/" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.1rem', color: '#fff', padding: '0 14px', marginBottom: 24, display: 'block' }}>
          TPI Campus Food
        </Link>
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => isActive ? 'active' : ''}
            onClick={() => setSidebarOpen(false)}
          >
            <span>{item.icon}</span> {item.label}
          </NavLink>
        ))}
        <button onClick={() => { logout(); navigate('/'); }} style={{ marginTop: 20 }}>
          <span>↩</span> Log Out
        </button>
      </aside>

      <div className="dash-main">
        <div className="dash-topbar">
          <div className="flex gap-12" style={{ alignItems: 'center' }}>
            <button className="btn btn-ghost btn-sm dash-mobile-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>☰</button>
            <h3 style={{ margin: 0 }}>{title}</h3>
          </div>
          <div className="flex gap-12" style={{ alignItems: 'center' }}>
            {notificationsPath && <NotificationBell to={notificationsPath} />}
            <span className="text-soft" style={{ fontSize: '0.9rem' }}>{user?.full_name}</span>
          </div>
        </div>
        <div className="dash-content">{children}</div>
      </div>
    </div>
  );
}
