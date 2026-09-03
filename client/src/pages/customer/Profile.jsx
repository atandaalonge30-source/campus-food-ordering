import React from 'react';
import DashboardLayout from '../../layouts/DashboardLayout.jsx';
import ProfileBody from '../../components/ProfileBody.jsx';

const NAV = [
  { to: '/customer/dashboard', label: 'Dashboard', icon: '🏠' },
  { to: '/browse', label: 'Browse Food', icon: '🍽️' },
  { to: '/vendors', label: 'Vendors', icon: '🏪' },
  { to: '/cart', label: 'Cart', icon: '🛒' },
  { to: '/customer/orders', label: 'Order History', icon: '📦' },
  { to: '/customer/notifications', label: 'Notifications', icon: '🔔' },
  { to: '/customer/profile', label: 'Profile', icon: '👤', end: true }
];

export default function CustomerProfile() {
  return (
    <DashboardLayout title="My Profile" navItems={NAV} notificationsPath="/customer/notifications">
      <ProfileBody />
    </DashboardLayout>
  );
}
