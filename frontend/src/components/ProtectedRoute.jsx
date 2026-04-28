import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/* PURPOSE: Guards routes. If not logged in, redirects to /login.
 *           Optionally requires admin role.
 */
export default function ProtectedRoute({ children, adminOnly = false }) {
  const { token, isAdmin, loading } = useAuth();

  if (loading) return <div className="loading">Loading...</div>;

  if (!token) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/shop" replace />;

  return children;
}
