import { Navigate } from 'react-router-dom';
import type { ReactNode } from 'react';
import { isAuthenticated } from '@/lib/storage';

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}
