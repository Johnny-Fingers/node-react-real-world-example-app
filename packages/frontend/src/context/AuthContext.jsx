import { createContext, useState, useEffect, useContext } from 'react';
import client, { setToken, getToken } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (token) {
      client.get('/user')
        .then((res) => setUser(res.data.user))
        .catch(() => {
          setToken(null);
          setUser(null);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await client.post('/users/login', { user: { email, password } });
    setToken(res.data.user.token);
    setUser(res.data.user);
    return res.data.user;
  };

  const register = async (username, email, password) => {
    const res = await client.post('/users', { user: { username, email, password } });
    setToken(res.data.user.token);
    setUser(res.data.user);
    return res.data.user;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  const updateUser = async (data) => {
    const res = await client.put('/user', { user: data });
    setUser(res.data.user);
    return res.data.user;
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
