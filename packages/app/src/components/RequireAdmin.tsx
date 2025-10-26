import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { isAdmin } from '../lib/auth';

interface RequireAdminProps {
  children: ReactNode;
}

const RequireAdmin = ({ children }: RequireAdminProps) => {
  const token = localStorage.getItem('soyl_id_token');
  
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  
  if (!isAdmin()) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

export default RequireAdmin;

