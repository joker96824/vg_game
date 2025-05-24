import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { getToken, isTokenExpired } from '../services/authService';

interface PrivateRouteProps {
  children: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const location = useLocation();
  const token = getToken();

  // 检查 token 是否存在且有效
  if (!token || isTokenExpired(token)) {
    // 将用户重定向到登录页面，但保存他们尝试访问的页面
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default PrivateRoute; 