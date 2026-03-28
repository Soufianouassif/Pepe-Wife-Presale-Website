import React, { useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useWallet } from '../context/WalletContext';
import { 
  Globe, Shield, Rocket, ArrowLeft, Check, Lock, 
  AlertCircle, X, Zap, Mail
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
  Solflare: () => (
    <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <circle cx="50" cy="50" r="50" fill="#FCE87F"/>
      <path d="M50 15C30.67 15 15 30.67 15 50s15.67 35 35 35 35-15.67 35-35S69.33 15 50 15zm0 62c-14.91 0-27-12.09-27-27s12.09-27 27-27 27 12.09 27 27-12.09 27-27 27z" fill="#1E1E1E"/>
      <path d="M50 28c-12.15 0-22 9.85-22 22s9.85 22 22 22 22-9.85 22-22-9.85-22-22-22zm0 36c-7.73 0-14-6.27-14-14s6.27-14 14-14 14 6.27 14 14-6.27 14-14 14z" fill="#1E1E1E"/>
    </svg>
  ),
  Backpack: () => (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <path d="M18.333 2H5.667C3.642 2 2 3.642 2 5.667v12.667C2 20.358 3.642 22 5.667 22h12.667C20.358 22 22 20.358 22 18.333V5.667C22 3.642 20.358 2 18.333 2zM12 12.833c-2.342 0-4.25-1.908-4.25-4.25S9.658 4.333 12 4.333s4.25 1.908 4.25 4.25-1.908 4.25-4.25 4.25z" fill="#242B48"/>
    </svg>
  ),
  Coinbase: () => (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-12h2v8h-2v-8zm0-4h2v2h-2v-2z" fill="#0052FF"/>
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
  ),
  Facebook: () => (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" fill="#1877F2">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  ),
  Discord: () => (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" fill="#5865F2">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037 19.736 19.736 0 0 0-4.885 1.515.069.069 0 0 0-.032.027C.533 9.048-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.419-2.157 2.419z"/>
    </svg>
  ),
  Apple: () => (
    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="w-full h-full" fill="black">
      <path d="M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.702z"/>
    </svg>
  ),
};

const BackgroundDecor = React.memo(() => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    <div className="absolute -top-[10%] -right-[10%] w-[50%] h-[50%] bg-pepe-yellow/20 blur-[120px] rounded-full" />
    <div className="absolute -bottom-[10%] -left-[10%] w-[50%] h-[50%] bg-pepe-pink/10 blur-[120px] rounded-full" />
  </div>
));

const ConnectPage = () => {
  const { t, i18n } = useTranslation();
  const { loginWithSocial, connectEVMWallet, connectSolanaWallet, connectWalletConnect, isInitializing } = useWallet();
  const navigate = useNavigate();
  const isRTL = i18n.language === 'ar';
  const [status, setStatus] = useState('idle'); 
  const [error, setError] = useState(null);
  const [showEmailOtpDialog, setShowEmailOtpDialog] = useState(false);
  const [emailOtpInput, setEmailOtpInput] = useState('');


  const walletOptions = useMemo(() => [
    { id: 'Phantom', name: 'Phantom', icon: <Icons.Phantom />, color: 'bg-[#AB9FF2]/10', borderColor: 'border-[#AB9FF2]', recommended: true },
    { id: 'MetaMask', name: 'MetaMask', icon: <Icons.MetaMask />, color: 'bg-[#E2761B]/10', borderColor: 'border-[#E2761B]' },
    { id: 'OKX', name: 'OKX Wallet', icon: <img src="https://static.okx.com/cdn/assets/imgs/247/1C0D98E9A3C7E3B2.png" alt="OKX" className="w-full h-full object-contain" />, color: 'bg-black/10', borderColor: 'border-black' },
    { id: 'Binance', name: 'Binance', icon: <Icons.Binance />, color: 'bg-[#F3BA2F]/10', borderColor: 'border-[#F3BA2F]' },
    { id: 'Trust Wallet', name: 'Trust Wallet', icon: <img src="https://trustwallet.com/assets/images/media/assets/TWT.png" alt="Trust" className="w-full h-full object-contain" />, color: 'bg-[#3375BB]/10', borderColor: 'border-[#3375BB]' },
    { id: 'WalletConnect', name: 'WalletConnect', isWC: true, color: 'bg-[#3396FF]/10', borderColor: 'border-[#3396FF]' },
  ], []);

  const socialOptions = useMemo(() => [
    { id: 'google', name: 'Google', icon: <Icons.Google />, color: 'bg-white', borderColor: 'border-gray-200' },
    { id: 'twitter', name: 'X (Twitter)', icon: <Icons.X />, color: 'bg-black', borderColor: 'border-black' },
    { id: 'telegram', name: 'Telegram', icon: <Globe className="text-[#229ED9]" />, color: 'bg-[#229ED9]/10', borderColor: 'border-[#229ED9]' },
    { id: 'email_passwordless', name: 'Email OTP', icon: <Mail className="text-pepe-pink" />, color: 'bg-pepe-pink/5', borderColor: 'border-pepe-pink' },
  ], []);

  const handleWalletConnect = useCallback(async (walletId) => {
    setStatus('connecting');
    setError(null);
    try {
      console.log(`ConnectPage: Connecting to ${walletId}...`);
      
      if (['Phantom', 'Solflare', 'Backpack', 'OKX', 'Trust Wallet'].includes(walletId)) {
        const addr = await connectSolanaWallet(walletId);
        if (addr && typeof addr === 'string') {
          navigate('/loading', { replace: true, state: { fromConnect: true, walletId } });
        }
      } 
      // --- EVM WALLETS ---
      else if (['MetaMask', 'Binance', 'Coinbase'].includes(walletId)) {
        const addr = await connectEVMWallet(walletId);
        if (addr && typeof addr === 'string' && addr !== '') {
          navigate('/loading', { replace: true, state: { fromConnect: true, walletId } });
        }
      } 
      // --- WALLETCONNECT ---
      else if (walletId === 'WalletConnect') {
        const addr = await connectWalletConnect();
        if (addr && typeof addr === 'string' && addr !== '') {
          navigate('/loading', { replace: true, state: { fromConnect: true, walletId } });
        }
      }
    } catch (err) {
      console.error(`ConnectPage: ${walletId} error:`, err);
      setStatus('idle');
      
      const errMsg = err?.userMessage || err?.message || 'Connection failed';
      if (walletId === 'Binance' && (errMsg.includes('not found') || errMsg.includes('provider'))) {
        setError(i18n.language === 'ar' ? 'يرجى تثبيت إضافة بايننس أو استخدام QR Code.' : 'Please install Binance extension or use QR Code.');
      } else {
        setError(errMsg);
      }
    }
  }, [connectEVMWallet, connectSolanaWallet, connectWalletConnect, navigate, i18n.language]);

  const handleSocialConnect = useCallback(async (loginProvider, extraOptions = {}) => {
    if (isInitializing) {
      console.warn("ConnectPage: System still initializing...");
      return;
    }

    setStatus('connecting');
    setError(null);
    try {
      console.log(`ConnectPage: Initiating ${loginProvider} login...`, extraOptions);
      const addr = await loginWithSocial(loginProvider, extraOptions);

      console.log(`ConnectPage: loginWithSocial returned: '${addr}'`);

      if (addr) {
        console.log("ConnectPage: Login successful, navigating to dashboard...");
        navigate('/loading', { replace: true, state: { fromConnect: true, walletId: loginProvider } });
      } else {
        console.warn("ConnectPage: loginWithSocial returned a null or empty value. This might be due to user cancellation. Not navigating.");
        setStatus('idle');
      }
    } catch (err) {
      console.error(`ConnectPage: Social login error (${loginProvider}):`, err);
      setStatus('idle');
      
      // Detailed error messages based on common Web3Auth issues
      let friendlyMsg = err.message || `${loginProvider} login failed.`;
      if (friendlyMsg.includes('clientId')) friendlyMsg = "Web3Auth Client ID is invalid or for wrong network.";
      if (friendlyMsg.includes('whitelist')) friendlyMsg = "This domain is not whitelisted in Web3Auth Dashboard.";
      if (friendlyMsg.includes('origin')) friendlyMsg = "Domain mismatch. Check Web3Auth Dashboard settings.";
      if (friendlyMsg.toLowerCase().includes('timeout')) friendlyMsg = "Login timed out. Verify Web3Auth Allowed Origins and social Connection IDs in dashboard.";
      if (friendlyMsg.toLowerCase().includes('connection id')) friendlyMsg = "Missing social Connection ID in Web3Auth dashboard/env settings.";
      if (friendlyMsg.toLowerCase().includes('invalid auth connection')) friendlyMsg = "Invalid social connection config. Verify provider type and Connection ID for Google/X/Telegram/Email in Web3Auth dashboard.";
      if (friendlyMsg.includes('Duplicate')) friendlyMsg = "An account already exists with this method.";
      
      setError(friendlyMsg);
    }
  }, [loginWithSocial, navigate, isInitializing]);

  const handleEmailOtpStart = useCallback(() => {
    const normalized = emailOtpInput.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalized)) {
      setError(i18n.language === 'ar' ? 'أدخل بريدًا إلكترونيًا صالحًا قبل المتابعة.' : 'Enter a valid email address before continue.');
      return;
    }
    setShowEmailOtpDialog(false);
    setError(null);
    handleSocialConnect('email_passwordless', { login_hint: normalized });
  }, [emailOtpInput, handleSocialConnect, i18n.language]);

  const handleConnect = useCallback((walletId) => {
    const socialProviders = ['google', 'twitter', 'telegram', 'email_passwordless'];
    if (socialProviders.includes(walletId)) {
      if (walletId === 'email_passwordless') {
        setShowEmailOtpDialog(true);
        setError(null);
      } else {
        handleSocialConnect(walletId);
      }
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

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="lg:col-span-3 bg-white border-4 border-pepe-black rounded-[2.5rem] shadow-[12px_12px_0_0_#000] p-6 sm:p-10 space-y-8 relative">

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
              <h2 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 border-b-2 border-gray-100 pb-2">Social & Direct Login</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {socialOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleConnect(option.id)}
                    disabled={status === 'connecting' || isInitializing}
                    className={`
                      relative group flex flex-col items-center gap-3 p-4 rounded-2xl border-2 
                      transition-all duration-300 active:scale-95
                      ${option.borderColor} ${option.color}
                      ${status === 'connecting' || isInitializing ? 'opacity-50 cursor-not-allowed' : 'hover:shadow-[6px_6px_0_0_#000] hover:-translate-y-1'}
                    `}
                  >
                    <div className="w-8 h-8 flex items-center justify-center">
                      {isInitializing ? (
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        >
                          <Zap size={16} className="text-gray-400" />
                        </motion.div>
                      ) : option.icon}
                    </div>
                    <span className="text-[8px] font-black uppercase tracking-widest text-center text-pepe-black">
                      {isInitializing ? (i18n.language === 'ar' ? 'تحميل...' : 'Loading...') : option.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <AnimatePresence>
              {showEmailOtpDialog && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.98 }}
                  className="bg-pepe-pink/5 border-2 border-pepe-pink p-4 sm:p-5 rounded-2xl space-y-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="font-black text-xs sm:text-sm uppercase tracking-wide text-pepe-black">
                      {i18n.language === 'ar' ? 'أدخل بريدك لاستلام رمز OTP' : 'Enter your email to receive OTP'}
                    </p>
                    <button
                      onClick={() => setShowEmailOtpDialog(false)}
                      className="p-1 rounded-lg hover:bg-pepe-pink/10"
                      disabled={status === 'connecting'}
                    >
                      <X size={16} />
                    </button>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <input
                      type="email"
                      value={emailOtpInput}
                      onChange={(e) => setEmailOtpInput(e.target.value)}
                      placeholder="name@email.com"
                      className="flex-1 px-4 py-3 rounded-xl border-2 border-pepe-black bg-white font-bold outline-none focus:ring-2 focus:ring-pepe-pink/40"
                      disabled={status === 'connecting'}
                    />
                    <button
                      onClick={handleEmailOtpStart}
                      disabled={status === 'connecting'}
                      className="px-5 py-3 rounded-xl border-2 border-pepe-black bg-pepe-yellow font-black uppercase text-xs hover:translate-y-[-1px] transition-transform disabled:opacity-60"
                    >
                      {i18n.language === 'ar' ? 'إرسال OTP' : 'Send OTP'}
                    </button>
                  </div>
                </motion.div>
              )}
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
