"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

interface PinVerificationProps {
  onSuccess: () => void;
  onCancel: () => void;
}

const PinVerification: React.FC<PinVerificationProps> = ({ onSuccess, onCancel }) => {
  const [pin, setPin] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [showPin, setShowPin] = useState<boolean>(false);
  
  const correctPin = '060606'; // PIN de seguridad
  
  const handlePinChange = (value: string) => {
    if (pin.length < 6) {
      const newPin = pin + value;
      setPin(newPin);
      setError('');
      
      // Verificar automáticamente cuando se completan los 6 dígitos
      if (newPin.length === 6) {
        verifyPin(newPin);
      }
    }
  };
  
  const handleDelete = () => {
    setPin(pin.slice(0, -1));
    setError('');
  };
  
  const handleClear = () => {
    setPin('');
    setError('');
  };
  
  const verifyPin = (pinToVerify: string = pin) => {
    if (pinToVerify === correctPin) {
      // Guardar en sessionStorage que el PIN ha sido verificado
      sessionStorage.setItem('pinVerified', 'true');
      onSuccess();
    } else {
      setError('Código PIN incorrecto');
      setPin('');
    }
  };
  
  // Crear el teclado numérico
  const renderKeypad = () => {
    const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 'borrar', 0, 'limpiar'];
    
    return (
      <div className="grid grid-cols-3 gap-3 mt-6">
        {numbers.map((num, index) => {
          if (num === 'borrar') {
            return (
              <button
                key={`key-${index}`}
                onClick={handleDelete}
                className="p-4 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                ⌫
              </button>
            );
          } else if (num === 'limpiar') {
            return (
              <button
                key={`key-${index}`}
                onClick={handleClear}
                className="p-4 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                C
              </button>
            );
          } else {
            return (
              <button
                key={`key-${index}`}
                onClick={() => handlePinChange(num.toString())}
                className="p-4 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors text-xl font-medium"
              >
                {num}
              </button>
            );
          }
        })}
      </div>
    );
  };
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md border border-gray-700 shadow-xl">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Verificación de Seguridad</h2>
          <p className="text-gray-400 mb-6">
            Ingresa el código PIN de 6 dígitos para acceder al panel de administración
          </p>
          
          {/* Visualización del PIN */}
          <div className="flex justify-center mb-6">
            <div className="flex space-x-3">
              {[0, 1, 2, 3, 4, 5].map((i) => (
                <div
                  key={`pin-${i}`}
                  className="w-10 h-12 border-2 border-gray-600 rounded-md flex items-center justify-center"
                >
                  {pin.length > i ? (
                    showPin ? (
                      <span className="text-white text-xl">{pin[i]}</span>
                    ) : (
                      <span className="text-white text-xl">•</span>
                    )
                  ) : null}
                </div>
              ))}
            </div>
          </div>
          
          {/* Mostrar/Ocultar PIN */}
          <div className="flex items-center justify-center mb-4">
            <input
              type="checkbox"
              id="show-pin"
              className="mr-2"
              checked={showPin}
              onChange={() => setShowPin(!showPin)}
            />
            <label htmlFor="show-pin" className="text-gray-400 text-sm">
              Mostrar código
            </label>
          </div>
          
          {/* Mensaje de error */}
          {error && (
            <div className="bg-red-900/30 text-red-400 p-2 rounded-md mb-4">
              {error}
            </div>
          )}
          
          {/* Teclado numérico */}
          {renderKeypad()}
          
          {/* Botón de cancelar */}
          <button
            onClick={onCancel}
            className="mt-6 w-full py-2 bg-transparent border border-gray-600 text-gray-400 rounded-md hover:bg-gray-800 transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default PinVerification;
