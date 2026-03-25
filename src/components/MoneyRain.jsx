import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const MoneyRain = () => {
  // إنشاء قائمة من العملات/الأوراق النقدية بخصائص عشوائية
  const moneyItems = useMemo(() => {
    return Array.from({ length: 40 }).map((_, i) => ({
      id: i,
      x: Math.random() * 100, // موقع أفقي عشوائي بنسبة مئوية
      delay: Math.random() * 5, // تأخير عشوائي للبداية
      duration: 3 + Math.random() * 4, // سرعة سقوط عشوائية
      size: 20 + Math.random() * 30, // حجم عشوائي
      rotation: Math.random() * 360, // زاوية دوران عشوائية
      type: Math.random() > 0.5 ? 'bill' : 'coin' // نوع العملة
    }));
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {moneyItems.map((item) => (
        <motion.div
          key={item.id}
          initial={{ 
            y: -100, 
            x: `${item.x}%`, 
            rotate: item.rotation,
            opacity: 0 
          }}
          animate={{ 
            y: '110vh',
            rotate: item.rotation + 360,
            opacity: [0, 1, 1, 0]
          }}
          transition={{
            duration: item.duration,
            repeat: Infinity,
            delay: item.delay,
            ease: "linear"
          }}
          style={{
            position: 'absolute',
            width: item.size,
            height: item.size,
          }}
        >
          {item.type === 'bill' ? (
            <svg viewBox="0 0 100 50" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="100" height="50" rx="4" fill="#22c55e" stroke="#166534" strokeWidth="2"/>
              <circle cx="50" cy="25" r="15" fill="#166534" opacity="0.2"/>
              <text x="50" y="32" fontSize="20" fontWeight="bold" fill="#166534" textAnchor="middle" opacity="0.5">$</text>
            </svg>
          ) : (
            <svg viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="25" cy="25" r="23" fill="#fbbf24" stroke="#b45309" strokeWidth="2"/>
              <circle cx="25" cy="25" r="15" fill="#f59e0b" stroke="#b45309" strokeWidth="1"/>
              <text x="25" y="32" fontSize="18" fontWeight="bold" fill="#b45309" textAnchor="middle">S</text>
            </svg>
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default MoneyRain;