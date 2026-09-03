import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout.jsx';
import { ADMIN_NAV } from './AdminDashboard.jsx';
import { Loader, EmptyState } from '../../components/Loader.jsx';
import StatusBadge from '../../components/StatusBadge.jsx';
import { AdminAPI } from '../../services/api.js';
import { formatNaira, formatDateTime } from '../../utils/format.js';

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AdminAPI.transactions().then(({ data }) => setTransactions(data.transactions)).finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout title="Transactions" navItems={ADMIN_NAV}>
      <div className="flex-between">
        <p className="mb-0">All recorded payment transactions across the platform.</p>
        <button className="btn btn-outline btn-sm" onClick={() => window.print()}>Print</button>
      </div>
      {loading ? <Loader /> : transactions.length === 0 ? (
        <EmptyState title="No transactions yet" message="" />
      ) : (
        <div className="table-wrap mt-16">
          <table>
            <thead><tr><th>Reference</th><th>Order #</th><th>Customer</th><th>Vendor</th><th>Amount</th><th>Method</th><th>Status</th><th>Date</th></tr></thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id}>
                  <td>{t.reference || '—'}</td><td>{t.order_number}</td><td>{t.customer_name}</td><td>{t.business_name}</td>
                  <td>{formatNaira(t.amount)}</td><td>{t.method.replace('_', ' ')}</td>
                  <td><StatusBadge status={t.status} /></td><td>{formatDateTime(t.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}
