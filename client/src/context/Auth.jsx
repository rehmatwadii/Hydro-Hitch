import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { api, setCsrf } from '../api/client';
const AuthContext = createContext(null);
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const accept = useCallback((data) => {
    setUser(data.user);
    setCsrf(data.csrf);
    setError('');
  }, []);
  const refresh = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      accept(await api('/auth/me'));
    } catch (e) {
      if (e.status !== 401) setError(e.message);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [accept]);
  useEffect(() => {
    refresh();
    const expire = () => {
      setUser(null);
      setCsrf('');
    };
    window.addEventListener('hh:session-expired', expire);
    return () => window.removeEventListener('hh:session-expired', expire);
  }, [refresh]);
  async function logout() {
    try {
      await api('/auth/logout', { method: 'POST', body: {} });
    } catch (error) {
      if (error.status !== 401) throw error;
    }
    setUser(null);
    setCsrf('');
  }
  return (
    <AuthContext.Provider value={{ user, setUser, loading, error, refresh, accept, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
export const useAuth = () => useContext(AuthContext);
