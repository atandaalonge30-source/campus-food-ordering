import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout.jsx';
import { ADMIN_NAV } from './AdminDashboard.jsx';
import { Loader, EmptyState } from '../../components/Loader.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { OrderAPI } from '../../services/api.js';
import { formatNaira, formatDateTime } from '../../utils/format.js';

const ORDER_STATUSES = ['', 'pending', 'accepted', 'preparing', 'ready', 'completed', 'cancelled'];
const PAYMENT_STATUSES = ['', 'pending', 'paid', 'failed'];

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ customerSearch: '', orderStatus: '', paymentStatus: '', dateFrom: '', dateTo: '' });

  const load = () => {
    setLoading(true);
    const params = {};
    Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
    OrderAPI.adminListAll(params).then(({ data }) => setOrders(data.orders)).finally(() => setLoading(false));
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [filters.orderStatus, filters.paymentStatus]);

  const onSubmit = (e) => { e.preventDefault(); load(); };

  return (
    <DashboardLayout title="Order Monitoring" navItems={ADMIN_NAV}>
      <form onSubmit={onSubmit} className="card">
        <div className="flex gap-16 flex-wrap" style={{ alignItems: 'flex-end' }}>
          <div className="field" style={{ marginBottom: 0, minWidth: 200 }}>
            <label>Customer</label>
            <input placeholder="Search by name…" value={filters.customerSearch} onChange={(e) => setFilters({ ...filters, customerSearch: e.target.value })} />
          </div>
          <div className="field" style={{ marginBottom: 0, minWidth: 160 }}>
            <label>Order Status</label>
            <select value={filters.orderStatus} onChange={(e) => setFilters({ ...filters, orderStatus: e.target.value })}>
              {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s ? s[0].toUpperCase() + s.slice(1) : 'All'}</option>)}
            </select>
          </div>
          <div className="field" style={{ marginBottom: 0, minWidth: 160 }}>
            <label>Payment Status</label>
            <select value={filters.paymentStatus} onChange={(e) => setFilters({ ...filters, paymentStatus: e.target.value })}>
              {PAYMENT_STATUSES.map((s) => <option key={s} value={s}>{s ? s[0].toUpperCase() + s.slice(1) : 'All'}</option>)}
            </select>
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <label>From</label>
            <input type="date" value={filters.dateFrom} onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })} />
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <label>To</label>
            <input type="date" value={filters.dateTo} onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })} />
          </div>
          <button className="btn btn-primary">Filter</button>
        </div>
      </form>

      {loading ? <Loader /> : orders.length === 0 ? (
        <EmptyState title="No orders match these filters" message="Try adjusting your search." />
      ) : (
        <div className="table-wrap mt-16">
          <table>
            <thead><tr><th>Order #</th><th>Customer</th><th>Vendor</th><th>Total</th><th>Payment</th><th>Status</th><th>Date</th><th></th></tr></thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>{o.order_number}</td><td>{o.customer_name}</td><td>{o.business_name}</td>
                  <td>{formatNaira(o.total_amount)}</td>
                  <td><StatusBadge status={o.payment_status} /></td>
                  <td><StatusBadge status={o.order_status} /></td>
                  <td>{formatDateTime(o.created_at)}</td>
                  <td><Link to={`/admin/orders/${o.id}`} className="btn btn-outline btn-sm">View</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}
