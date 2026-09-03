import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout.jsx';
import { ADMIN_NAV } from './AdminDashboard.jsx';
import { Loader, EmptyState } from '../../components/Loader.jsx';
import { AdminAPI } from '../../services/api.js';
import { formatDateTime, titleCase } from '../../utils/format.js';

export default function AdminActivityLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    AdminAPI.activityLogs({ limit: 200 }).then(({ data }) => setLogs(data.logs)).finally(() => setLoading(false));
  }, []);

  return (
    <DashboardLayout title="Activity Log" navItems={ADMIN_NAV}>
      <p>A record of important actions across the platform (passwords, tokens, and secrets are never logged).</p>
      {loading ? <Loader /> : logs.length === 0 ? (
        <EmptyState title="No activity recorded yet" message="" />
      ) : (
        <div className="table-wrap">
          <table>
            <thead><tr><th>Action</th><th>User</th><th>Role</th><th>Details</th><th>Date</th></tr></thead>
            <tbody>
              {logs.map((l) => (
                <tr key={l.id}>
                  <td>{titleCase(l.action)}</td><td>{l.full_name || 'System'}</td><td>{l.role || 'N/A'}</td>
                  <td>{l.details}</td><td>{formatDateTime(l.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </DashboardLayout>
  );
}
