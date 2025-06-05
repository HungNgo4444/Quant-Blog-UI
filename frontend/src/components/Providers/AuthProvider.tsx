'use client';

import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../store';
import { checkAuth, setUser } from '../../store/slices/authSlice';
import { clientCookies } from '../../services/TokenService';

interface AuthProviderProps {
  children: React.ReactNode;
  initialUser?: any;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children, initialUser }) => {
  const dispatch = useAppDispatch();
  const { user, isAuthenticated } = useAppSelector((state) => state.auth);

  useEffect(() => {
    // Nếu có initial user từ server-side nhưng Redux chưa có user
    if (initialUser && !user) {
      dispatch(setUser(initialUser));
    }
    
    // Nếu có token nhưng chưa có user, check auth
    else if (clientCookies.getAuthTokens() && !user && !initialUser) {
      dispatch(checkAuth());
    }
  }, [dispatch, user, initialUser]);

  return <>{children}</>;
};

export default AuthProvider; 