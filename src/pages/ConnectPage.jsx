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
  Twitter, Mail
} from 'lucide-react';

// --- CONFIGURATION ---
const WALLETCONNECT_PROJECT_ID = '90be08cc5b7174d4051d2de451af0d9b'; 
// ---------------------

// Lazy load complex decorative components if needed
// For now, let's keep it simple but show the pattern
const BackgroundDecor = () => (
  <div className="absolute inset-0 pointer-events-none overflow-hidden">
    <div className="absolute -top-[10%] -right-[10%] w-[50%] h-[50%] bg-pepe-yellow/20 blur-[120px] rounded-full" />
    <div className="absolute -bottom-[10%] -left-[10%] w-[50%] h-[50%] bg-pepe-pink/10 blur-[120px] rounded-full" />
  </div>
);

const ConnectPage = () => {
  const { t, i18n } = useTranslation();
  const { connect, provider: authProvider, loginWithSocial } = useWallet();
  const { select, wallets: solanaWallets } = useSolanaWallet();
  const navigate = useNavigate();
  const isRTL = i18n.language === 'ar';
  const [status, setStatus] = useState('idle'); // idle, connecting
  const [error, setError] = useState(null);

  // Memoized Wallet List
  const walletOptions = useMemo(() => [
    { id: 'Phantom', name: 'Phantom', icon: '/assets/hero-character.png', color: 'bg-[#AB9FF2]/10', borderColor: 'border-[#AB9FF2]', recommended: true },
    { id: 'MetaMask', name: 'MetaMask', icon: 'https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Logo.svg', color: 'bg-[#E2761B]/10', borderColor: 'border-[#E2761B]' },
    { id: 'OKX', name: 'OKX Wallet', icon: 'https://static.okx.com/cdn/assets/imgs/247/1C0D98E9A3C7E3B2.png', color: 'bg-black/10', borderColor: 'border-black' },
    { id: 'Binance', name: 'Binance Wallet', icon: 'https://upload.wikimedia.org/wikipedia/commons/5/57/Binance_Logo.svg', color: 'bg-[#F3BA2F]/10', borderColor: 'border-[#F3BA2F]' },
    { id: 'Trust Wallet', name: 'Trust Wallet', icon: 'https://trustwallet.com/assets/images/media/assets/trust_platform.svg', color: 'bg-[#3375BB]/10', borderColor: 'border-[#3375BB]' },
    { id: 'WalletConnect', name: 'WalletConnect', isWC: true, color: 'bg-[#3396FF]/10', borderColor: 'border-[#3396FF]' },
  ], []);

  const socialOptions = useMemo(() => [
    { id: 'google', name: 'Google', icon: <Mail className="text-red-500" />, color: 'bg-red-50', borderColor: 'border-red-200' },
    { id: 'twitter', name: 'X (Twitter)', icon: <Twitter className="text-black" />, color: 'bg-gray-50', borderColor: 'border-black' },
  ], []);

  // Connection Handlers
  const handleOKXConnect = useCallback(async () => {
    setStatus('connecting');
    setError(null);
    const provider = window.okxwallet;
    if (!provider) {
      setStatus('idle');
      setError(i18n.language === 'ar' ? 'محفظة OKX غير مثبتة.' : 'OKX Wallet is not installed.');
      window.open('https://www.okx.com/web3', '_blank');
      return;
    }
    try {
      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      if (Array.isArray(accounts) && accounts.length > 0) {
        connect(accounts[0], 'OKX');
        navigate('/loading');
      } else {
        throw new Error('No accounts returned from OKX');
      }
    } catch (err) {
      console.error('OKX connection error:', err);
      setStatus('idle');
      setError(i18n.language === 'ar' ? 'فشل الاتصال بمحفظة OKX.' : 'Failed to connect to OKX Wallet.');
    }
  }, [connect, navigate, i18n.language]);

  const handleBinanceConnect = useCallback(async () => {
    setStatus('connecting');
    setError(null);
    const provider = window.BinanceChain || (window.ethereum?.isBinance && window.ethereum);
    if (!provider) {
      setStatus('idle');
      setError(i18n.language === 'ar' ? 'محفظة Binance غير مثبتة.' : 'Binance Wallet is not installed.');
      window.open('https://www.bnbchain.org/en/wallet', '_blank');
      return;
    }
    try {
      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      if (Array.isArray(accounts) && accounts.length > 0) {
        connect(accounts[0], 'Binance');
        navigate('/loading');
      } else {
        throw new Error('No accounts returned from Binance Wallet');
      }
    } catch (err) {
      console.error('Binance connection error:', err);
      setStatus('idle');
      setError(i18n.language === 'ar' ? 'فشل الاتصال بمحفظة Binance.' : 'Failed to connect to Binance Wallet.');
    }
  }, [connect, navigate, i18n.language]);

  const handleSocialConnect = useCallback(async (provider) => {
    setStatus('connecting');
    setError(null);
    try {
      const addr = await loginWithSocial(provider);
      if (addr) navigate('/loading');
      else setStatus('idle');
    } catch (err) {
      console.error(`Social login (${provider}) error:`, err);
      setStatus('idle');
      setError(i18n.language === 'ar' ? 'فشل تسجيل الدخول الاجتماعي.' : 'Social login failed.');
    }
  }, [loginWithSocial, navigate, i18n.language]);

  const handleWalletConnect = useCallback(async () => {
    setStatus('connecting');
    setError(null);
    try {
      const { EthereumProvider } = await import('@walletconnect/ethereum-provider');
      const provider = await EthereumProvider.init({
        projectId: WALLETCONNECT_PROJECT_ID,
        showQrModal: true,
        chains: [1],
        methods: ["eth_sendTransaction", "personal_sign"],
        events: ["chainChanged", "accountsChanged"],
      });
      await provider.connect();
      if (provider.accounts?.length > 0) {
        connect(provider.accounts[0], 'WalletConnect');
        navigate('/loading');
      }
    } catch (err) {
      console.error('WalletConnect error:', err);
      setStatus('idle');
      setError(i18n.language === 'ar' ? 'فشل الاتصال عبر WalletConnect.' : 'WalletConnect connection failed.');
    }
  }, [connect, navigate, i18n.language]);

  const handleTrustWalletConnect = useCallback(async () => {
    setStatus('connecting');
    setError(null);
    const provider = window.trustwallet || window.ethereum;
    if (!provider || (!provider.isTrust && !window.trustwallet)) {
      setStatus('idle');
      setError(i18n.language === 'ar' ? 'محفظة Trust Wallet غير مثبتة.' : 'Trust Wallet is not installed.');
      window.open('https://trustwallet.com/download', '_blank');
      return;
    }
    try {
      const ethProvider = new ethers.BrowserProvider(provider);
      const accounts = await ethProvider.send("eth_requestAccounts", []);
      if (accounts?.length > 0) {
        connect(accounts[0], 'Trust Wallet');
        navigate('/loading');
      }
    } catch (err) {
      console.error('Trust Wallet error:', err);
      setStatus('idle');
      setError(i18n.language === 'ar' ? 'فشل الاتصال بـ Trust Wallet.' : 'Trust Wallet connection failed.');
    }
  }, [connect, navigate, i18n.language]);

  const handleMetaMaskConnect = useCallback(async () => {
    setStatus('connecting');
    setError(null);
    let provider = window.ethereum;
    if (window.ethereum?.providers) {
      provider = window.ethereum.providers.find((p) => p.isMetaMask);
    }
    if (!provider || !provider.isMetaMask) {
      setStatus('idle');
      setError(i18n.language === 'ar' ? 'محفظة MetaMask غير مثبتة.' : 'MetaMask is not installed.');
      window.open('https://metamask.io/download/', '_blank');
      return;
    }
    try {
      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      if (accounts?.length > 0) {
        connect(accounts[0], 'MetaMask');
        navigate('/loading');
      }
    } catch (err) {
      console.error('MetaMask error:', err);
      setStatus('idle');
      setError(i18n.language === 'ar' ? 'فشل الاتصال بـ MetaMask.' : 'Failed to connect to MetaMask.');
    }
  }, [connect, navigate, i18n.language]);

  const handlePhantomConnect = useCallback(async () => {
    setStatus('connecting');
    setError(null);
    const phantomProvider = window.phantom?.solana || window.solana;
    if (!phantomProvider?.isPhantom) {
      setStatus('idle');
      setError(i18n.language === 'ar' ? 'محفظة Phantom غير مثبتة.' : 'Phantom wallet is not installed.');
      window.open('https://phantom.app/', '_blank');
      return;
    }
    try {
      const response = await phantomProvider.connect();
      if (response?.publicKey) {
        connect(response.publicKey.toString(), 'Phantom');
        navigate('/loading');
      }
    } catch (err) {
      console.error('Phantom error:', err);
      setStatus('idle');
      setError(i18n.language === 'ar' ? 'فشل الاتصال بـ Phantom.' : 'Failed to connect to Phantom.');
    }
  }, [connect, navigate, i18n.language]);

  const handleConnect = useCallback((walletId) => {
    const handlers = {
      'Phantom': handlePhantomConnect,
      'MetaMask': handleMetaMaskConnect,
      'Trust Wallet': handleTrustWalletConnect,
      'Binance': handleBinanceConnect,
      'OKX': handleOKXConnect,
      'WalletConnect': handleWalletConnect,
      'google': () => handleSocialConnect('google'),
      'twitter': () => handleSocialConnect('twitter')
    };
    if (handlers[walletId]) handlers[walletId]();
  }, [handlePhantomConnect, handleMetaMaskConnect, handleTrustWalletConnect, handleBinanceConnect, handleOKXConnect, handleWalletConnect, handleSocialConnect]);

  return (
    <div className={`min-h-screen bg-[#F8FAFC] text-pepe-black font-sans relative overflow-hidden flex flex-col ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Background Decor */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-[10%] -right-[10%] w-[50%] h-[50%] bg-pepe-yellow/20 blur-[120px] rounded-full" />
        <div className="absolute -bottom-[10%] -left-[10%] w-[50%] h-[50%] bg-pepe-pink/10 blur-[120px] rounded-full" />
      </div>

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
          
          {/* Info Side */}
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

          {/* Wallets Side */}
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
                      {wallet.isWC ? <Globe className="text-[#3396FF]" /> : <img src={wallet.icon} alt={wallet.name} className="w-full h-full object-contain" />}
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
                    {social.icon}
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
                <ShieldCheck size={14} className="text-pepe-green" />
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

const ShieldCheck = ({ size, className }) => <Check size={size} className={className} strokeWidth={4} />;

export default ConnectPage;
