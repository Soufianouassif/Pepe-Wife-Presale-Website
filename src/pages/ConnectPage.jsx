import React, { useState, useEffect, useCallback, useMemo, Suspense, lazy } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useWallet } from '../context/WalletContext';
import { useWallet as useSolanaWallet } from '@solana/wallet-adapter-react';
import { ethers } from 'ethers';
import { 
  Globe, Shield, Rocket, ArrowLeft, Check, Lock, 
  Wallet, AlertCircle, X, ExternalLink, HelpCircle,
  Mail
} from 'lucide-react';

// --- INTEGRATED HIGH-QUALITY SVG ICONS ---
const Icons = {
  MetaMask: () => (
    <svg viewBox="0 0 320 320" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <path d="M309.1 29.1l-133.4 103 21.1-71.1L309.1 29.1z" fill="#E17726"/><path d="M10.9 29.1l133.4 103-21.1-71.1L10.9 29.1z" fill="#E2761B"/><path d="M264.4 243.1l-28.1 47.8 10.1-58.4-38.1-29.1 21.1 21.1-21.1-21.1z" fill="#E2761B"/><path d="M55.6 243.1l28.1 47.8-10.1-58.4 38.1-29.1-21.1 21.1 21.1-21.1z" fill="#E2761B"/><path d="M251.4 121.1l-10.1 58.4 38.1 29.1-28.1-47.8z" fill="#E2761B"/><path d="M68.6 121.1l10.1 58.4-38.1 29.1 28.1-47.8z" fill="#E2761B"/><path d="M160 132.1l-21.1-71.1 21.1 10.1 21.1-10.1z" fill="#E2761B"/><path d="M160 132.1l21.1-10.1 10.1 58.4-31.2 21.1 31.2-21.1z" fill="#E2761B"/><path d="M160 132.1l-21.1-10.1-10.1 58.4 31.2 21.1-31.2-21.1z" fill="#E2761B"/><path d="M211.4 180.1l-10.1 58.4 38.1 29.1-28.1-47.8z" fill="#E2761B"/><path d="M108.6 180.1l10.1 58.4-38.1 29.1 28.1-47.8z" fill="#E2761B"/><path d="M160 201.1l31.2-21.1 10.1 58.4-41.3 21.1 41.3-21.1z" fill="#E2761B"/><path d="M160 201.1l-31.2-21.1-10.1 58.4 41.3 21.1-41.3-21.1z" fill="#E2761B"/><path d="M160 238.1l41.3-21.1 10.1 58.4-51.4 15.6 51.4-15.6z" fill="#E2761B"/><path d="M160 238.1l-41.3-21.1-10.1 58.4 51.4 15.6-51.4-15.6z" fill="#E2761B"/><path d="M160 291.1l51.4-15.6 10.1-21.1-61.5 36.7 61.5-36.7z" fill="#E2761B"/><path d="M160 291.1l-51.4-15.6-10.1-21.1 61.5 36.7-61.5-36.7z" fill="#E2761B"/>
    </svg>
  ),
  Binance: () => (
    <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <path d="M16 0L10.2 5.8L16 11.6L21.8 5.8L16 0Z" fill="#F3BA2F"/><path d="M5.8 10.2L0 16L5.8 21.8L11.6 16L5.8 10.2Z" fill="#F3BA2F"/><path d="M16 20.4L10.2 26.2L16 32L21.8 26.2L16 20.4Z" fill="#F3BA2F"/><path d="M26.2 10.2L20.4 16L26.2 21.8L32 16L26.2 10.2Z" fill="#F3BA2F"/><path d="M16 13.1L13.1 16L16 18.9L18.9 16L16 13.1Z" fill="#F3BA2F"/>
    </svg>
  ),
  Phantom: () => (
    <svg viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <path d="M64 0C28.656 0 0 28.656 0 64s28.656 64 64 64 64-28.656 64-64S99.344 0 64 0zm0 112c-26.51 0-48-21.49-48-48S37.49 16 64 16s48 21.49 48 48-21.49 48-48 48z" fill="#AB9FF2"/><path d="M84 44c-11.046 0-20 8.954-20 20s8.954 20 20 20 20-8.954 20-20-8.954-20-20-20zm0 28c-4.418 0-8-3.582-8-8s3.582-8 8-8 8 3.582 8 8-3.582 8-8 8zM44 44c-11.046 0-20 8.954-20 20s8.954 20 20 20 20-8.954 20-20-8.954-20-20-20zm0 28c-4.418 0-8-3.582-8-8s3.582-8 8-8 8 3.582 8 8-3.582 8-8 8z" fill="#AB9FF2"/>
    </svg>
  ),
  X: () => (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932 6.064-6.932zm-1.292 19.49h2.039L6.486 3.24H4.298l13.311 17.403z" fill="currentColor"/>
    </svg>
  ),
  Google: () => (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c1.08-1.01 1.71-2.5 1.71-4.26z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 12-4.53z" fill="#EA4335"/>
    </svg>
  )
};

// --- CONFIGURATION ---
const WALLETCONNECT_PROJECT_ID = '90be08cc5b7174d4051d2de451af0d9b'; 
// ---------------------

const BackgroundDecor = React.memo(() => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    <div className="absolute -top-[10%] -right-[10%] w-[50%] h-[50%] bg-pepe-yellow/20 blur-[120px] rounded-full" />
    <div className="absolute -bottom-[10%] -left-[10%] w-[50%] h-[50%] bg-pepe-pink/10 blur-[120px] rounded-full" />
  </div>
));

const ConnectPage = () => {
  const { t, i18n } = useTranslation();
  const { connect, loginWithSocial, connectEVMWallet, connectWalletConnect } = useWallet();
  const navigate = useNavigate();
  const isRTL = i18n.language === 'ar';
  const [status, setStatus] = useState('idle'); 
  const [error, setError] = useState(null);

  const walletOptions = useMemo(() => [
    { id: 'Phantom', name: 'Phantom', icon: <Icons.Phantom />, color: 'bg-[#AB9FF2]/10', borderColor: 'border-[#AB9FF2]', recommended: true },
    { id: 'MetaMask', name: 'MetaMask', icon: <Icons.MetaMask />, color: 'bg-[#E2761B]/10', borderColor: 'border-[#E2761B]' },
    { id: 'OKX', name: 'OKX Wallet', icon: <img src="https://static.okx.com/cdn/assets/imgs/247/1C0D98E9A3C7E3B2.png" className="w-full h-full" />, color: 'bg-black/10', borderColor: 'border-black' },
    { id: 'Binance', name: 'Binance (QR Connect)', icon: <Icons.Binance />, color: 'bg-[#F3BA2F]/10', borderColor: 'border-[#F3BA2F]' },
    { id: 'Trust Wallet', name: 'Trust Wallet', icon: <img src="https://trustwallet.com/assets/images/media/assets/trust_platform.svg" className="w-full h-full" />, color: 'bg-[#3375BB]/10', borderColor: 'border-[#3375BB]' },
    { id: 'WalletConnect', name: 'WalletConnect', isWC: true, color: 'bg-[#3396FF]/10', borderColor: 'border-[#3396FF]' },
  ], []);

  const socialOptions = useMemo(() => [
    { id: 'google', name: 'Google', icon: <Icons.Google />, color: 'bg-white', borderColor: 'border-gray-200' },
    { id: 'twitter', name: 'X (Twitter)', icon: <Icons.X />, color: 'bg-black', borderColor: 'border-black' },
  ], []);

  const handleWalletConnect = useCallback(async (walletId) => {
    setStatus('connecting');
    setError(null);
    try {
      console.log(`ConnectPage: Connecting to ${walletId}...`);
      if (walletId === 'Phantom') {
        const phantomProvider = window.phantom?.solana || window.solana;
        if (!phantomProvider?.isPhantom) {
          window.open('https://phantom.app/', '_blank');
          throw new Error(i18n.language === 'ar' ? 'محفظة Phantom غير مثبتة.' : 'Phantom wallet is not installed.');
        }
        const response = await phantomProvider.connect();
        if (response?.publicKey) {
          connect(response.publicKey.toString(), 'Phantom');
          navigate('/loading');
        }
      } else if (['MetaMask', 'Binance', 'OKX', 'Trust Wallet'].includes(walletId)) {
        const id = walletId === 'Trust Wallet' ? 'Trust' : walletId;
        const addr = await connectEVMWallet(id);
        if (addr) navigate('/loading');
      } else if (walletId === 'WalletConnect') {
        const addr = await connectWalletConnect();
        if (addr) navigate('/loading');
      }
    } catch (err) {
      console.error(`ConnectPage: ${walletId} error:`, err);
      setStatus('idle');
      // Special message for Binance QR if no extension
      if (walletId === 'Binance' && err.message.includes('not found')) {
        setError(i18n.language === 'ar' ? 'يتم الآن فتح QR Code للربط بتطبيق Binance...' : 'Opening QR Code to connect with Binance App...');
      } else {
        setError(err.message || 'Connection failed');
      }
    }
  }, [connect, connectEVMWallet, connectWalletConnect, navigate, i18n.language]);

  const handleSocialConnect = useCallback(async (loginProvider) => {
    setStatus('connecting');
    setError(null);
    try {
      console.log(`ConnectPage: Initiating ${loginProvider} login...`);
      const addr = await loginWithSocial(loginProvider);
      if (addr) {
        navigate('/loading');
      } else {
        setStatus('idle');
      }
    } catch (err) {
      console.error(`ConnectPage: Social login error (${loginProvider}):`, err);
      setStatus('idle');
      setError(err.message || `${loginProvider} login failed.`);
    }
  }, [loginWithSocial, navigate, i18n.language]);

  const handleConnect = useCallback((walletId) => {
    if (walletId === 'google' || walletId === 'twitter') {
      handleSocialConnect(walletId);
    } else {
      handleWalletConnect(walletId);
    }
  }, [handleWalletConnect, handleSocialConnect]);

  return (
    <div className={`min-h-screen bg-[#F8FAFC] text-pepe-black font-sans relative overflow-hidden flex flex-col ${isRTL ? 'rtl' : 'ltr'}`}>
      <BackgroundDecor />

      <header className="relative z-10 p-6 flex items-center justify-between max-w-7xl mx-auto w-full">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 font-black uppercase hover:text-pepe-pink transition-colors">
          <ArrowLeft size={20} className="rtl:rotate-180" /> {t('nav.home')}
        </button>
        <div className="flex items-center gap-2">
          <img src="/assets/hero-character.png" alt="Logo" className="w-10 h-10 object-contain" />
          <span className="text-xl font-black italic">PEPE<span className="text-pepe-pink">WIFE</span></span>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-8">
        <div className="w-full max-w-5xl grid lg:grid-cols-5 gap-8 items-start">
          
          <div className="lg:col-span-2 space-y-8 hidden lg:block py-12">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              <span className="bg-pepe-green/20 text-pepe-green border-2 border-pepe-green/30 px-4 py-1 rounded-full font-black uppercase text-xs tracking-wider">
                Web3 Secure Login
              </span>
              <h1 className="text-5xl font-black uppercase italic leading-[0.9] animate-title-gradient">
                Connect Your <br /> Wallet
              </h1>
              <p className="text-lg font-bold text-gray-500 leading-relaxed">
                Choose from our supported providers to safely access your dashboard and manage your $PWIFE assets.
              </p>
            </motion.div>

            <div className="space-y-4">
              {[
                { icon: <Shield className="text-pepe-green" />, title: 'Security First', desc: 'Industry-standard encryption' },
                { icon: <Globe className="text-pepe-pink" />, title: 'Multi-Chain', desc: 'Support for ETH, SOL & BNB' },
                { icon: <Lock className="text-pepe-yellow" />, title: 'Self-Custody', desc: 'You own your private keys' }
              ].map((item, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 * i }} className="flex items-center gap-4 bg-white border-2 border-pepe-black/5 p-4 rounded-2xl shadow-sm">
                  <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">{item.icon}</div>
                  <div>
                    <p className="font-black uppercase text-xs">{item.title}</p>
                    <p className="text-[10px] font-bold text-gray-400">{item.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-3 bg-white border-4 border-pepe-black rounded-[2.5rem] shadow-[12px_12px_0_0_#000] p-6 sm:p-10 space-y-8">
            <div className="space-y-6">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 border-b-2 border-gray-100 pb-2">Popular Wallets</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {walletOptions.map((wallet) => (
                  <button
                    key={wallet.id}
                    onClick={() => handleConnect(wallet.id)}
                    disabled={status === 'connecting'}
                    className={`
                      group flex items-center gap-4 p-4 rounded-2xl border-4 border-pepe-black transition-all
                      hover:-translate-y-1 active:scale-95 disabled:opacity-50
                      ${wallet.recommended ? 'bg-pepe-yellow shadow-[4px_4px_0_0_#000]' : 'bg-white hover:bg-gray-50 shadow-[4px_4px_0_0_#000]'}
                    `}
                  >
                    <div className="w-12 h-12 bg-white rounded-xl border-2 border-pepe-black/10 flex items-center justify-center p-2 shrink-0">
                      {wallet.isWC ? <Globe className="text-[#3396FF]" /> : wallet.icon}
                    </div>
                    <div className="text-right">
                      <p className="font-black uppercase text-sm leading-none">{wallet.name}</p>
                      {wallet.recommended && <p className="text-[8px] font-black text-pepe-pink uppercase mt-1">Recommended</p>}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 border-b-2 border-gray-100 pb-2">Social Login</h2>
              <div className="grid grid-cols-2 gap-4">
                {socialOptions.map((social) => (
                  <button
                    key={social.id}
                    onClick={() => handleConnect(social.id)}
                    disabled={status === 'connecting'}
                    className="flex items-center justify-center gap-3 p-4 rounded-2xl border-4 border-pepe-black bg-white shadow-[4px_4px_0_0_#000] hover:-translate-y-1 transition-all active:scale-95"
                  >
                    <div className="w-6 h-6">{social.icon}</div>
                    <span className="font-black uppercase text-xs">{social.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <AnimatePresence>
              {error && (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-red-50 border-2 border-red-200 p-4 rounded-2xl flex items-center gap-3 text-red-500 font-bold text-sm">
                  <AlertCircle size={18} />
                  <span className="flex-1">{error}</span>
                  <button onClick={() => setError(null)}><X size={18} /></button>
                </motion.div>
              )}
            </AnimatePresence>

            {status === 'connecting' && (
              <div className="flex flex-col items-center justify-center py-4 space-y-3">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
                  <Rocket size={32} className="text-pepe-pink" />
                </motion.div>
                <p className="font-black uppercase text-[10px] animate-pulse">Establishing Secure Connection...</p>
              </div>
            )}

            <div className="pt-6 border-t-2 border-gray-100 flex flex-col items-center gap-4 text-center opacity-40">
              <div className="flex items-center gap-2">
                <Check size={14} className="text-pepe-green" strokeWidth={4} />
                <span className="text-[10px] font-black uppercase tracking-widest">Verified by Pepe Wife Security Team</span>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      <footer className="p-8 text-center text-[10px] font-black uppercase tracking-[0.4em] opacity-20">
        &copy; 2026 PEPE WIFE - DECENTRALIZED PROTOCOL
      </footer>
    </div>
  );
};

export default ConnectPage;
