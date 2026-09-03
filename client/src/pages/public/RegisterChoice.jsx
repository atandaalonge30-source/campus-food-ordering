import React from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../../layouts/PublicLayout.jsx';

export default function RegisterChoice() {
  return (
    <PublicLayout>
      <section className="section container" style={{ maxWidth: 720 }}>
        <h1 style={{ fontSize: '2rem' }}>Create your account</h1>
        <p>Choose the account type that fits what you'll be doing on Campus Food Ordering.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px,1fr))', gap: 20 }} className="mt-24">
          <Link to="/register/customer" className="card" style={{ textDecoration: 'none' }}>
            <h3>I'm a student or staff member</h3>
            <p>Order food from any approved vendor on campus, track your orders, and pay your way.</p>
            <span className="btn btn-primary btn-sm">Register as Customer</span>
          </Link>
          <Link to="/register/vendor" className="card" style={{ textDecoration: 'none' }}>
            <h3>I run a food business on campus</h3>
            <p>List your menu, receive orders, and manage sales, pending administrator approval.</p>
            <span className="btn btn-secondary btn-sm">Register as Vendor</span>
          </Link>
        </div>
        <p className="mt-24 text-center">
          Already have an account? <Link to="/login" style={{ color: 'var(--color-primary)', fontWeight: 600 }}>Log in</Link>
        </p>
      </section>
    </PublicLayout>
  );
}
