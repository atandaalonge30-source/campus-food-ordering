import React from 'react';
import DashboardLayout from '../../layouts/DashboardLayout.jsx';
import OrderDetailBody from '../../components/OrderDetailBody.jsx';

const NAV = [
  { to: '/customer/dashboard', label: 'Dashboard', icon: '🏠' },
  { to: '/browse', label: 'Browse Food', icon: '🍽️' },
  { to: '/vendors', label: 'Vendors', icon: '🏪' },
  { to: '/cart', label: 'Cart', icon: '🛒' },
  { to: '/customer/orders', label: 'Order History', icon: '📦' },
  { to: '/customer/notifications', label: 'Notifications', icon: '🔔' },
  { to: '/customer/profile', label: 'Profile', icon: '👤' }
];

export default function CustomerOrderDetail() {
  return (
    <DashboardLayout title="Order Details" navItems={NAV} notificationsPath="/customer/notifications">
      <OrderDetailBody />
    </DashboardLayout>
  );
}
