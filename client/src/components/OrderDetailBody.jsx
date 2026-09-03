import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import OrderProgress from './OrderProgress.jsx';
import StatusBadge from './StatusBadge.jsx';
import { Loader, EmptyState } from './Loader.jsx';
import ConfirmModal from './ConfirmModal.jsx';
import { OrderAPI } from '../services/api.js';
import { formatNaira, formatDateTime } from '../utils/format.js';
import { useAuth } from '../context/AuthContext.jsx';

const NEXT_STATUS = { pending: 'accepted', accepted: 'preparing', preparing: 'ready', ready: 'completed' };
const NEXT_LABEL = { pending: 'Accept Order', accepted: 'Start Preparing', preparing: 'Mark Ready', ready: 'Mark Completed' };

export default function OrderDetailBody() {
  const { id } = useParams();
  const { user } = useAuth();
  const [order, setOrder] = useState(null);
  const [items, setItems] = useState([]);
  const [payment, setPayment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [reference, setReference] = useState('');
  const [busy, setBusy] = useState(false);
  const [cancelModal, setCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState('');

  const load = () => {
    setLoading(true);
    OrderAPI.getOne(id)
      .then(({ data }) => { setOrder(data.order); setItems(data.items); setPayment(data.payment); })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  const doStatusUpdate = async (status, cancellationReason) => {
    setBusy(true);
    setError('');
    try {
      await OrderAPI.updateStatus(id, { status, cancellationReason });
      setCancelModal(false);
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const submitReference = async () => {
    if (!reference.trim()) return;
    setBusy(true);
    setError('');
    try {
      await OrderAPI.updatePayment(id, { reference });
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const confirmPayment = async (paymentStatus) => {
    setBusy(true);
    try {
      await OrderAPI.updatePayment(id, { paymentStatus });
      load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Loader />;
  if (error && !order) return <EmptyState title="Order not found" message={error} />;
  if (!order) return null;

  const isVendorViewer = user?.role === 'vendor';
  const isCustomerViewer = user?.role === 'customer';
  const isAdminViewer = user?.role === 'admin';
  const canAdvance = isVendorViewer && NEXT_STATUS[order.order_status];

  return (
    <div>
      {error && <div className="alert alert-error">{error}</div>}

      <div className="flex-between flex-wrap gap-16">
        <div>
          <h2 style={{ marginBottom: 4 }}>{order.order_number}</h2>
          <p style={{ margin: 0 }}>Placed {formatDateTime(order.created_at)}</p>
        </div>
        <div className="flex gap-8">
          <StatusBadge status={order.order_status} />
          <StatusBadge status={order.payment_status} />
        </div>
      </div>

      <div className="card mt-16">
        <OrderProgress status={order.order_status} />
        {order.order_status === 'cancelled' && order.cancellation_reason && (
          <p className="text-center text-soft">Reason: {order.cancellation_reason}</p>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px,1fr))', gap: 16 }} className="mt-24">
        <div className="card">
          <h3 style={{ fontSize: '1rem' }}>Vendor</h3>
          <p>{order.business_name}</p>
        </div>
        <div className="card">
          <h3 style={{ fontSize: '1rem' }}>Customer</h3>
          <p style={{ marginBottom: 2 }}>{order.customer_name}</p>
          {(isVendorViewer || isAdminViewer) && <p style={{ margin: 0 }} className="text-soft">{order.customer_phone} · {order.customer_email}</p>}
        </div>
        <div className="card">
          <h3 style={{ fontSize: '1rem' }}>Payment</h3>
          <p style={{ marginBottom: 2 }}>{order.payment_method.replace('_', ' ')}</p>
          {payment?.reference && <p className="text-soft" style={{ margin: 0 }}>Ref: {payment.reference}</p>}
        </div>
      </div>

      {order.pickup_note && (
        <div className="alert alert-info mt-16">Pickup note: {order.pickup_note}</div>
      )}

      <h3 className="mt-24">Order Items</h3>
      <div className="table-wrap">
        <table>
          <thead><tr><th>Food</th><th>Unit Price</th><th>Quantity</th><th>Subtotal</th></tr></thead>
          <tbody>
            {items.map((it) => (
              <tr key={it.id}>
                <td>{it.food_name}</td><td>{formatNaira(it.unit_price)}</td><td>{it.quantity}</td><td>{formatNaira(it.subtotal)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr><td colSpan={3} style={{ textAlign: 'right', fontWeight: 700 }}>Total</td><td style={{ fontWeight: 700 }}>{formatNaira(order.total_amount)}</td></tr>
          </tfoot>
        </table>
      </div>

      {/* Customer: submit bank transfer proof */}
      {isCustomerViewer && order.payment_method === 'bank_transfer' && order.payment_status === 'pending' && (
        <div className="card mt-24">
          <h3>Submit Payment Reference</h3>
          <p>Enter the transaction reference from your bank transfer so the vendor can verify your payment.</p>
          <div className="flex gap-12 flex-wrap">
            <input placeholder="Transaction reference" value={reference} onChange={(e) => setReference(e.target.value)} style={{ flex: 1, minWidth: 200, padding: '12px 14px', border: '1px solid var(--color-border)', borderRadius: 8 }} />
            <button className="btn btn-primary" disabled={busy} onClick={submitReference}>Submit</button>
          </div>
        </div>
      )}

      {/* Vendor: order workflow actions */}
      {isVendorViewer && !['completed', 'cancelled'].includes(order.order_status) && (
        <div className="card mt-24">
          <h3>Update Order Status</h3>
          <div className="flex gap-12 flex-wrap">
            {canAdvance && (
              <button className="btn btn-secondary" disabled={busy} onClick={() => doStatusUpdate(NEXT_STATUS[order.order_status])}>
                {NEXT_LABEL[order.order_status]}
              </button>
            )}
            <button className="btn btn-danger" disabled={busy} onClick={() => setCancelModal(true)}>Cancel Order</button>
            {order.payment_status !== 'paid' && (
              <button className="btn btn-outline" disabled={busy} onClick={() => confirmPayment('paid')}>Mark Payment as Paid</button>
            )}
          </div>
        </div>
      )}

      <ConfirmModal
        open={cancelModal}
        title="Cancel this order?"
        message="Please provide a reason for cancelling — the customer will see this."
        confirmLabel="Cancel Order"
        danger
        onCancel={() => setCancelModal(false)}
        onConfirm={() => doStatusUpdate('cancelled', cancelReason)}
      >
        <div className="field">
          <textarea rows={3} placeholder="E.g. Out of stock" value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} />
        </div>
      </ConfirmModal>
    </div>
  );
}
