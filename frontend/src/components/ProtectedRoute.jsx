import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  
  if (!token || !userStr) {
    return <Navigate to="/login" />;
  }
  
  const user = JSON.parse(userStr);
  
  if (adminOnly && user.role !== 'admin') {
    return <Navigate to="/member-dashboard" />;
  }

  return children;
};

export default ProtectedRoute;
