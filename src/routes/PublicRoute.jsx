import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { selectIsAuthenticated } from '@/features/auth';
import { ROUTES } from '@/utils/constants';

const PublicRoute = ({ children, restricted = false }) => {
  const location = useLocation();
  const isAuthenticated = useSelector(selectIsAuthenticated);

  // If restricted and user is authenticated, redirect to home or previous page
  if (restricted && isAuthenticated) {
    const from = location.state?.from?.pathname || ROUTES.HOME;
    return <Navigate to={from} replace />;
  }

  return children;
};

export default PublicRoute;
