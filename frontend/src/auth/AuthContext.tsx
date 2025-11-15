import { createContext, useContext, useState } from 'react';
import {
  setAccessToken,
  getAccessToken,
  setRefreshToken,
  getRefreshToken,
  removeTokens,
} from '../services/token';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [tokens, setTokens] = useState({
    access_token: getAccessToken(),
    refresh_token: getRefreshToken(),
  });

  const login = (newTokens) => {
    setAccessToken(newTokens.access_token);
    setRefreshToken(newTokens.refresh_token);
    setTokens({
      access_token: newTokens.access_token,
      refresh_token: newTokens.refresh_token,
    });
  };

  const logout = () => {
    setUser(null);
    removeTokens();
    setTokens({ access_token: null, refresh_token: null });
  };

  const value = { user, tokens, login, logout, setUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};