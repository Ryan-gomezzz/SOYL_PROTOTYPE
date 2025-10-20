import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';

interface RequireAuthProps {
  children: ReactNode;
}

const RequireAuth = ({ children }: RequireAuthProps) => {
  const token = localStorage.getItem('soyl_id_token');
  
  if (!token) {
    return <Navigate to="/studio" replace />;
  }
  
  return <>{children}</>;
};

export default RequireAuth;
