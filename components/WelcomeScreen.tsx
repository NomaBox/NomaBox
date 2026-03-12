import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';

export const WelcomeScreen: React.FC = () => {
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('Iniciando...');

  useEffect(() => {
    const duration = 2000; // 2 seconds
    const intervalTime = 20;
    const steps = duration / intervalTime;
    const increment = 100 / steps;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return Math.min(prev + increment, 100);
      });
    }, intervalTime);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (progress < 30) setStatus('Cargando píxeles...');
    else if (progress < 60) setStatus('Preparando lienzo...');
    else if (progress < 90) setStatus('Sincronizando comunidad...');
    else setStatus('¡Todo listo!');
  }, [progress]);

  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="fixed inset-0 z-[200] bg-white flex flex-col items-center justify-center p-6"
    >
      <div className="relative flex flex-col items-center w-full max-w-xs">
        {/* Animated Logo/Icon Placeholder */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ 
            duration: 1, 
            ease: "easeOut",
            delay: 0.2
          }}
          className="w-24 h-24 bg-brand rounded-[2.5rem] shadow-2xl shadow-brand/20 flex items-center justify-center mb-12 relative overflow-hidden"
        >
          {/* Filling effect inside the logo */}
          <motion.div 
            className="absolute bottom-0 left-0 right-0 bg-black/10"
            initial={{ height: 0 }}
            animate={{ height: `${progress}%` }}
            transition={{ duration: 0.1 }}
          />
          <div className="w-10 h-10 bg-white rounded-lg rotate-12 z-10 shadow-sm" />
        </motion.div>

        {/* Welcome Text */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-center mb-12"
        >
          <h1 className="text-5xl font-black text-zinc-900 tracking-tighter mb-2">
            NOMA<span className="text-brand">.BOX</span>
          </h1>
          <p className="text-zinc-400 font-bold tracking-[0.2em] uppercase text-[10px]">
            Tu espacio en el lienzo infinito
          </p>
        </motion.div>

        {/* Progress Section */}
        <div className="w-full space-y-4">
          <div className="flex justify-between items-end px-1">
            <motion.p 
              key={status}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-[10px] font-black text-zinc-400 uppercase tracking-wider"
            >
              {status}
            </motion.p>
            <p className="text-[10px] font-mono font-black text-brand">
              {Math.round(progress)}%
            </p>
          </div>
          
          <div className="h-2 w-full bg-zinc-100 rounded-full overflow-hidden p-0.5 border border-zinc-50">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.1 }}
              className="h-full bg-brand rounded-full shadow-[0_0_15px_rgba(255,107,0,0.4)]"
            />
          </div>
        </div>

        {/* Decorative Grid Background (Subtle) */}
        <div className="absolute -z-10 opacity-[0.02] pointer-events-none scale-150">
           <div className="grid grid-cols-10 gap-2">
             {Array.from({ length: 100 }).map((_, i) => (
               <div key={i} className="w-4 h-4 bg-zinc-900 rounded-sm" />
             ))}
           </div>
        </div>
      </div>
    </motion.div>
  );
};
