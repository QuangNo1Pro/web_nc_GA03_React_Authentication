import React from 'react';
// 1. Import 'Navigate' thay vì 'Redirect'
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  isAuthenticated: boolean;
  children: React.ReactNode; // 2. Dùng 'children' thay vì 'component'
}

// 3. Component này không còn dùng <Route> hay prop 'render'
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ isAuthenticated, children }) => {
  
  // 4. Nếu chưa xác thực, điều hướng về /login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // 5. Nếu đã xác thực, render các component con (children)
  return <>{children}</>;
};

export default ProtectedRoute;
