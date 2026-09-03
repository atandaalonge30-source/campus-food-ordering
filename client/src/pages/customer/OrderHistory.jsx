import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { Loader, EmptyState } from '../../components/Loader.jsx';
import { OrderAPI } from '../../services/api.js';
import { formatNaira, formatDateTime } from '../../utils/format.js';

const NAV = [
  { to: '/customer/dashboard', label: 'Dashboard', icon: '🏠' },
  { to: '/browse', label: 'Browse Food', icon: '🍽️' },
  { to: '/vendors', label: 'Vendors', icon: '🏪' },
  { to: '/cart', label: 'Cart', icon: '🛒' },
  { to: '/customer/orders', label: 'Order History', icon: '📦', end: true },
  { to: '/customer/notifications', label: 'Notifications', icon: '🔔' },
  { to: '/customer/profile', label: 'Profile', icon: '👤' }
];

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    OrderAPI.myOrders().then(({ data }) => setOrders(data.orders)).finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout title="Order History" navItems={NAV} notificationsPath="/customer/notifications">
      {loading ? <Loader /> : orders.length === 0 ? (
        <EmptyState title="No orders yet" message="Your placed orders will show up here." action={<Link to="/browse" className="btn btn-primary mt-16">Browse Food</Link>} />
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr><th>Order #</th><th>Vendor</th><th>Total Amount</th><th>Payment</th><th>Status</th><th>Date</th><th>Time</th><th></th></tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>{o.order_number}</td>
                  <td>{o.business_name}</td>
                  <td>{formatNaira(o.total_amount)}</td>
                  <td><StatusBadge status={o.payment_status} /></td>
                  <td><StatusBadge status={o.order_status} /></td>
                  <td>{new Date(o.created_at).toLocaleDateString('en-NG')}</td>
                  <td>{new Date(o.created_at).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit' })}</td>
                  <td><Link to={`/customer/orders/${o.id}`} className="btn btn-outline btn-sm">View Details</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}
