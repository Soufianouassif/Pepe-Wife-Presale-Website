import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useWallet } from '../context/WalletContext';
import { Globe, Shield, Rocket, ArrowLeft, Check, Lock, Wallet, AlertCircle, X } from 'lucide-react';

const ConnectPage = () => {
  const { t, i18n } = useTranslation();
  const { connect } = useWallet();
  const navigate = useNavigate();
  const isRTL = i18n.language === 'ar';
  const [status, setStatus] = useState('idle'); // idle, connecting
  const [error, setError] = useState(null);

  const handleConnect = (walletName) => {
    setStatus('connecting');
    setError(null);
    
    // Simulate connection approval
    setTimeout(() => {
      if (Math.random() > 0.1) { // 90% success rate for simulation
        const mockAddress = '0x71C...3921';
        connect(mockAddress, walletName);
        navigate('/loading');
      } else {
        setStatus('idle');
        setError('Connection rejected by user');
      }
    }, 2000);
  };

  const wallets = [
    { name: 'Phantom', icon: '/assets/hero-character.png', color: 'bg-[#AB9FF2]/10', borderColor: 'border-[#AB9FF2]', recommended: true },
    { name: 'MetaMask', icon: 'https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Logo.svg', color: 'bg-[#E2761B]/10', borderColor: 'border-[#E2761B]' },
    { name: 'Trust Wallet', icon: 'https://trustwallet.com/assets/images/media/assets/trust_platform.svg', color: 'bg-[#3375BB]/10', borderColor: 'border-[#3375BB]' },
    { name: 'WalletConnect', icon: null, isWC: true, color: 'bg-[#3396FF]/10', borderColor: 'border-[#3396FF]' },
  ];

  return (
    <div className={`min-h-screen bg-white text-pepe-black font-sans relative overflow-hidden flex flex-col ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Dynamic Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full z-0 overflow-hidden pointer-events-none">
        <motion.div 
          animate={{ 
            scale: [1, 1.2, 1],
            rotate: [0, 90, 0],
            opacity: [0.1, 0.2, 0.1] 
          }}
          transition={{ duration: 20, repeat: Infinity }}
          className="absolute top-[-20%] right-[-10%] w-[80%] h-[80%] bg-pepe-yellow rounded-full blur-[150px]" 
        />
        <motion.div 
          animate={{ 
            scale: [1, 1.3, 1],
            rotate: [0, -90, 0],
            opacity: [0.1, 0.15, 0.1] 
          }}
          transition={{ duration: 25, repeat: Infinity }}
          className="absolute bottom-[-20%] left-[-10%] w-[80%] h-[80%] bg-pepe-pink rounded-full blur-[150px]" 
        />
      </div>

      {/* Header */}
      <header className="relative z-10 p-6 sm:p-10 flex items-center justify-between max-w-7xl mx-auto w-full">
        <button 
          onClick={() => navigate('/')}
          className="group flex items-center space-x-3 space-x-reverse bg-white border-4 border-pepe-black px-6 py-3 rounded-2xl shadow-[6px_6px_0_0_#000] hover:-translate-y-1 transition-all"
        >
          <ArrowLeft size={24} strokeWidth={3} className="group-hover:-translate-x-1 rtl:rotate-180 rtl:group-hover:translate-x-1 transition-transform" />
          <span className="font-black uppercase tracking-tight">{t('nav.home')}</span>
        </button>
        
        <div className="flex items-center space-x-3 space-x-reverse cursor-pointer group" onClick={() => navigate('/')}>
          <div className="flex items-center space-x-2 space-x-reverse group-hover:scale-105 transition-transform">
            <img src="/assets/hero-character.png" alt="Logo" className="w-12 h-12 object-contain" />
            <div className="flex flex-col">
              <span className="text-xl font-black uppercase leading-none bg-gradient-to-r from-pepe-green to-gray-400 bg-clip-text text-transparent animate-gradient-text">
                Pepe Wife
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest bg-gradient-to-r from-pepe-green to-gray-400 bg-clip-text text-transparent animate-gradient-text">
                $PWIFE
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-4xl grid lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Side: Info */}
          <div className="space-y-8 text-center lg:text-left rtl:lg:text-right hidden lg:block">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <span className="bg-pepe-green text-pepe-black px-6 py-2 rounded-full border-4 border-pepe-black font-black uppercase text-sm shadow-[4px_4px_0_0_#000] inline-block rotate-[-2deg]">
                Secure Connection
              </span>
              <h2 className="text-6xl font-black uppercase italic leading-none animate-title-gradient">
                Connect Your<br />Digital Wallet
              </h2>
              <p className="text-xl font-bold text-gray-600 leading-relaxed max-w-md">
                Connect your wallet to access the dashboard, view your balance, and join the $PWIFE community.
              </p>
            </motion.div>

            <div className="grid gap-4">
              {[
                { icon: <Shield className="text-pepe-green" />, text: 'Safe & Secure' },
                { icon: <Lock className="text-pepe-pink" />, text: 'Encrypted Data' },
                { icon: <Check className="text-pepe-yellow" />, text: 'Direct Access' }
              ].map((item, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i }}
                  className="flex items-center space-x-4 space-x-reverse bg-white/50 backdrop-blur-sm p-4 rounded-2xl border-2 border-pepe-black/5"
                >
                  {item.icon}
                  <span className="font-black uppercase italic">{item.text}</span>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Right Side: Wallet Options */}
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white border-8 border-pepe-black rounded-[3rem] p-8 sm:p-12 shadow-[20px_20px_0_0_#000] space-y-8"
          >
            <div className="text-center space-y-2 lg:hidden">
              <h1 className="text-4xl font-black uppercase italic animate-title-gradient">{t('nav.wallet.connect')}</h1>
              <p className="text-gray-500 font-bold">Choose your preferred wallet</p>
            </div>

            <div className="grid gap-4">
              {wallets.map((wallet, idx) => (
                <button 
                  key={idx}
                  onClick={() => handleConnect(wallet.name)}
                  disabled={status === 'connecting'}
                  className={`
                    group relative flex items-center justify-between p-5 rounded-2xl border-4 border-pepe-black transition-all
                    hover:-translate-y-1 active:scale-[0.98] disabled:opacity-50
                    ${wallet.recommended ? 'bg-pepe-yellow shadow-[6px_6px_0_0_#000] hover:shadow-[10px_10px_0_0_#000]' : 'bg-white hover:bg-gray-50 shadow-[6px_6px_0_0_#000] hover:shadow-[10px_10px_0_0_#000]'}
                  `}
                >
                  <div className="flex items-center space-x-4 space-x-reverse">
                    <div className={`w-14 h-14 rounded-xl border-4 border-pepe-black flex items-center justify-center overflow-hidden bg-white`}>
                      {wallet.isWC ? (
                        <Globe size={32} strokeWidth={3} className="text-[#3396FF]" />
                      ) : (
                        <img src={wallet.icon} alt={wallet.name} className="w-10 h-10 object-contain" />
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-black uppercase block leading-none">{wallet.name}</span>
                      {wallet.recommended && <span className="text-[10px] font-black uppercase tracking-widest text-pepe-black/60">Recommended</span>}
                    </div>
                  </div>
                  
                  {status === 'connecting' ? (
                    <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                      <Rocket size={28} strokeWidth={3} />
                    </motion.div>
                  ) : (
                    <ArrowLeft className="rotate-180 opacity-20 group-hover:opacity-100 transition-opacity" size={28} strokeWidth={3} />
                  )}
                </button>
              ))}
            </div>

            {/* Error Message */}
            <AnimatePresence>
              {error && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="bg-red-50 border-4 border-red-500 p-4 rounded-2xl flex items-center space-x-3 space-x-reverse text-red-500 font-bold"
                >
                  <AlertCircle size={20} />
                  <span>{error}</span>
                  <button onClick={() => setError(null)} className="mr-auto"><X size={20} /></button>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="pt-6 border-t-4 border-pepe-black/5 flex flex-col items-center space-y-4">
              <div className="flex items-center space-x-2 space-x-reverse opacity-60">
                <Check size={18} strokeWidth={3} className="text-pepe-green" />
                <span className="text-xs font-black uppercase tracking-tighter">Verified by Audit</span>
              </div>
              <p className="text-[10px] text-center text-gray-400 font-bold uppercase tracking-widest max-w-[200px]">
                By connecting, you agree to our Terms of Service and Privacy Policy
              </p>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="relative z-10 p-10 text-center text-pepe-black/30 font-black uppercase tracking-[0.3em] text-xs">
        &copy; 2026 PEPE WIFE - ALL RIGHTS RESERVED
      </footer>
    </div>
  );
};

export default ConnectPage;
