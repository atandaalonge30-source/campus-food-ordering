import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import PublicLayout from '../../layouts/PublicLayout.jsx';
import { useCart } from '../../context/CartContext.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { OrderAPI } from '../../services/api.js';
import { formatNaira } from '../../utils/format.js';

const PAYSTACK_ENABLED = import.meta.env.VITE_PAYSTACK_ENABLED === 'true';

export default function Checkout() {
  const { cart, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('pickup');
  const [pickupNote, setPickupNote] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [placedOrder, setPlacedOrder] = useState(null);

  if (!user) return <Navigate to="/login" state={{ from: '/checkout' }} replace />;
  if (cart.items.length === 0 && !placedOrder) return <Navigate to="/cart" replace />;

  const onPlaceOrder = async () => {
    setError('');
    setLoading(true);
    try {
      const { data } = await OrderAPI.create({
        vendorId: cart.vendorId,
        items: cart.items.map((it) => ({ foodId: it.foodId, quantity: it.quantity })),
        paymentMethod,
        pickupNote
      });
      setPlacedOrder(data);
      clearCart();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (placedOrder) {
    return (
      <PublicLayout>
        <section className="section container" style={{ maxWidth: 520 }}>
          <div className="card text-center">
            <h2>Order placed!</h2>
            <p>Your order number is:</p>
            <p style={{ fontFamily: 'var(--font-display)', fontSize: '1.6rem', fontWeight: 700, color: 'var(--color-primary)' }}>
              {placedOrder.orderNumber}
            </p>
            <p>Total: {formatNaira(placedOrder.totalAmount)}</p>
            <button className="btn btn-primary mt-16" onClick={() => navigate(`/customer/orders/${placedOrder.orderId}`)}>
              Track This Order
            </button>
          </div>
        </section>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <section className="section container" style={{ maxWidth: 640 }}>
        <h1 style={{ fontSize: '1.8rem' }}>Checkout</h1>
        {error && <div className="alert alert-error">{error}</div>}

        <div className="card">
          <h3>Order Summary</h3>
          <p>Vendor: <strong>{cart.vendorName}</strong></p>
          <div className="table-wrap">
            <table>
              <thead><tr><th>Item</th><th>Qty</th><th>Unit Price</th><th>Subtotal</th></tr></thead>
              <tbody>
                {cart.items.map((it) => (
                  <tr key={it.foodId}>
                    <td>{it.name}</td><td>{it.quantity}</td><td>{formatNaira(it.price)}</td><td>{formatNaira(it.price * it.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex-between mt-16">
            <span>Total Amount</span>
            <strong style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem' }}>{formatNaira(subtotal)}</strong>
          </div>
        </div>

        <div className="card mt-24">
          <h3>Payment Method</h3>
          <div className="flex gap-16 flex-wrap">
            {[
              { id: 'pickup', label: 'Pay on Pickup' },
              { id: 'bank_transfer', label: 'Bank Transfer' },
              { id: 'paystack', label: 'Card (Paystack)', disabled: !PAYSTACK_ENABLED }
            ].map((opt) => (
              <label key={opt.id} className="card" style={{
                flex: 1, minWidth: 160, cursor: opt.disabled ? 'not-allowed' : 'pointer', opacity: opt.disabled ? 0.5 : 1,
                borderColor: paymentMethod === opt.id ? 'var(--color-primary)' : 'var(--color-border)'
              }}>
                <input
                  type="radio" name="paymentMethod" value={opt.id} disabled={opt.disabled}
                  checked={paymentMethod === opt.id} onChange={() => setPaymentMethod(opt.id)}
                  style={{ width: 'auto', marginRight: 8 }}
                />
                {opt.label}
                {opt.disabled && <div className="text-soft" style={{ fontSize: '0.78rem' }}>Currently unavailable</div>}
              </label>
            ))}
          </div>
          {paymentMethod === 'bank_transfer' && (
            <div className="alert alert-info mt-16">
              Transfer to: <strong>Campus Food Ordering — Zenith Bank — 1234567890.</strong> You'll be able to submit your
              transaction reference from your order details page after placing the order.
            </div>
          )}
        </div>

        <div className="card mt-24">
          <div className="field mb-0">
            <label>Pickup Note (optional)</label>
            <textarea rows={2} placeholder="E.g. extra pepper, no onions…" value={pickupNote} onChange={(e) => setPickupNote(e.target.value)} />
          </div>
        </div>

        <button className="btn btn-primary btn-block mt-24" disabled={loading} onClick={onPlaceOrder}>
          {loading ? 'Placing order…' : `Place Order · ${formatNaira(subtotal)}`}
        </button>
      </section>
    </PublicLayout>
  );
}
