import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout.jsx';
import { ADMIN_NAV } from './AdminDashboard.jsx';
import { Loader, EmptyState } from '../../components/Loader.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { AdminAPI } from '../../services/api.js';
import { formatNaira, formatDateTime } from '../../utils/format.js';

export default function AdminCustomerDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = () => {
    setLoading(true);
    AdminAPI.getCustomer(id).then(({ data }) => setData(data)).finally(() => setLoading(false));
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  const toggleStatus = async () => {
    setBusy(true);
    try {
      await AdminAPI.setCustomerStatus(id, data.customer.status === 'active' ? 'suspended' : 'active');
      load();
    } finally { setBusy(false); }
  };

  if (loading) return <DashboardLayout title="Customer Detail" navItems={ADMIN_NAV}><Loader /></DashboardLayout>;
  if (!data) return <DashboardLayout title="Customer Detail" navItems={ADMIN_NAV}><EmptyState title="Customer not found" message="" /></DashboardLayout>;

  const { customer, orders } = data;

  return (
    <DashboardLayout title="Customer Detail" navItems={ADMIN_NAV}>
      <div className="flex-between flex-wrap gap-16">
        <div>
          <h2 style={{ marginBottom: 2 }}>{customer.full_name}</h2>
          <p style={{ margin: 0 }}>{customer.email} · {customer.phone}</p>
        </div>
        <div className="flex gap-8" style={{ alignItems: 'center' }}>
          <StatusBadge status={customer.status} />
          <button className={customer.status === 'active' ? 'btn btn-danger btn-sm' : 'btn btn-secondary btn-sm'} disabled={busy} onClick={toggleStatus}>
            {customer.status === 'active' ? 'Suspend Account' : 'Activate Account'}
          </button>
        </div>
      </div>

      <h3 className="mt-24">Order History ({orders.length})</h3>
      {orders.length === 0 ? <EmptyState title="No orders yet" message="" /> : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Order #</th><th>Vendor</th><th>Total</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>{o.order_number}</td><td>{o.business_name}</td><td>{formatNaira(o.total_amount)}</td>
                  <td><StatusBadge status={o.order_status} /></td><td>{formatDateTime(o.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}
