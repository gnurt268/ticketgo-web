import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import {
  login as loginAction,
  logout as logoutAction,
  register as registerAction,
  selectAuth,
  selectUser,
  selectIsAuthenticated,
  selectIsLoading,
  selectError,
  clearError,
} from '@/features/auth';

export const useAuth = () => {
  const dispatch = useDispatch();
  const auth = useSelector(selectAuth);
  const user = useSelector(selectUser);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const isLoading = useSelector(selectIsLoading);
  const error = useSelector(selectError);

  const login = useCallback(
    (credentials) => dispatch(loginAction(credentials)),
    [dispatch]
  );

  const logout = useCallback(() => dispatch(logoutAction()), [dispatch]);

  const register = useCallback(
    (userData) => dispatch(registerAction(userData)),
    [dispatch]
  );

  const resetError = useCallback(() => dispatch(clearError()), [dispatch]);

  return {
    auth,
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    register,
    resetError,
  };
};

export default useAuth;
