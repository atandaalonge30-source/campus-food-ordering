import React from 'react';

export default function ConfirmModal({ open, title, message, confirmLabel = 'Confirm', danger, onConfirm, onCancel, children }) {
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(36,28,21,0.45)', zIndex: 100,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
    }}>
      <div className="card" style={{ maxWidth: 420, width: '100%', background: 'var(--color-surface)' }}>
        <h3>{title}</h3>
        <p>{message}</p>
        {children}
        <div className="flex gap-12 mt-16" style={{ justifyContent: 'flex-end' }}>
          <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
          <button className={danger ? 'btn btn-danger' : 'btn btn-primary'} onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
