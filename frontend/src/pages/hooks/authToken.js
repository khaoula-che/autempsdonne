import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useSessionTimeout } from './useSessionTimeout'; 

const ProtectedRoute = ({ userType }) => {
  const isAuth = !!localStorage.getItem('accessToken');
  const storedUserType = localStorage.getItem('userType');

  useSessionTimeout(); 

  if (!isAuth) {
    switch(userType) {
      case 'admin':
        return <Navigate to="/login" replace />;
      case 'volunteer':
        return <Navigate to="/loginb" replace />;
      case 'beneficiary':
        return <Navigate to="/loginb" replace />;
      case 'partner':
        return <Navigate to="/loginc" replace />;
      default:
        return <Navigate to="/loginb" replace />;
    }
  }

  if (userType && storedUserType !== userType) {
    return <Navigate to="/loginb" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
