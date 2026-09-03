import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout.jsx';
import { VENDOR_NAV } from './VendorDashboard.jsx';
import { Loader, EmptyState } from '../../components/Loader.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { OrderAPI } from '../../services/api.js';
import { formatNaira, formatDateTime } from '../../utils/format.js';

const STATUS_FILTERS = ['', 'pending', 'accepted', 'preparing', 'ready', 'completed', 'cancelled'];

export default function VendorOrders() {
  const [orders, setOrders] = useState([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    OrderAPI.vendorOrders(status ? { status } : {}).then(({ data }) => setOrders(data.orders)).finally(() => setLoading(false));
  }, [status]);

  return (
    <DashboardLayout title="Incoming Orders" navItems={VENDOR_NAV} notificationsPath="/vendor/notifications">
      <div className="flex gap-8 flex-wrap mb-0" style={{ marginBottom: 16 }}>
        {STATUS_FILTERS.map((s) => (
          <button key={s || 'all'} className={`btn btn-sm ${status === s ? 'btn-primary' : 'btn-outline'}`} onClick={() => setStatus(s)}>
            {s ? s[0].toUpperCase() + s.slice(1) : 'All'}
          </button>
        ))}
      </div>

      {loading ? <Loader /> : orders.length === 0 ? (
        <EmptyState title="No orders here" message="Orders matching this filter will show up here." />
      ) : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Order #</th><th>Customer</th><th>Phone</th><th>Total</th><th>Payment</th><th>Status</th><th>Date</th><th></th></tr></thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>{o.order_number}</td>
                  <td>{o.customer_name}</td>
                  <td>{o.customer_phone}</td>
                  <td>{formatNaira(o.total_amount)}</td>
                  <td><StatusBadge status={o.payment_status} /></td>
                  <td><StatusBadge status={o.order_status} /></td>
                  <td>{formatDateTime(o.created_at)}</td>
                  <td><Link to={`/vendor/orders/${o.id}`} className="btn btn-outline btn-sm">Manage</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}
