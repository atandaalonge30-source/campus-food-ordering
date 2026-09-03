import React from 'react';
import DashboardLayout from '../../layouts/DashboardLayout.jsx';
import { ADMIN_NAV } from './AdminDashboard.jsx';
import ProfileBody from '../../components/ProfileBody.jsx';

export default function AdminAccount() {
  return (
    <DashboardLayout title="Account Settings" navItems={ADMIN_NAV}>
      <ProfileBody />
    </DashboardLayout>
  );
}
