import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [tokens, setTokens] = useState({
    access_token: null,
    refresh_token: localStorage.getItem('refresh_token'),
  });

  const login = (newTokens) => {
    setTokens(newTokens);
    localStorage.setItem('refresh_token', newTokens.refresh_token);
  };

  const logout = () => {
    setUser(null);
    setTokens({ access_token: null, refresh_token: null });
    localStorage.removeItem('refresh_token');
  };

  const value = { user, tokens, login, logout, setUser };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};