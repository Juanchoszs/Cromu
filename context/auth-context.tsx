"use client";

import React, { createContext, useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Definir la interfaz para el usuario autenticado
interface User {
  id: string;
  username: string;
  role: 'admin' | 'user';
}

// Definir la interfaz para el contexto de autenticación
interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
  isAdmin: boolean;
}

// Crear el contexto de autenticación
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook personalizado para usar el contexto de autenticación
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

// Proveedor del contexto de autenticación
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Verificar si hay una sesión activa al cargar la página
  useEffect(() => {
    const checkSession = async () => {
      try {
        // Obtener el usuario de sessionStorage
        const storedUser = sessionStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Error al verificar la sesión:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkSession();
  }, []);

  // Función para iniciar sesión
  const login = async (username: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // En un sistema real, aquí harías una llamada a la API para verificar las credenciales
      // Por ahora, implementamos una verificación simple para demostración
      
      // Credenciales hardcodeadas para demostración (¡no hacer esto en producción!)
      const validCredentials = [
        { username: 'admin', password: 'admin123', role: 'admin' as const, id: '1' },
        { username: 'user', password: 'user123', role: 'user' as const, id: '2' }
      ];

      const matchedUser = validCredentials.find(
        u => u.username === username && u.password === password
      );

      if (matchedUser) {
        // Crear objeto de usuario autenticado
        const authenticatedUser: User = {
          id: matchedUser.id,
          username: matchedUser.username,
          role: matchedUser.role
        };

        // Guardar en el estado y en sessionStorage
        setUser(authenticatedUser);
        sessionStorage.setItem('user', JSON.stringify(authenticatedUser));
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Función para cerrar sesión
  const logout = () => {
    setUser(null);
    sessionStorage.removeItem('user');
    router.push('/');
  };

  // Valores del contexto
  const value = {
    user,
    isLoading,
    login,
    logout,
    isAuthenticated: !!user,
    isAdmin: user?.role === 'admin'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;
