import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { NotificationAPI } from '../services/api.js';

export default function NotificationBell({ to }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const { data } = await NotificationAPI.unreadCount();
        if (active) setCount(data.unreadCount);
      } catch { /* silent */ }
    };
    load();
    const interval = setInterval(load, 20000);
    return () => { active = false; clearInterval(interval); };
  }, []);

  return (
    <Link to={to} className="btn btn-ghost" style={{ position: 'relative', padding: '10px 12px' }}>
      🔔
      {count > 0 && (
        <span style={{
          position: 'absolute', top: 2, right: 2, background: 'var(--color-primary)', color: '#fff',
          fontSize: '0.65rem', fontWeight: 700, borderRadius: 999, minWidth: 16, height: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px'
        }}>
          {count > 9 ? '9+' : count}
        </span>
      )}
    </Link>
  );
}
