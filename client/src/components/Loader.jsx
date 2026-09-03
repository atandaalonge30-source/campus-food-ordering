import React from 'react';

export function Loader({ label = 'Loading…' }) {
  return <div className="loader-row">{label}</div>;
}

export function EmptyState({ title, message, action }) {
  return (
    <div className="empty-state">
      <h3>{title}</h3>
      <p>{message}</p>
      {action}
    </div>
  );
}
