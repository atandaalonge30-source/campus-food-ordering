import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout.jsx';
import { ADMIN_NAV } from './AdminDashboard.jsx';
import { Loader, EmptyState } from '../../components/Loader.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { VendorAPI, assetUrl } from '../../services/api.js';
import { formatNaira, formatDateTime } from '../../utils/format.js';

export default function AdminVendorDetail() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  const load = () => {
    setLoading(true);
    VendorAPI.adminGetOne(id).then(({ data }) => setData(data)).finally(() => setLoading(false));
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [id]);

  const act = async (status) => {
    setBusy(true);
    try { await VendorAPI.adminSetStatus(id, status); load(); } finally { setBusy(false); }
  };

  if (loading) return <DashboardLayout title="Vendor Detail" navItems={ADMIN_NAV}><Loader /></DashboardLayout>;
  if (!data) return <DashboardLayout title="Vendor Detail" navItems={ADMIN_NAV}><EmptyState title="Vendor not found" message="" /></DashboardLayout>;

  const { vendor, foods, orders } = data;

  return (
    <DashboardLayout title="Vendor Detail" navItems={ADMIN_NAV}>
      <div className="flex-between flex-wrap gap-16">
        <div className="flex gap-16" style={{ alignItems: 'center' }}>
          <div style={{ width: 60, height: 60, borderRadius: 14, background: 'var(--color-surface-sunken)', overflow: 'hidden' }}>
            {vendor.logo && <img src={assetUrl(vendor.logo)} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
          </div>
          <div>
            <h2 style={{ marginBottom: 2 }}>{vendor.business_name}</h2>
            <p style={{ margin: 0 }}>{vendor.owner_name} · {vendor.email} · {vendor.phone}</p>
          </div>
        </div>
        <div className="flex gap-8">
          <StatusBadge status={vendor.approval_status} />
          {vendor.approval_status === 'pending' && (
            <>
              <button className="btn btn-secondary btn-sm" disabled={busy} onClick={() => act('approved')}>Approve</button>
              <button className="btn btn-danger btn-sm" disabled={busy} onClick={() => act('rejected')}>Reject</button>
            </>
          )}
          {vendor.approval_status === 'approved' && (
            <button className="btn btn-danger btn-sm" disabled={busy} onClick={() => act('suspended')}>Suspend</button>
          )}
          {(vendor.approval_status === 'suspended' || vendor.approval_status === 'rejected') && (
            <button className="btn btn-secondary btn-sm" disabled={busy} onClick={() => act('approved')}>Reactivate</button>
          )}
        </div>
      </div>
      <p className="mt-16">{vendor.description}</p>
      <p>Campus location: {vendor.campus_location}</p>

      <h3 className="mt-24">Food Items ({foods.length})</h3>
      {foods.length === 0 ? <EmptyState title="No food items" message="" /> : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Name</th><th>Category</th><th>Price</th><th>Availability</th></tr></thead>
            <tbody>
              {foods.map((f) => (
                <tr key={f.id}><td>{f.food_name}</td><td>{f.category_name || '—'}</td><td>{formatNaira(f.price)}</td><td><StatusBadge status={f.availability} /></td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h3 className="mt-24">Orders ({orders.length})</h3>
      {orders.length === 0 ? <EmptyState title="No orders yet" message="" /> : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Order #</th><th>Customer</th><th>Total</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}><td>{o.order_number}</td><td>{o.customer_name}</td><td>{formatNaira(o.total_amount)}</td><td><StatusBadge status={o.order_status} /></td><td>{formatDateTime(o.created_at)}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}
