import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const FloatingCircle = ({ delay, duration, size, initialX, initialY, color }) => {
  return (
    <motion.div
      initial={{ 
        x: initialX, 
        y: initialY,
        opacity: 0,
        scale: 0.5
      }}
      animate={{
        x: [initialX, initialX + 200, initialX - 150, initialX],
        y: [initialY, initialY + 300, initialY - 100, initialY],
        opacity: [0.4, 0.8, 0.4],
        scale: [1, 1.2, 0.9, 1],
        rotate: [0, 180, 360],
      }}
      transition={{
        duration: duration,
        repeat: Infinity,
        delay: delay,
        ease: "easeInOut",
      }}
      className={`absolute rounded-full border-4 border-pepe-black flex items-center justify-center overflow-hidden shadow-[8px_8px_0_0_#000] ${color}`}
      style={{ width: size, height: size }}
    >
      {/* Cartoon Border Animation Effect */}
      <motion.div 
        animate={{ rotate: 360 }}
        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
        className="absolute inset-0 border-t-4 border-white/40 rounded-full"
      />
      
      {/* Website Logo inside circle */}
      <img 
        src="/assets/hero-character.png" 
        alt="Pepe Wife" 
        className="w-[70%] h-[70%] object-contain drop-shadow-lg"
      />
    </motion.div>
  );
};

const RiskWarningBackground = () => {
  const colors = ['bg-pepe-yellow', 'bg-pepe-green', 'bg-pepe-pink'];
  
  const circles = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => ({
      id: i,
      size: Math.random() * 80 + 100, // 100px to 180px
      initialX: Math.random() * 80 + 10, // 10% to 90%
      initialY: Math.random() * 80 + 10, // 10% to 90%
      duration: Math.random() * 15 + 15, // 15s to 30s
      delay: Math.random() * 5,
      color: colors[i % colors.length]
    }));
  }, []);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Transparent background - just the floating circles */}
      {circles.map((circle) => (
        <FloatingCircle 
          key={circle.id}
          {...circle}
        />
      ))}

      {/* Subtle Color Glow in corners without full background */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-pepe-green/5 blur-[100px] rounded-full" />
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-pepe-pink/5 blur-[100px] rounded-full" />
    </div>
  );
};

export default RiskWarningBackground;
