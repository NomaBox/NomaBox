import React from 'react';
import { motion } from 'motion/react';

export const WelcomeScreen: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeInOut" }}
      className="fixed inset-0 z-[200] bg-white flex flex-col items-center justify-center p-6"
    >
      <div className="relative flex flex-col items-center">
        {/* Animated Logo/Icon Placeholder */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ 
            duration: 1, 
            ease: "easeOut",
            delay: 0.2
          }}
          className="w-24 h-24 bg-brand rounded-[2rem] shadow-2xl shadow-brand/20 flex items-center justify-center mb-8"
        >
          <div className="w-10 h-10 bg-white rounded-lg rotate-12" />
        </motion.div>

        {/* Welcome Text */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="text-center"
        >
          <h1 className="text-4xl font-black text-zinc-900 tracking-tighter mb-2">
            NOMA<span className="text-brand">.BOX</span>
          </h1>
          <p className="text-zinc-500 font-medium tracking-wide uppercase text-xs">
            Tu espacio en el lienzo infinito
          </p>
        </motion.div>

        {/* Loading Indicator */}
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: 120 }}
          transition={{ duration: 1.5, delay: 0.8, ease: "easeInOut" }}
          className="h-1 bg-brand/10 rounded-full mt-12 overflow-hidden"
        >
          <motion.div
            animate={{ x: [-120, 120] }}
            transition={{ 
              duration: 1.5, 
              repeat: Infinity, 
              ease: "linear" 
            }}
            className="w-1/2 h-full bg-brand"
          />
        </motion.div>
      </div>
    </motion.div>
  );
};
