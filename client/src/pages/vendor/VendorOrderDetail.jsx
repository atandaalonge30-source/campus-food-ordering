import React from 'react';
import DashboardLayout from '../../layouts/DashboardLayout.jsx';
import { VENDOR_NAV } from './VendorDashboard.jsx';
import OrderDetailBody from '../../components/OrderDetailBody.jsx';

export default function VendorOrderDetail() {
  return (
    <DashboardLayout title="Order Details" navItems={VENDOR_NAV} notificationsPath="/vendor/notifications">
      <OrderDetailBody />
    </DashboardLayout>
  );
}
