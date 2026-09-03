import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout.jsx';
import { ADMIN_NAV } from './AdminDashboard.jsx';
import { Loader, EmptyState } from '../../components/Loader.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { VendorAPI } from '../../services/api.js';

const FILTERS = ['', 'pending', 'approved', 'rejected', 'suspended'];

export default function AdminVendors() {
  const [vendors, setVendors] = useState([]);
  const [status, setStatus] = useState('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const load = () => {
    setLoading(true);
    VendorAPI.adminListAll({ status: status || undefined, search: search || undefined })
      .then(({ data }) => setVendors(data.vendors)).finally(() => setLoading(false));
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, [status]);

  const onSearchSubmit = (e) => { e.preventDefault(); load(); };

  const act = async (id, newStatus) => {
    setBusyId(id);
    try {
      await VendorAPI.adminSetStatus(id, newStatus);
      load();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <DashboardLayout title="Vendor Approvals" navItems={ADMIN_NAV}>
      <div className="flex-between flex-wrap gap-16">
        <div className="flex gap-8 flex-wrap">
          {FILTERS.map((f) => (
            <button key={f || 'all'} className={`btn btn-sm ${status === f ? 'btn-primary' : 'btn-outline'}`} onClick={() => setStatus(f)}>
              {f ? f[0].toUpperCase() + f.slice(1) : 'All'}
            </button>
          ))}
        </div>
        <form onSubmit={onSearchSubmit} className="flex gap-8">
          <input placeholder="Search vendors…" value={search} onChange={(e) => setSearch(e.target.value)} style={{ padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: 8 }} />
          <button className="btn btn-outline btn-sm">Search</button>
        </form>
      </div>

      {loading ? <Loader /> : vendors.length === 0 ? (
        <EmptyState title="No vendors found" message="Try a different filter or search term." />
      ) : (
        <div className="table-wrap mt-16">
          <table>
            <thead><tr><th>Business</th><th>Owner</th><th>Email</th><th>Location</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {vendors.map((v) => (
                <tr key={v.id}>
                  <td>{v.business_name}</td>
                  <td>{v.owner_name}</td>
                  <td>{v.email}</td>
                  <td>{v.campus_location}</td>
                  <td><StatusBadge status={v.approval_status} /></td>
                  <td>
                    <div className="flex gap-8 flex-wrap">
                      <Link to={`/admin/vendors/${v.id}`} className="btn btn-outline btn-sm">View</Link>
                      {v.approval_status === 'pending' && (
                        <>
                          <button className="btn btn-secondary btn-sm" disabled={busyId === v.id} onClick={() => act(v.id, 'approved')}>Approve</button>
                          <button className="btn btn-danger btn-sm" disabled={busyId === v.id} onClick={() => act(v.id, 'rejected')}>Reject</button>
                        </>
                      )}
                      {v.approval_status === 'approved' && (
                        <button className="btn btn-danger btn-sm" disabled={busyId === v.id} onClick={() => act(v.id, 'suspended')}>Suspend</button>
                      )}
                      {(v.approval_status === 'suspended' || v.approval_status === 'rejected') && (
                        <button className="btn btn-secondary btn-sm" disabled={busyId === v.id} onClick={() => act(v.id, 'approved')}>Reactivate</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}
