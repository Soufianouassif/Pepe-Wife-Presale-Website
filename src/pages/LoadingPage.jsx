import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Rocket, ShieldCheck, CheckCircle2, Globe, Lock, Loader2 } from 'lucide-react';

const LoadingPage = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isRTL = i18n.language === 'ar';
  const [step, setStep] = useState(0);

  const steps = [
    { icon: <Globe className="text-blue-400" />, text: 'Initializing secure connection...' },
    { icon: <Lock className="text-pepe-pink" />, text: 'Encrypting wallet data...' },
    { icon: <ShieldCheck className="text-pepe-green" />, text: 'Verifying permissions...' },
    { icon: <CheckCircle2 className="text-pepe-yellow" />, text: 'Connection successful!' }
  ];

  useEffect(() => {
    // Advanced redirect logic with step progression
    const stepInterval = setInterval(() => {
      setStep(prev => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 1000);

    const redirectTimer = setTimeout(() => {
      navigate('/dashboard');
    }, 4500);

    return () => {
      clearInterval(stepInterval);
      clearTimeout(redirectTimer);
    };
  }, [navigate]);

  return (
    <div className={`min-h-screen bg-white text-pepe-black flex flex-col items-center justify-center p-6 relative overflow-hidden ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Brand-consistent Dynamic Background */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 180, 270, 360],
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-20%] right-[-10%] w-[100%] h-[100%] opacity-10"
        >
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-pepe-yellow rounded-full blur-[200px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-pepe-pink rounded-full blur-[200px]" />
        </motion.div>
      </div>

      <div className="relative z-10 w-full max-w-lg space-y-12">
        {/* Main Character Animation */}
        <div className="relative flex justify-center">
          <motion.div
            animate={{ 
              y: [0, -20, 0],
              rotate: [0, 5, -5, 0]
            }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-48 h-48 bg-white rounded-[3rem] border-8 border-pepe-black flex items-center justify-center shadow-[15px_15px_0_0_#000]"
          >
            <img src="/assets/hero-character.png" alt="Pepe" className="w-32 h-32 object-contain" />
          </motion.div>
          
          <motion.div 
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: 0.5, type: 'spring' }}
            className="absolute -bottom-4 -right-4 bg-pepe-green p-4 rounded-2xl border-4 border-pepe-black shadow-[6px_6px_0_0_#000]"
          >
            <ShieldCheck size={40} strokeWidth={3} className="text-white" />
          </motion.div>
        </div>

        {/* Status Section */}
        <div className="bg-white border-8 border-pepe-black rounded-[3rem] p-10 shadow-[15px_15px_0_0_#000] space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-4xl font-black uppercase italic animate-title-gradient">
              {t('nav.wallet.connecting')}
            </h2>
            <p className="text-gray-400 font-black uppercase tracking-widest text-xs">Please do not close this window</p>
          </div>

          {/* Progress Bar */}
          <div className="relative bg-gray-100 border-4 border-pepe-black rounded-full h-10 overflow-hidden p-1 shadow-[inset_4px_4px_0_0_rgba(0,0,0,0.1)]">
            <motion.div 
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{ duration: 4, ease: "easeInOut" }}
              className="h-full bg-pepe-yellow rounded-full border-2 border-pepe-black shadow-[2px_2px_0_0_#000]"
            />
          </div>

          {/* Step Progression */}
          <div className="space-y-4 pt-4 border-t-4 border-pepe-black/5">
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isRTL ? -20 : 20 }}
                className="flex items-center space-x-4 space-x-reverse"
              >
                <div className="w-10 h-10 bg-pepe-black text-white rounded-xl border-4 border-pepe-black flex items-center justify-center shadow-[4px_4px_0_0_#000]">
                  {steps[step].icon}
                </div>
                <span className="text-lg font-black uppercase italic text-pepe-black">
                  {steps[step].text}
                </span>
                <Loader2 className="animate-spin text-pepe-pink ml-auto rtl:ml-0 rtl:mr-auto" size={24} strokeWidth={3} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Motivational Footer */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.5 }}
          className="flex items-center justify-center space-x-3 space-x-reverse text-pepe-pink font-black uppercase italic tracking-tighter"
        >
          <Rocket size={32} strokeWidth={3} className="animate-bounce" />
          <span className="text-xl">Almost there, get ready for $PWIFE!</span>
        </motion.div>
      </div>

      {/* Footer Decoration */}
      <div className="fixed bottom-10 left-0 w-full flex justify-center opacity-20 pointer-events-none">
        <div className="flex space-x-10 space-x-reverse">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="text-6xl font-black uppercase italic">$PWIFE</div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LoadingPage;
