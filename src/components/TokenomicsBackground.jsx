import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const ScrollingTextLine = ({ text, color, duration, direction = 1, yOffset }) => {
  return (
    <div 
      className="absolute w-full whitespace-nowrap overflow-hidden pointer-events-none"
      style={{ top: `${yOffset}%` }}
    >
      <motion.div
        animate={{ x: direction > 0 ? [0, '-50%'] : ['-50%', 0] }}
        transition={{ duration, repeat: Infinity, ease: "linear" }}
        className="flex w-fit"
      >
        {Array.from({ length: 12 }).map((_, i) => (
          <span 
            key={i} 
            className={`text-4xl md:text-7xl font-black uppercase px-8 md:px-16 ${color} opacity-20`}
            style={{ fontFamily: "'Luckiest Guy', cursive" }}
          >
            {text}
          </span>
        ))}
      </motion.div>
    </div>
  );
};

const TokenomicsBackground = ({ isEnabled = true }) => {
  if (!isEnabled) return <div className="absolute inset-0 bg-[#22C55E]" />;

  const lines = useMemo(() => [
    { text: "Buy PWIFE NOW", color: "text-pepe-yellow", duration: 35, direction: 1, yOffset: 5 },
    { text: "Be Early... Or Cry Later", color: "text-pepe-pink", duration: 45, direction: -1, yOffset: 20 },
    { text: "The Queen won’t wait for late buyers", color: "text-pepe-black", duration: 55, direction: 1, yOffset: 35 },
    { text: "Buy PWIFE NOW", color: "text-pepe-pink", duration: 40, direction: -1, yOffset: 50 },
    { text: "Be Early... Or Cry Later", color: "text-pepe-black", duration: 50, direction: 1, yOffset: 65 },
    { text: "The Queen won’t wait for late buyers", color: "text-pepe-yellow", duration: 60, direction: -1, yOffset: 80 },
    { text: "Buy PWIFE NOW", color: "text-pepe-black", duration: 42, direction: 1, yOffset: 92 },
  ], []);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-[#22C55E]">
      {/* Nature Green Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-pepe-green/20 via-transparent to-black/10" />
      
      {/* Moving Text Pattern Layer */}
      <div className="relative h-full w-full opacity-60">
        {lines.map((line, index) => (
          <ScrollingTextLine 
            key={index}
            {...line}
          />
        ))}
      </div>

      {/* Subtle Noise Texture for Cartoon/Meme feel */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      
      {/* Nature Glow Blobs */}
      <motion.div 
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.1, 0.3, 0.1]
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 left-1/4 w-[50%] h-[50%] bg-white/10 blur-[120px] rounded-full"
      />
    </div>
  );
};

export default TokenomicsBackground;
