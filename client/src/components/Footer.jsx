import React from 'react';

export default function Footer() {
  return (
    <footer style={{ background: 'var(--color-roast)', color: 'var(--color-cream)', padding: '48px 0 28px' }}>
      <div className="container flex-between flex-wrap gap-16" style={{ alignItems: 'flex-start' }}>
        <div>
          <h3 style={{ color: 'var(--color-cream)', marginBottom: 8 }}>Campus Food Ordering</h3>
          <p style={{ color: '#C9B9A6', maxWidth: 320 }}>
            Built for The Polytechnic Ibadan — connecting students and staff with approved campus food vendors.
          </p>
        </div>
        <div style={{ color: '#C9B9A6', fontSize: '0.85rem' }}>
          <p style={{ color: '#C9B9A6' }}>The Polytechnic Ibadan, Ibadan, Oyo State</p>
          <p style={{ color: '#C9B9A6' }}>support@tpi-campusfood.edu.ng</p>
        </div>
      </div>
      <div className="container mt-24" style={{ borderTop: '1px solid #4A3527', paddingTop: 18, color: '#8A7563', fontSize: '0.8rem' }}>
        &copy; {new Date().getFullYear()} Campus Food Ordering System · Final Year Project, The Polytechnic Ibadan
      </div>
    </footer>
  );
}
