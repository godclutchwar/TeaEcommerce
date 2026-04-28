import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { useCart } from './context/CartContext';
import { useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ShopPage from './pages/ShopPage';
import AboutPage from './pages/AboutPage';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import ConfirmPage from './pages/ConfirmPage';
import InventoryPage from './pages/InventoryPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import AdminUsersPage from './pages/AdminUsersPage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import Toast from './components/Toast';

export default function App() {
  const { fetchCart } = useCart();
  const { user, loading: authLoading } = useAuth();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/shop" element={<ShopPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/confirm/:orderId" element={<ConfirmPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/verify-email" element={<VerifyEmailPage />} />
        <Route path="/admin/inventory" element={
          <ProtectedRoute adminOnly>
            <InventoryPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute adminOnly>
            <AdminUsersPage />
          </ProtectedRoute>
        } />
      </Routes>
      <FooterWithConditionalHide />
      <Toast />
    </>
  );
}

/* PURPOSE: Footer that hides on the confirm page — the confirm page is designed
 * as a centered card on a blank backdrop, so footer would break the layout. */
function FooterWithConditionalHide() {
  const location = useLocation();
  if (location.pathname.startsWith('/confirm')) return null;
  return <Footer />;
}
