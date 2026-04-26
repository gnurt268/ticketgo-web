import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  selectIsAuthenticated,
  selectUser,
  openAuthModal,
} from '@/features/auth';
import { ROUTES } from '@/utils/constants';

const PrivateRoute = ({ children, roles = [] }) => {
  const location = useLocation();
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const user = useSelector(selectUser);

  useEffect(() => {
    if (!isAuthenticated) {
      dispatch(openAuthModal({ tab: 0 }));
    }
  }, [isAuthenticated, dispatch]);

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.HOME} state={{ from: location }} replace />;
  }

  if (roles.length > 0 && !roles.includes(user?.role)) {
    return <Navigate to={ROUTES.HOME} replace />;
  }

  return children;
};

export default PrivateRoute;
