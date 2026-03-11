import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Cookie, X } from 'lucide-react';

export const CookieConsent: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('cookie-consent');
    if (!consent) {
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookie-consent', 'true');
    setIsVisible(false);
  };

  const handleDecline = () => {
    localStorage.setItem('cookie-consent', 'false');
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          className="fixed bottom-6 left-6 right-6 md:left-auto md:right-8 md:w-[400px] z-[100]"
        >
          <div className="bg-white/95 backdrop-blur-md border border-zinc-200 rounded-3xl shadow-2xl p-6 flex flex-col gap-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-brand/10 flex items-center justify-center">
                  <Cookie className="w-5 h-5 text-brand" />
                </div>
                <h3 className="font-bold text-zinc-900">Configuración de Cookies</h3>
              </div>
              <button 
                onClick={() => setIsVisible(false)}
                className="p-1 hover:bg-zinc-100 rounded-lg transition-colors"
              >
                <X className="w-4 h-4 text-zinc-400" />
              </button>
            </div>
            
            <p className="text-sm text-zinc-600 leading-relaxed">
              Utilizamos cookies para mejorar tu experiencia en nuestra plataforma de píxeles. 
              Al continuar navegando, aceptas nuestra política de cookies.
            </p>

            <div className="flex gap-3">
              <button
                onClick={handleAccept}
                className="flex-1 bg-brand text-white py-2.5 rounded-xl font-bold text-sm hover:opacity-90 transition-opacity"
              >
                Aceptar todas
              </button>
              <button
                onClick={handleDecline}
                className="flex-1 bg-zinc-100 text-zinc-600 py-2.5 rounded-xl font-bold text-sm hover:bg-zinc-200 transition-colors"
              >
                Solo necesarias
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
