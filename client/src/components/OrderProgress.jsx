import React from 'react';

const STEPS = ['pending', 'accepted', 'preparing', 'ready', 'completed'];
const LABELS = { pending: 'Pending', accepted: 'Accepted', preparing: 'Preparing', ready: 'Ready', completed: 'Completed' };

export default function OrderProgress({ status }) {
  if (status === 'cancelled') {
    return <div className="badge badge-cancelled" style={{ fontSize: '0.85rem', padding: '8px 16px' }}>Order Cancelled</div>;
  }
  const currentIndex = STEPS.indexOf(status);
  return (
    <div className="progress-track">
      {STEPS.map((step, i) => {
        const state = i < currentIndex ? 'done' : i === currentIndex ? 'current' : '';
        return (
          <div key={step} className={`progress-step ${state}`}>
            <div className="dot" />
            <div className="label">{LABELS[step]}</div>
          </div>
        );
      })}
    </div>
  );
}
