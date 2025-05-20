import React, { useEffect, useState } from 'react';
import { CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SuccessNotificationProps {
  message: string;
  visible: boolean;
  onClose: () => void;
  duration?: number;
  position?: 'center' | 'top' | 'card';
  variant?: 'default' | 'minimal';
}

const SuccessNotification: React.FC<SuccessNotificationProps> = ({
  message,
  visible,
  onClose,
  duration = 2000,
  position = 'center',
  variant = 'default'
}) => {
  const [isVisible, setIsVisible] = useState(false);
  
  useEffect(() => {
    if (visible) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        setTimeout(onClose, 300); // Dar tiempo para que termine la animación
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [visible, duration, onClose]);

  // Determinar las clases según la posición
  const getPositionClasses = () => {
    switch (position) {
      case 'top':
        return 'absolute top-4 left-1/2 transform -translate-x-1/2';
      case 'card':
        return 'absolute inset-0 flex items-center justify-center bg-black bg-opacity-10 backdrop-blur-sm z-10';
      case 'center':
      default:
        return 'fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50';
    }
  };

  // Determinar las clases según la variante
  const getVariantClasses = () => {
    switch (variant) {
      case 'minimal':
        return 'bg-emerald-600 text-white shadow-lg';
      case 'default':
      default:
        return 'bg-white dark:bg-gray-800 shadow-xl';
    }
  };
  
    return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, x: 0 }}
          animate={{ opacity: 1, x: [0, 10, -10, 0] }}
          exit={{ opacity: 0 }}
          transition={{
            duration: 0.5,
            ease: 'easeInOut',
            type: 'tween', 
          }}
        >
          <motion.div
            initial={{ y: 10, scale: 0.9 }}
            animate={{ y: 0, scale: 1 }}
            exit={{ y: -10, scale: 0.9, opacity: 0 }}
            transition={{
              type: 'spring',
              stiffness: 300,
              damping: 25,
            }}
            className={`${getVariantClasses()} rounded-lg flex items-center gap-3 ${
              variant === 'minimal' ? 'px-5 py-3' : 'p-4'
            }`}
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1, rotate: [0, 10, -10, 0] }}
              transition={{
                duration: 0.5,
                ease: 'easeInOut', // ✅ Cambiamos de 'spring' a 'tween' para la animación con keyframes
                delay: 0.1,
                type: 'tween',
              }}
            >
              <CheckCircle
                className={`${
                  variant === 'minimal' ? 'w-5 h-5 text-white' : 'w-10 h-10 text-emerald-500'
                }`}
              />
            </motion.div>

            <motion.p
              initial={{ opacity: 0, x: 5 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className={`${
                variant === 'minimal' ? 'text-white' : 'text-gray-800 dark:text-white'
              } font-medium`}
            >
              {message}
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SuccessNotification;