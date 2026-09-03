import React from 'react';
import DashboardLayout from '../../layouts/DashboardLayout.jsx';
import { VENDOR_NAV } from './VendorDashboard.jsx';
import ProfileBody from '../../components/ProfileBody.jsx';

export default function VendorAccount() {
  return (
    <DashboardLayout title="Account Settings" navItems={VENDOR_NAV} notificationsPath="/vendor/notifications">
      <ProfileBody />
    </DashboardLayout>
  );
}
