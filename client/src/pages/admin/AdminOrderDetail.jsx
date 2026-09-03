import React from 'react';
import DashboardLayout from '../../layouts/DashboardLayout.jsx';
import { ADMIN_NAV } from './AdminDashboard.jsx';
import OrderDetailBody from '../../components/OrderDetailBody.jsx';

export default function AdminOrderDetail() {
  return (
    <DashboardLayout title="Order Details" navItems={ADMIN_NAV}>
      <OrderDetailBody />
    </DashboardLayout>
  );
}
