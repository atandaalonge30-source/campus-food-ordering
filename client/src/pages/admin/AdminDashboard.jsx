import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout.jsx';
import { StatGrid, StatCard } from '../../components/StatCard.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { Loader, EmptyState } from '../../components/Loader.jsx';
import { AdminAPI } from '../../services/api.js';
import { formatNaira, formatDateTime, titleCase } from '../../utils/format.js';

export const ADMIN_NAV = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: '🏠', end: true },
  { to: '/admin/vendors', label: 'Vendor Approvals', icon: '🏪' },
  { to: '/admin/customers', label: 'Customers', icon: '👥' },
  { to: '/admin/orders', label: 'Order Monitoring', icon: '📦' },
  { to: '/admin/transactions', label: 'Transactions', icon: '💳' },
  { to: '/admin/reports', label: 'Reports', icon: '📊' },
  { to: '/admin/activity-log', label: 'Activity Log', icon: '📜' },
  { to: '/admin/account', label: 'Account', icon: '👤' }
];

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AdminAPI.dashboard().then(({ data }) => setData(data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <DashboardLayout title="Admin Dashboard" navItems={ADMIN_NAV}><Loader /></DashboardLayout>;
  if (!data) return <DashboardLayout title="Admin Dashboard" navItems={ADMIN_NAV}><EmptyState title="Unable to load dashboard" message="Please try again." /></DashboardLayout>;

  const s = data.stats;

  return (
    <DashboardLayout title="Admin Dashboard" navItems={ADMIN_NAV}>
      <h2>Platform Overview</h2>
      <StatGrid>
        <StatCard label="Total Customers" value={s.totalCustomers} />
        <StatCard label="Total Vendors" value={s.totalVendors} />
        <StatCard label="Pending Vendor Applications" value={s.pendingVendors} />
        <StatCard label="Approved Vendors" value={s.approvedVendors} />
        <StatCard label="Suspended Vendors" value={s.suspendedVendors} />
        <StatCard label="Total Food Items" value={s.totalFoodItems} />
      </StatGrid>
      <StatGrid>
        <StatCard label="Total Orders" value={s.totalOrders} />
        <StatCard label="Pending Orders" value={s.pendingOrders} />
        <StatCard label="Completed Orders" value={s.completedOrders} />
        <StatCard label="Cancelled Orders" value={s.cancelledOrders} />
        <StatCard label="Total Transactions" value={s.totalTransactions} />
        <StatCard label="Total Recorded Sales" value={formatNaira(s.totalSales)} />
      </StatGrid>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px,1fr))', gap: 24 }}>
        <div>
          <h3>Recent Orders</h3>
          {data.recentOrders.length === 0 ? <EmptyState title="No orders yet" message="" /> : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Order #</th><th>Customer</th><th>Vendor</th><th>Status</th></tr></thead>
                <tbody>
                  {data.recentOrders.map((o) => (
                    <tr key={o.order_number}>
                      <td>{o.order_number}</td><td>{o.customer_name}</td><td>{o.business_name}</td>
                      <td><StatusBadge status={o.order_status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <div>
          <h3>Recent Activity</h3>
          {data.recentActivity.length === 0 ? <EmptyState title="No activity yet" message="" /> : (
            <div className="flex" style={{ flexDirection: 'column', gap: 8 }}>
              {data.recentActivity.map((a) => (
                <div key={a.id} className="card" style={{ padding: 12 }}>
                  <p style={{ margin: 0, fontWeight: 600, fontSize: '0.88rem' }}>{titleCase(a.action)}</p>
                  <p style={{ margin: '2px 0 0', fontSize: '0.8rem' }}>{a.details}</p>
                  <p className="text-soft" style={{ margin: 0, fontSize: '0.74rem' }}>{formatDateTime(a.created_at)}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
