import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { JWTPayload, verifyToken } from '@/lib/jwt';

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [cedula, setCedula] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setIsAuthenticated(false);
      setLoading(false);
      return;
    }

    try {
      const payload = verifyToken(token) as JWTPayload;
      setIsAuthenticated(true);
      setIsAdmin(payload.isAdmin);
      setCedula(payload.cedula);
    } catch (error) {
      localStorage.removeItem('token');
      setIsAuthenticated(false);
    } finally {
      setLoading(false);
    }
  }, []);

  const login = (token: string) => {
    localStorage.setItem('token', token);
    const payload = verifyToken(token) as JWTPayload;
    setIsAuthenticated(true);
    setIsAdmin(payload.isAdmin);
    setCedula(payload.cedula);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setIsAdmin(false);
    setCedula(null);
    router.push('/espacio');
  };

  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  return {
    isAuthenticated,
    isAdmin,
    cedula,
    loading,
    login,
    logout,
    getAuthHeader,
  };
} 