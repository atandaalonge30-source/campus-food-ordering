import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout.jsx';
import { StatGrid, StatCard } from '../../components/StatCard.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { Loader, EmptyState } from '../../components/Loader.jsx';
import { OrderAPI, VendorAPI, FoodAPI } from '../../services/api.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { formatNaira, formatDateTime } from '../../utils/format.js';

const NAV = [
  { to: '/customer/dashboard', label: 'Dashboard', icon: '🏠', end: true },
  { to: '/browse', label: 'Browse Food', icon: '🍽️' },
  { to: '/vendors', label: 'Vendors', icon: '🏪' },
  { to: '/cart', label: 'Cart', icon: '🛒' },
  { to: '/customer/orders', label: 'Order History', icon: '📦' },
  { to: '/customer/notifications', label: 'Notifications', icon: '🔔' },
  { to: '/customer/profile', label: 'Profile', icon: '👤' }
];

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      OrderAPI.myOrders(),
      VendorAPI.listPublic(),
      FoodAPI.listPublic({ onlyAvailable: 'true' })
    ]).then(([o, v, f]) => {
      setOrders(o.data.orders);
      setVendors(v.data.vendors.slice(0, 4));
      setFoods(f.data.foods.slice(0, 4));
    }).finally(() => setLoading(false));
  }, []);

  const pending = orders.filter((o) => !['completed', 'cancelled'].includes(o.order_status));
  const recent = orders.slice(0, 5);

  return (
    <DashboardLayout title="Customer Dashboard" navItems={NAV} notificationsPath="/customer/notifications">
      <h2>Welcome, {user?.full_name?.split(' ')[0]} 👋</h2>
      <p>Here's what's happening with your campus food orders.</p>

      <StatGrid>
        <StatCard label="Available Vendors" value={vendors.length} />
        <StatCard label="Featured Food Items" value={foods.length} />
        <StatCard label="Pending Orders" value={pending.length} />
        <StatCard label="Total Orders Placed" value={orders.length} />
      </StatGrid>

      <div className="flex-between">
        <h3>Recent Orders</h3>
        <Link to="/customer/orders" className="btn btn-outline btn-sm">View Order History</Link>
      </div>
      {loading ? <Loader /> : recent.length === 0 ? (
        <EmptyState title="No orders yet" message="Browse the menu and place your first order." action={<Link to="/browse" className="btn btn-primary mt-16">Browse Food</Link>} />
      ) : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Order #</th><th>Vendor</th><th>Total</th><th>Status</th><th>Date</th><th></th></tr></thead>
            <tbody>
              {recent.map((o) => (
                <tr key={o.id}>
                  <td>{o.order_number}</td>
                  <td>{o.business_name}</td>
                  <td>{formatNaira(o.total_amount)}</td>
                  <td><StatusBadge status={o.order_status} /></td>
                  <td>{formatDateTime(o.created_at)}</td>
                  <td><Link to={`/customer/orders/${o.id}`} className="btn btn-outline btn-sm">View Details</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="flex-between mt-32">
        <h3>Available Vendors</h3>
        <Link to="/vendors" className="btn btn-outline btn-sm">Browse All</Link>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px,1fr))', gap: 16 }}>
        {vendors.map((v) => (
          <Link key={v.id} to={`/vendors/${v.id}`} className="card" style={{ textDecoration: 'none' }}>
            <h3 style={{ fontSize: '1rem' }}>{v.business_name}</h3>
            <p style={{ fontSize: '0.85rem', margin: 0 }}>{v.campus_location}</p>
          </Link>
        ))}
      </div>
    </DashboardLayout>
  );
}
