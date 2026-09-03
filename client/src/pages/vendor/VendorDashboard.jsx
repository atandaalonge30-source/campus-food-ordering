import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout.jsx';
import { StatGrid, StatCard } from '../../components/StatCard.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { Loader, EmptyState } from '../../components/Loader.jsx';
import { VendorAPI } from '../../services/api.js';
import { formatNaira, formatDateTime } from '../../utils/format.js';

export const VENDOR_NAV = [
  { to: '/vendor/dashboard', label: 'Dashboard', icon: '🏠', end: true },
  { to: '/vendor/categories', label: 'Categories', icon: '🗂️' },
  { to: '/vendor/foods', label: 'Food Menu', icon: '🍛' },
  { to: '/vendor/orders', label: 'Orders', icon: '📦' },
  { to: '/vendor/sales-report', label: 'Sales Report', icon: '📊' },
  { to: '/vendor/notifications', label: 'Notifications', icon: '🔔' },
  { to: '/vendor/profile', label: 'Business Profile', icon: '🏪' },
  { to: '/vendor/account', label: 'Account', icon: '👤' }
];

export default function VendorDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    VendorAPI.myDashboard().then(({ data }) => setData(data)).finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout title="Vendor Dashboard" navItems={VENDOR_NAV} notificationsPath="/vendor/notifications">
      {loading ? <Loader /> : !data ? (
        <EmptyState title="Unable to load dashboard" message="Please try again shortly." />
      ) : (
        <>
          <h2>Welcome back, {data.vendor.business_name}</h2>
          <p>Location: {data.vendor.campus_location}</p>

          <StatGrid>
            <StatCard label="Total Food Items" value={data.stats.totalFoodItems} />
            <StatCard label="Available Food Items" value={data.stats.availableFoodItems} />
            <StatCard label="Today's Sales" value={formatNaira(data.stats.todaySales)} />
            <StatCard label="Total Sales" value={formatNaira(data.stats.totalSales)} />
          </StatGrid>

          <StatGrid>
            {['pending', 'accepted', 'preparing', 'ready', 'completed'].map((status) => {
              const found = data.stats.statusCounts?.find((s) => s.order_status === status);
              return <StatCard key={status} label={`${status[0].toUpperCase()}${status.slice(1)} Orders`} value={found?.cnt || 0} />;
            })}
          </StatGrid>

          <div className="flex-between">
            <h3>Recent Orders</h3>
            <Link to="/vendor/orders" className="btn btn-outline btn-sm">View All Orders</Link>
          </div>
          {data.recentOrders.length === 0 ? (
            <EmptyState title="No orders yet" message="New orders from customers will appear here." />
          ) : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Order #</th><th>Customer</th><th>Total</th><th>Status</th><th>Date</th><th></th></tr></thead>
                <tbody>
                  {data.recentOrders.map((o) => (
                    <tr key={o.id}>
                      <td>{o.order_number}</td>
                      <td>{o.customer_name}</td>
                      <td>{formatNaira(o.total_amount)}</td>
                      <td><StatusBadge status={o.order_status} /></td>
                      <td>{formatDateTime(o.created_at)}</td>
                      <td><Link to={`/vendor/orders/${o.id}`} className="btn btn-outline btn-sm">Manage</Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </DashboardLayout>
  );
}
