import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const TokenomicsBackground = ({ isEnabled = true }) => {
  // إنشاء دوائر عائمة عشوائية
  const circles = useMemo(() => {
    return Array.from({ length: 15 }).map((_, i) => ({
      id: i,
      size: Math.random() * 300 + 100,
      x: Math.random() * 100,
      y: Math.random() * 100,
      duration: Math.random() * 20 + 10,
      delay: Math.random() * 5,
    }));
  }, []);

  return (
    <div className="absolute inset-0 z-0 overflow-hidden bg-pepe-yellow/5">
      {/* شبكة خلفية ناعمة */}
      <div 
        className="absolute inset-0 opacity-[0.03]" 
        style={{ 
          backgroundImage: `radial-gradient(#000 1px, transparent 1px)`, 
          backgroundSize: '30px 30px' 
        }} 
      />

      {/* دوائر متحركة */}
      {circles.map((circle) => (
        <motion.div
          key={circle.id}
          className="absolute rounded-full bg-pepe-yellow/10 border-2 border-pepe-yellow/20"
          style={{
            width: circle.size,
            height: circle.size,
            left: `${circle.x}%`,
            top: `${circle.y}%`,
          }}
          animate={isEnabled ? {
            x: [0, 50, -50, 0],
            y: [0, -50, 50, 0],
            scale: [1, 1.1, 0.9, 1],
            rotate: [0, 90, -90, 0],
          } : {}}
          transition={{
            duration: circle.duration,
            repeat: Infinity,
            delay: circle.delay,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* موجات سفلية ناعمة */}
      <div className="absolute bottom-0 left-0 w-full h-64 opacity-10">
        <svg viewBox="0 0 1440 320" className="w-full h-full preserve-3d">
          <motion.path
            fill="#FFD700"
            animate={isEnabled ? {
              d: [
                "M0,160L48,176C96,192,192,224,288,224C384,224,480,192,576,165.3C672,139,768,117,864,128C960,139,1056,181,1152,186.7C1248,192,1344,160,1392,144L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
                "M0,64L48,80C96,96,192,128,288,128C384,128,480,96,576,106.7C672,117,768,139,864,149.3C960,160,1056,160,1152,138.7C1248,117,1344,75,1392,53.3L1440,32L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z",
                "M0,160L48,176C96,192,192,224,288,224C384,224,480,192,576,165.3C672,139,768,117,864,128C960,139,1056,181,1152,186.7C1248,192,1344,160,1392,144L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"
              ]
            } : {}}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
        </svg>
      </div>
    </div>
  );
};

export default TokenomicsBackground;