import React from 'react';
import DashboardLayout from '../../layouts/DashboardLayout.jsx';
import NotificationsBody from '../../components/NotificationsBody.jsx';

const NAV = [
  { to: '/customer/dashboard', label: 'Dashboard', icon: '🏠' },
  { to: '/browse', label: 'Browse Food', icon: '🍽️' },
  { to: '/vendors', label: 'Vendors', icon: '🏪' },
  { to: '/cart', label: 'Cart', icon: '🛒' },
  { to: '/customer/orders', label: 'Order History', icon: '📦' },
  { to: '/customer/notifications', label: 'Notifications', icon: '🔔', end: true },
  { to: '/customer/profile', label: 'Profile', icon: '👤' }
];

export default function CustomerNotifications() {
  return (
    <DashboardLayout title="Notifications" navItems={NAV} notificationsPath="/customer/notifications">
      <NotificationsBody />
    </DashboardLayout>
  );
}
