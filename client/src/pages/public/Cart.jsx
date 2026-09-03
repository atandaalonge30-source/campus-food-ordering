import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import PublicLayout from '../../layouts/PublicLayout.jsx';
import { EmptyState } from '../../components/Loader.jsx';
import { useCart } from '../../context/CartContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { formatNaira } from '../../utils/format.js';

export default function Cart() {
  const { cart, increment, decrement, removeItem, clearCart, subtotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const goToCheckout = () => {
    if (!user) { navigate('/login', { state: { from: '/checkout' } }); return; }
    navigate('/checkout');
  };

  if (cart.items.length === 0) {
    return (
      <PublicLayout>
        <section className="section container">
          <EmptyState
            title="Your cart is empty"
            message="Browse the menu and add some food to get started."
            action={<Link to="/browse" className="btn btn-primary mt-16">Browse Food</Link>}
          />
        </section>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <section className="section container" style={{ maxWidth: 760 }}>
        <div className="flex-between">
          <h1 style={{ fontSize: '1.8rem' }}>Your Cart</h1>
          <button className="btn btn-ghost btn-sm" onClick={clearCart}>Clear Cart</button>
        </div>
        <p>Ordering from <strong>{cart.vendorName}</strong>. One order can only contain food from a single vendor.</p>

        <div className="table-wrap mt-16">
          <table>
            <thead>
              <tr><th>Item</th><th>Unit Price</th><th>Quantity</th><th>Subtotal</th><th></th></tr>
            </thead>
            <tbody>
              {cart.items.map((it) => (
                <tr key={it.foodId}>
                  <td>{it.name}</td>
                  <td>{formatNaira(it.price)}</td>
                  <td>
                    <div className="flex gap-8" style={{ alignItems: 'center' }}>
                      <button className="btn btn-outline btn-sm" onClick={() => decrement(it.foodId)}>−</button>
                      <span>{it.quantity}</span>
                      <button className="btn btn-outline btn-sm" onClick={() => increment(it.foodId)}>+</button>
                    </div>
                  </td>
                  <td>{formatNaira(it.price * it.quantity)}</td>
                  <td><button className="btn btn-ghost btn-sm" onClick={() => removeItem(it.foodId)}>Remove</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card mt-24" style={{ maxWidth: 320, marginLeft: 'auto' }}>
          <div className="flex-between"><span>Total Amount</span><strong style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem' }}>{formatNaira(subtotal)}</strong></div>
          <button className="btn btn-primary btn-block mt-16" onClick={goToCheckout}>Proceed to Checkout</button>
        </div>
      </section>
    </PublicLayout>
  );
}
