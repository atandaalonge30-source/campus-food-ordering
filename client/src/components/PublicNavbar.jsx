import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';

export default function PublicNavbar() {
  const { user, logout } = useAuth();
  const { itemCount } = useCart();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const dashboardPath = user?.role === 'admin' ? '/admin/dashboard'
    : user?.role === 'vendor' ? '/vendor/dashboard'
    : '/customer/dashboard';

  return (
    <header style={{ background: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', position: 'sticky', top: 0, zIndex: 50 }}>
      <div className="container flex-between" style={{ height: 68 }}>
        <Link to="/" style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: '1.2rem', color: 'var(--color-primary)' }}>
          TPI Campus Food
        </Link>

        <nav className="nav-desktop-links gap-16" style={{ alignItems: 'center' }}>
          <Link to="/browse" className="text-soft">Browse Food</Link>
          <Link to="/vendors" className="text-soft">Vendors</Link>
          {user && <Link to="/cart" className="text-soft">Cart{itemCount > 0 ? ` (${itemCount})` : ''}</Link>}
        </nav>

        <div className="flex gap-12" style={{ alignItems: 'center' }}>
          {user ? (
            <>
              <Link to={dashboardPath} className="btn btn-outline btn-sm">Dashboard</Link>
              <button className="btn btn-ghost btn-sm" onClick={() => { logout(); navigate('/'); }}>Log Out</button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
              <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
            </>
          )}
          <button className="btn btn-ghost btn-sm nav-mobile-toggle" onClick={() => setOpen(!open)}>☰</button>
        </div>
      </div>
      <div className={`nav-mobile-panel container ${open ? 'open' : ''}`} style={{ paddingBottom: 16, flexDirection: 'column', gap: 10 }}>
        <Link to="/browse" onClick={() => setOpen(false)}>Browse Food</Link>
        <Link to="/vendors" onClick={() => setOpen(false)}>Vendors</Link>
        {user && <Link to="/cart" onClick={() => setOpen(false)}>Cart{itemCount > 0 ? ` (${itemCount})` : ''}</Link>}
      </div>
    </header>
  );
}
