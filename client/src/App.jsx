import React from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute.jsx';

// Public pages
import Landing from './pages/public/Landing.jsx';
import Login from './pages/public/Login.jsx';
import RegisterChoice from './pages/public/RegisterChoice.jsx';
import CustomerRegister from './pages/public/CustomerRegister.jsx';
import VendorRegister from './pages/public/VendorRegister.jsx';
import BrowseVendors from './pages/public/BrowseVendors.jsx';
import BrowseFood from './pages/public/BrowseFood.jsx';
import VendorMenuPage from './pages/public/VendorMenuPage.jsx';
import Cart from './pages/public/Cart.jsx';
import Checkout from './pages/public/Checkout.jsx';
import NotFound from './pages/public/NotFound.jsx';

// Customer pages
import CustomerDashboard from './pages/customer/CustomerDashboard.jsx';
import OrderHistory from './pages/customer/OrderHistory.jsx';
import CustomerOrderDetail from './pages/customer/OrderDetail.jsx';
import CustomerNotifications from './pages/customer/Notifications.jsx';
import CustomerProfile from './pages/customer/Profile.jsx';

// Vendor pages
import VendorDashboard from './pages/vendor/VendorDashboard.jsx';
import VendorCategories from './pages/vendor/VendorCategories.jsx';
import VendorFoods from './pages/vendor/VendorFoods.jsx';
import VendorOrders from './pages/vendor/VendorOrders.jsx';
import VendorOrderDetail from './pages/vendor/VendorOrderDetail.jsx';
import VendorSalesReport from './pages/vendor/VendorSalesReport.jsx';
import VendorProfile from './pages/vendor/VendorProfile.jsx';
import VendorAccount from './pages/vendor/VendorAccount.jsx';
import VendorNotifications from './pages/vendor/VendorNotifications.jsx';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard.jsx';
import AdminVendors from './pages/admin/AdminVendors.jsx';
import AdminVendorDetail from './pages/admin/AdminVendorDetail.jsx';
import AdminCustomers from './pages/admin/AdminCustomers.jsx';
import AdminCustomerDetail from './pages/admin/AdminCustomerDetail.jsx';
import AdminOrders from './pages/admin/AdminOrders.jsx';
import AdminOrderDetail from './pages/admin/AdminOrderDetail.jsx';
import AdminTransactions from './pages/admin/AdminTransactions.jsx';
import AdminReports from './pages/admin/AdminReports.jsx';
import AdminActivityLog from './pages/admin/AdminActivityLog.jsx';
import AdminAccount from './pages/admin/AdminAccount.jsx';

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<RegisterChoice />} />
      <Route path="/register/customer" element={<CustomerRegister />} />
      <Route path="/register/vendor" element={<VendorRegister />} />
      <Route path="/vendors" element={<BrowseVendors />} />
      <Route path="/vendors/:id" element={<VendorMenuPage />} />
      <Route path="/browse" element={<BrowseFood />} />
      <Route path="/cart" element={<Cart />} />
      <Route path="/checkout" element={<Checkout />} />

      {/* Customer */}
      <Route path="/customer/dashboard" element={<ProtectedRoute role="customer"><CustomerDashboard /></ProtectedRoute>} />
      <Route path="/customer/orders" element={<ProtectedRoute role="customer"><OrderHistory /></ProtectedRoute>} />
      <Route path="/customer/orders/:id" element={<ProtectedRoute role="customer"><CustomerOrderDetail /></ProtectedRoute>} />
      <Route path="/customer/notifications" element={<ProtectedRoute role="customer"><CustomerNotifications /></ProtectedRoute>} />
      <Route path="/customer/profile" element={<ProtectedRoute role="customer"><CustomerProfile /></ProtectedRoute>} />

      {/* Vendor */}
      <Route path="/vendor/dashboard" element={<ProtectedRoute role="vendor"><VendorDashboard /></ProtectedRoute>} />
      <Route path="/vendor/categories" element={<ProtectedRoute role="vendor"><VendorCategories /></ProtectedRoute>} />
      <Route path="/vendor/foods" element={<ProtectedRoute role="vendor"><VendorFoods /></ProtectedRoute>} />
      <Route path="/vendor/orders" element={<ProtectedRoute role="vendor"><VendorOrders /></ProtectedRoute>} />
      <Route path="/vendor/orders/:id" element={<ProtectedRoute role="vendor"><VendorOrderDetail /></ProtectedRoute>} />
      <Route path="/vendor/sales-report" element={<ProtectedRoute role="vendor"><VendorSalesReport /></ProtectedRoute>} />
      <Route path="/vendor/profile" element={<ProtectedRoute role="vendor"><VendorProfile /></ProtectedRoute>} />
      <Route path="/vendor/account" element={<ProtectedRoute role="vendor"><VendorAccount /></ProtectedRoute>} />
      <Route path="/vendor/notifications" element={<ProtectedRoute role="vendor"><VendorNotifications /></ProtectedRoute>} />

      {/* Admin */}
      <Route path="/admin/dashboard" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
      <Route path="/admin/vendors" element={<ProtectedRoute role="admin"><AdminVendors /></ProtectedRoute>} />
      <Route path="/admin/vendors/:id" element={<ProtectedRoute role="admin"><AdminVendorDetail /></ProtectedRoute>} />
      <Route path="/admin/customers" element={<ProtectedRoute role="admin"><AdminCustomers /></ProtectedRoute>} />
      <Route path="/admin/customers/:id" element={<ProtectedRoute role="admin"><AdminCustomerDetail /></ProtectedRoute>} />
      <Route path="/admin/orders" element={<ProtectedRoute role="admin"><AdminOrders /></ProtectedRoute>} />
      <Route path="/admin/orders/:id" element={<ProtectedRoute role="admin"><AdminOrderDetail /></ProtectedRoute>} />
      <Route path="/admin/transactions" element={<ProtectedRoute role="admin"><AdminTransactions /></ProtectedRoute>} />
      <Route path="/admin/reports" element={<ProtectedRoute role="admin"><AdminReports /></ProtectedRoute>} />
      <Route path="/admin/activity-log" element={<ProtectedRoute role="admin"><AdminActivityLog /></ProtectedRoute>} />
      <Route path="/admin/account" element={<ProtectedRoute role="admin"><AdminAccount /></ProtectedRoute>} />

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
