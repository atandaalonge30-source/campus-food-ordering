import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../layouts/DashboardLayout.jsx';
import { ADMIN_NAV } from './AdminDashboard.jsx';
import { Loader, EmptyState } from '../../components/Loader.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { AdminAPI } from '../../services/api.js';
import { formatDate } from '../../utils/format.js';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const load = () => {
    setLoading(true);
    AdminAPI.listCustomers({ search: search || undefined }).then(({ data }) => setCustomers(data.customers)).finally(() => setLoading(false));
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const onSearchSubmit = (e) => { e.preventDefault(); load(); };

  const toggleStatus = async (c) => {
    setBusyId(c.id);
    try {
      await AdminAPI.setCustomerStatus(c.id, c.status === 'active' ? 'suspended' : 'active');
      load();
    } finally {
      setBusyId(null);
    }
  };

  return (
    <DashboardLayout title="Customer Management" navItems={ADMIN_NAV}>
      <form onSubmit={onSearchSubmit} className="flex gap-8 mb-0" style={{ marginBottom: 16, maxWidth: 360 }}>
        <input placeholder="Search customers by name or email…" value={search} onChange={(e) => setSearch(e.target.value)} style={{ flex: 1, padding: '10px 12px', border: '1px solid var(--color-border)', borderRadius: 8 }} />
        <button className="btn btn-outline btn-sm">Search</button>
      </form>

      {loading ? <Loader /> : customers.length === 0 ? (
        <EmptyState title="No customers found" message="" />
      ) : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Status</th><th>Joined</th><th></th></tr></thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id}>
                  <td>{c.full_name}</td>
                  <td>{c.email}</td>
                  <td>{c.phone}</td>
                  <td><StatusBadge status={c.status} /></td>
                  <td>{formatDate(c.created_at)}</td>
                  <td>
                    <div className="flex gap-8">
                      <Link to={`/admin/customers/${c.id}`} className="btn btn-outline btn-sm">View</Link>
                      <button className={c.status === 'active' ? 'btn btn-danger btn-sm' : 'btn btn-secondary btn-sm'} disabled={busyId === c.id} onClick={() => toggleStatus(c)}>
                        {c.status === 'active' ? 'Suspend' : 'Activate'}
                      </button>
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
