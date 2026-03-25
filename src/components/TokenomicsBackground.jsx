import React from 'react';
import { motion } from 'framer-motion';

const ScrollingStrip = ({ text, color, rotate, speed, reverse = false }) => {
  return (
    <div 
      className={`absolute w-[200%] h-12 sm:h-16 flex items-center overflow-hidden border-y-4 border-pepe-black ${color} shadow-[0_8px_0_0_#000]`}
      style={{ 
        transform: `rotate(${rotate}deg) translateY(-50%)`,
        left: '-50%',
        top: '50%'
      }}
    >
      <motion.div
        animate={{ x: reverse ? [0, '50%'] : [0, '-50%'] }}
        transition={{ duration: speed, repeat: Infinity, ease: "linear" }}
        className="flex whitespace-nowrap"
      >
        {Array.from({ length: 10 }).map((_, i) => (
          <span key={i} className="text-xl sm:text-2xl font-black italic uppercase px-8 flex items-center gap-4">
            {text}
            <span className="w-3 h-3 rounded-full bg-pepe-black" />
          </span>
        ))}
      </motion.div>
    </div>
  );
};

const TokenomicsBackground = ({ isEnabled = true }) => {
  if (!isEnabled) return <div className="absolute inset-0 bg-gray-50" />;

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-[#F8FAFC]">
      {/* Dynamic Animated Background Blobs */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          x: [0, 50, 0],
          y: [0, 30, 0]
        }}
        transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-[10%] -left-[10%] w-[60%] h-[60%] bg-pepe-green/20 blur-[100px] rounded-full" 
      />
      <motion.div 
        animate={{ 
          scale: [1.2, 1, 1.2],
          x: [0, -40, 0],
          y: [0, 50, 0]
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -bottom-[10%] -right-[10%] w-[60%] h-[60%] bg-pepe-pink/20 blur-[100px] rounded-full" 
      />
      <motion.div 
        animate={{ 
          opacity: [0.3, 0.6, 0.3],
          scale: [1, 1.5, 1]
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[40%] h-[40%] bg-pepe-yellow/20 blur-[120px] rounded-full" 
      />

      {/* Grid Pattern */}
      <div 
        className="absolute inset-0 opacity-[0.05]" 
        style={{ 
          backgroundImage: `radial-gradient(#000 2px, transparent 2px)`, 
          backgroundSize: '40px 40px' 
        }} 
      />

      {/* Animated Strips */}
      <div className="absolute inset-0 flex items-center justify-center opacity-40 sm:opacity-60 pointer-events-none">
        <ScrollingStrip 
          text="Pepe Wife • $PWIFE • Be Early ... or Cry Later" 
          color="bg-pepe-yellow" 
          rotate={-15} 
          speed={30} 
        />
        <ScrollingStrip 
          text="Be Early ... or Cry Later • Pepe Wife • $PWIFE" 
          color="bg-pepe-pink" 
          rotate={10} 
          speed={25} 
          reverse={true}
        />
        <ScrollingStrip 
          text="$PWIFE • Be Early ... or Cry Later • Pepe Wife" 
          color="bg-pepe-green" 
          rotate={-5} 
          speed={40} 
        />
      </div>

      {/* Noise Texture Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
    </div>
  );
};

export default TokenomicsBackground;
