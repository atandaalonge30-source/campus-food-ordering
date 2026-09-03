import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout.jsx';
import { VENDOR_NAV } from './VendorDashboard.jsx';
import { StatGrid, StatCard } from '../../components/StatCard.jsx';
import { Loader, EmptyState } from '../../components/Loader.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { OrderAPI } from '../../services/api.js';
import { formatNaira, formatDateTime } from '../../utils/format.js';

export default function VendorSalesReport() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    OrderAPI.vendorSalesReport().then(({ data }) => setData(data)).finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout title="Sales Report" navItems={VENDOR_NAV} notificationsPath="/vendor/notifications">
      {loading ? <Loader /> : !data ? <EmptyState title="No data" message="Sales report unavailable." /> : (
        <>
          <div className="flex-between">
            <p className="mb-0">A summary of your completed sales.</p>
            <button className="btn btn-outline btn-sm" onClick={() => window.print()}>Print Report</button>
          </div>
          <StatGrid>
            <StatCard label="Today's Sales" value={formatNaira(data.summary.todaySales)} />
            <StatCard label="Weekly Sales" value={formatNaira(data.summary.weekSales)} />
            <StatCard label="Monthly Sales" value={formatNaira(data.summary.monthSales)} />
            <StatCard label="Total Sales" value={formatNaira(data.summary.totalSales)} />
          </StatGrid>

          <h3>All Orders</h3>
          {data.orders.length === 0 ? (
            <EmptyState title="No orders yet" message="Completed and cancelled orders will show sales performance here." />
          ) : (
            <div className="table-wrap">
              <table>
                <thead><tr><th>Order #</th><th>Customer</th><th>Total</th><th>Status</th><th>Date</th></tr></thead>
                <tbody>
                  {data.orders.map((o) => (
                    <tr key={o.id}>
                      <td>{o.order_number}</td>
                      <td>{o.customer_name}</td>
                      <td>{formatNaira(o.total_amount)}</td>
                      <td><StatusBadge status={o.order_status} /></td>
                      <td>{formatDateTime(o.created_at)}</td>
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
