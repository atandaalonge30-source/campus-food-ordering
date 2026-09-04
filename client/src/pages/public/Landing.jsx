import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PublicLayout from '../../layouts/PublicLayout.jsx';
import VendorCard from '../../components/VendorCard.jsx';
import FoodCard from '../../components/FoodCard.jsx';
import { VendorAPI, FoodAPI } from '../../services/api.js';
import { useCart } from '../../context/CartContext.jsx';

const STEPS = [
  { title: 'Register or log in', body: 'Create a free account with your student or staff details.' },
  { title: 'Browse food', body: 'Explore menus from every approved vendor on campus.' },
  { title: 'Add to cart', body: 'Build your order from a single vendor at a time.' },
  { title: 'Place your order', body: 'Pay on pickup, by bank transfer, or by card.' },
  { title: 'Track your order', body: 'Watch it move from pending to ready in real time.' },
  { title: 'Collect your food', body: 'Pick up at the vendor location and enjoy.' }
];

const BENEFITS = [
  'Reduced waiting time at vendor counters',
  'Convenient ordering from anywhere on campus',
  'Live order tracking from kitchen to pickup',
  'Organized, accountable vendor management',
  'Digital records of every transaction'
];

export default function Landing() {
  const [vendors, setVendors] = useState([]);
  const [foods, setFoods] = useState([]);
  const { addItem, conflictMessage } = useCart();

  useEffect(() => {
    VendorAPI.listPublic().then(({ data }) => setVendors(data.vendors.slice(0, 3))).catch(() => {});
    FoodAPI.listPublic({ onlyAvailable: 'true' }).then(({ data }) => setFoods(data.foods.slice(0, 4))).catch(() => {});
  }, []);

  return (
    <PublicLayout>
      {/* Hero */}
      <section style={{
        backgroundImage: 'linear-gradient(rgba(90,68,51,0.65), rgba(90,68,51,0.65)), url(https://source.unsplash.com/collection/190727/1600x900)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        color: 'var(--color-cream)',
        padding: '88px 0 96px'
      }}>
        <div className="container" style={{ maxWidth: 720 }}>
          <h1 style={{ color: 'var(--color-cream)' }}>Campus food, ordered ahead, with no more queueing between lectures.</h1>
          <p style={{ color: '#D8C7B6', fontSize: '1.1rem', maxWidth: 540 }}>
            The Polytechnic Ibadan's own food ordering system. Browse menus from approved campus vendors,
            pay your way, and track your order from the kitchen to pickup.
          </p>
          <div className="flex gap-16 flex-wrap mt-24">
            <Link to="/browse" className="btn btn-primary">Browse Food</Link>
            <Link to="/login" className="btn btn-outline" style={{ borderColor: '#5A4433', color: 'var(--color-cream)' }}>Login</Link>
            <Link to="/register" className="btn btn-ghost" style={{ color: 'var(--color-cream)' }}>Register →</Link>
          </div>
        </div>
      </section>

      {/* Featured vendors */}
      <section className="section container">
        <div className="flex-between mb-0">
          <h2>Featured vendors</h2>
          <Link to="/vendors" className="btn btn-outline btn-sm">See all vendors</Link>
        </div>
        <p>Every vendor here has been reviewed and approved by the campus administration.</p>
        {conflictMessage && <div className="alert alert-error">{conflictMessage}</div>}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px,1fr))', gap: 16 }}>
          {vendors.map((v) => <VendorCard key={v.id} vendor={v} />)}
          {vendors.length === 0 && <p>No vendors are approved yet. Check back soon.</p>}
        </div>
      </section>

      {/* Featured meals */}
      <section className="section container" style={{ paddingTop: 0 }}>
        <h2>Featured meals</h2>
        <p>A taste of what's currently available across campus.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(230px,1fr))', gap: 16 }}>
          {foods.map((f) => <FoodCard key={f.id} food={f} onAdd={(food) => addItem(food)} />)}
          {foods.length === 0 && <p>No food items are available yet. Check back soon.</p>}
        </div>
      </section>

      {/* How it works */}
      <section className="section" style={{ background: 'var(--color-surface-sunken)' }}>
        <div className="container">
          <h2>How it works</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px,1fr))', gap: 20 }}>
            {STEPS.map((s, i) => (
              <div key={s.title} className="card" style={{ background: 'var(--color-surface)' }}>
                <div style={{ color: 'var(--color-primary)', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.3rem', marginBottom: 6 }}>
                  {i + 1}
                </div>
                <h3 style={{ fontSize: '1.05rem' }}>{s.title}</h3>
                <p style={{ fontSize: '0.88rem' }}>{s.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="section container">
        <h2>Why students and staff choose it</h2>
        <ul style={{ columns: 2, gap: 32, padding: 0, listStyle: 'none' }}>
          {BENEFITS.map((b) => (
            <li key={b} style={{ padding: '10px 0', borderBottom: '1px solid var(--color-border)', breakInside: 'avoid' }}>
              {b}
            </li>
          ))}
        </ul>
      </section>
    </PublicLayout>
  );
}
