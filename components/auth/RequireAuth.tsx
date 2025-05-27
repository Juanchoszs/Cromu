"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import PinVerification from './PinVerification';

interface RequireAuthProps {
  children: React.ReactNode;
}

const RequireAuth: React.FC<RequireAuthProps> = ({ children }) => {
  const [isPinVerified, setIsPinVerified] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    // Verificar si el PIN ya ha sido validado en esta sesión
    const pinVerified = sessionStorage.getItem('pinVerified') === 'true';
    setIsPinVerified(pinVerified);
    setIsLoading(false);
  }, []);

  const handlePinSuccess = () => {
    setIsPinVerified(true);
  };

  const handlePinCancel = () => {
    // Redirigir al usuario a la página principal si cancela la verificación
    router.push('/');
  };

  // Mostrar spinner mientras verifica la sesión
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  // Si el PIN no ha sido verificado, mostrar la pantalla de verificación
  if (!isPinVerified) {
    return <PinVerification onSuccess={handlePinSuccess} onCancel={handlePinCancel} />;
  }

  // Si el PIN ha sido verificado, mostrar el contenido protegido
  return <>{children}</>;
};

export default RequireAuth;
