import React, { useEffect, useState } from 'react';
import { Loader, EmptyState } from './Loader.jsx';
import { NotificationAPI } from '../services/api.js';
import { formatDateTime } from '../utils/format.js';

export default function NotificationsBody() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    NotificationAPI.list().then(({ data }) => setNotifications(data.notifications)).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const markRead = async (id) => {
    await NotificationAPI.markAsRead(id);
    load();
  };

  const markAllRead = async () => {
    await NotificationAPI.markAllAsRead();
    load();
  };

  if (loading) return <Loader />;

  return (
    <div>
      <div className="flex-between">
        <p className="mb-0">You have {notifications.filter((n) => !n.is_read).length} unread notification(s).</p>
        <button className="btn btn-outline btn-sm" onClick={markAllRead}>Mark All as Read</button>
      </div>
      {notifications.length === 0 ? (
        <EmptyState title="No notifications yet" message="Updates about your orders will appear here." />
      ) : (
        <div className="flex" style={{ flexDirection: 'column', gap: 10 }}>
          {notifications.map((n) => (
            <div key={n.id} className="card" style={{ borderColor: n.is_read ? 'var(--color-border)' : 'var(--color-primary)', background: n.is_read ? 'var(--color-surface)' : 'var(--color-primary-tint)' }}>
              <div className="flex-between">
                <h3 style={{ fontSize: '0.98rem', margin: 0 }}>{n.title}</h3>
                {!n.is_read && <button className="btn btn-ghost btn-sm" onClick={() => markRead(n.id)}>Mark as Read</button>}
              </div>
              <p style={{ margin: '6px 0 4px' }}>{n.message}</p>
              <p className="text-soft" style={{ margin: 0, fontSize: '0.78rem' }}>{formatDateTime(n.created_at)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
