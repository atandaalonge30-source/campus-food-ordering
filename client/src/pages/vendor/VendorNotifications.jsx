import React from 'react';
import DashboardLayout from '../../layouts/DashboardLayout.jsx';
import { VENDOR_NAV } from './VendorDashboard.jsx';
import NotificationsBody from '../../components/NotificationsBody.jsx';

export default function VendorNotifications() {
  return (
    <DashboardLayout title="Notifications" navItems={VENDOR_NAV} notificationsPath="/vendor/notifications">
      <NotificationsBody />
    </DashboardLayout>
  );
}
