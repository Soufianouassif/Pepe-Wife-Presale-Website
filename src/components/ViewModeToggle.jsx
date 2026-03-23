import React, { useState, useEffect } from 'react';
import { Monitor, Smartphone } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

const ViewModeToggle = () => {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState(localStorage.getItem('viewMode') || 'mobile');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Show only on real mobile devices (simple check)
    const checkMobile = () => {
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      // Also show if the screen width is small (responsive check)
      const isSmallScreen = window.innerWidth < 1024;
      setIsVisible(isMobile || isSmallScreen);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    const handleViewChange = () => {
      setViewMode(localStorage.getItem('viewMode') || 'mobile');
    };
    window.addEventListener('viewModeChanged', handleViewChange);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('viewModeChanged', handleViewChange);
    };
  }, []);

  const toggleViewMode = () => {
    const newMode = viewMode === 'mobile' ? 'desktop' : 'mobile';
    localStorage.setItem('viewMode', newMode);
    window.dispatchEvent(new Event('viewModeChanged'));
    
    // Smooth scroll to top on switch for better experience
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[9999]">
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={toggleViewMode}
        className="flex items-center space-x-2 space-x-reverse bg-pepe-black text-white px-5 py-3 rounded-full border-4 border-pepe-yellow shadow-[6px_6px_0_0_rgba(250,204,21,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
      >
        {viewMode === 'mobile' ? (
          <>
            <Monitor size={20} className="text-pepe-yellow" strokeWidth={3} />
            <span className="font-black uppercase italic text-xs tracking-wider">
              {t('view_mode.switch_to_desktop')}
            </span>
          </>
        ) : (
          <>
            <Smartphone size={20} className="text-pepe-yellow" strokeWidth={3} />
            <span className="font-black uppercase italic text-xs tracking-wider">
              {t('view_mode.switch_to_mobile')}
            </span>
          </>
        )}
      </motion.button>
    </div>
  );
};

export default ViewModeToggle;
