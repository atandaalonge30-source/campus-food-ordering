import React, { useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout.jsx';
import { ADMIN_NAV } from './AdminDashboard.jsx';
import { Loader, EmptyState } from '../../components/Loader.jsx';
import { AdminAPI } from '../../services/api.js';
import { formatDateTime } from '../../utils/format.js';

const REPORTS = [
  { type: 'customers', label: 'Customer Report' },
  { type: 'vendors', label: 'Vendor Report' },
  { type: 'foods', label: 'Food Report' },
  { type: 'orders', label: 'Order Report' },
  { type: 'pending-orders', label: 'Pending Order Report' },
  { type: 'completed-orders', label: 'Completed Order Report' },
  { type: 'cancelled-orders', label: 'Cancelled Order Report' },
  { type: 'transactions', label: 'Transaction Report' },
  { type: 'sales', label: 'Sales Report' }
];

export default function AdminReports() {
  const [active, setActive] = useState(null);
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(false);

  const runReport = async (type) => {
    setActive(type);
    setLoading(true);
    try {
      const { data } = await AdminAPI.report(type);
      setReport(data);
    } finally {
      setLoading(false);
    }
  };

  const columns = report?.rows?.[0] ? Object.keys(report.rows[0]).filter((k) => !k.toLowerCase().includes('password')) : [];

  return (
    <DashboardLayout title="Reports" navItems={ADMIN_NAV}>
      <p>Generate a printable report for any area of the platform.</p>
      <div className="flex gap-8 flex-wrap">
        {REPORTS.map((r) => (
          <button key={r.type} className={`btn btn-sm ${active === r.type ? 'btn-primary' : 'btn-outline'}`} onClick={() => runReport(r.type)}>
            {r.label}
          </button>
        ))}
      </div>

      {loading && <Loader />}

      {!loading && report && (
        <div className="mt-24">
          <div className="flex-between">
            <h3>{report.title}</h3>
            <button className="btn btn-outline btn-sm" onClick={() => window.print()}>Print Report</button>
          </div>
          <p className="text-soft">Generated {formatDateTime(report.generatedAt)} · {report.rows.length} record(s)</p>
          {report.rows.length === 0 ? <EmptyState title="No records found" message="" /> : (
            <div className="table-wrap">
              <table>
                <thead><tr>{columns.map((c) => <th key={c}>{c.replace(/_/g, ' ')}</th>)}</tr></thead>
                <tbody>
                  {report.rows.map((row, i) => (
                    <tr key={i}>{columns.map((c) => <td key={c}>{String(row[c] ?? 'N/A')}</td>)}</tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </DashboardLayout>
  );
}
