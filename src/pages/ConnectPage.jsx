import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useWallet } from '../context/WalletContext';
import { useWallet as useSolanaWallet } from '@solana/wallet-adapter-react';
import { ethers } from 'ethers';
import { EthereumProvider } from '@walletconnect/ethereum-provider';
import { Globe, Shield, Rocket, ArrowLeft, Check, Lock, Wallet, AlertCircle, X, ExternalLink, HelpCircle } from 'lucide-react';

// --- CONFIGURATION ---
const WALLETCONNECT_PROJECT_ID = '90be08cc5b7174d4051d2de451af0d9b'; // Updated with the provided ID
// ---------------------

const ConnectPage = () => {
  const { t, i18n } = useTranslation();
  const { connect, provider: authProvider, loginWithSocial } = useWallet();
  const { select, wallets: solanaWallets } = useSolanaWallet();
  const navigate = useNavigate();
  const isRTL = i18n.language === 'ar';
  const [status, setStatus] = useState('idle'); // idle, connecting
  const [error, setError] = useState(null);

  // OKX Wallet Connection Logic
  const handleOKXConnect = async () => {
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
      connect(accounts[0], 'OKX');
      navigate('/loading');
    } catch (err) {
      console.error('OKX connection error:', err);
      setStatus('idle');
      setError(i18n.language === 'ar' ? 'فشل الاتصال بمحفظة OKX.' : 'Failed to connect to OKX Wallet.');
    }
  };

  // Binance Wallet Connection Logic
  const handleBinanceConnect = async () => {
    setStatus('connecting');
    setError(null);

    const provider = window.BinanceChain;
    if (!provider) {
      setStatus('idle');
      setError(i18n.language === 'ar' ? 'محفظة Binance غير مثبتة.' : 'Binance Wallet is not installed.');
      return;
    }

    try {
      const accounts = await provider.request({ method: 'eth_requestAccounts' });
      connect(accounts[0], 'Binance');
      navigate('/loading');
    } catch (err) {
      console.error('Binance connection error:', err);
      setStatus('idle');
      setError(i18n.language === 'ar' ? 'فشل الاتصال بمحفظة Binance.' : 'Failed to connect to Binance Wallet.');
    }
  };

  // Social Login Logic (Web3Auth)
  const handleSocialLogin = async () => {
    setStatus('connecting');
    setError(null);

    try {
      const addr = await loginWithSocial();
      if (addr) {
        navigate('/loading');
      } else {
        setStatus('idle');
      }
    } catch (err) {
      console.error('Social login error:', err);
      setStatus('idle');
      if (err.code === 5000) {
        setError(i18n.language === 'ar' ? 'تم إغلاق نافذة تسجيل الدخول.' : 'Login modal closed.');
      } else {
        setError(i18n.language === 'ar' ? 'فشل تسجيل الدخول الاجتماعي.' : 'Social login failed.');
      }
    }
  };

  // WalletConnect Connection Logic
  const handleWalletConnect = async () => {
    if (WALLETCONNECT_PROJECT_ID === 'YOUR_PROJECT_ID_HERE') {
      setError(i18n.language === 'ar' ? 'يرجى إدخال WalletConnect Project ID في الإعدادات.' : 'Please configure WalletConnect Project ID.');
      return;
    }

    setStatus('connecting');
    setError(null);

    try {
      const provider = await EthereumProvider.init({
        projectId: WALLETCONNECT_PROJECT_ID,
        showQrModal: true,
        chains: [1], // Ethereum Mainnet
        methods: ["eth_sendTransaction", "personal_sign"],
        events: ["chainChanged", "accountsChanged"],
      });

      await provider.connect();
      const accounts = provider.accounts;
      const address = accounts[0];

      if (address) {
        connect(address, 'WalletConnect');
        navigate('/loading');
      }
    } catch (err) {
      console.error('WalletConnect error:', err);
      setStatus('idle');
      setError(i18n.language === 'ar' ? 'فشل الاتصال عبر WalletConnect.' : 'WalletConnect connection failed.');
    }
  };

  // Trust Wallet Connection Logic
  const handleTrustWalletConnect = async () => {
    setStatus('connecting');
    setError(null);

    // Trust Wallet can inject into window.ethereum or window.trustwallet
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
      const address = accounts[0];

      connect(address, 'Trust Wallet');
      navigate('/loading');
    } catch (err) {
      console.error('Trust Wallet error:', err);
      setStatus('idle');
      setError(i18n.language === 'ar' ? 'تم رفض طلب الاتصال من قبل Trust Wallet.' : 'Trust Wallet connection rejected.');
    }
  };

  // MetaMask Connection Logic
  const handleMetaMaskConnect = async () => {
    setStatus('connecting');
    setError(null);

    let provider;
    
    // 1. Detect the correct MetaMask provider
    if (window.ethereum) {
      if (window.ethereum.providers) {
        // If multiple providers (e.g. Phantom + MetaMask), find the MetaMask one
        provider = window.ethereum.providers.find((p) => p.isMetaMask);
      } else if (window.ethereum.isMetaMask) {
        provider = window.ethereum;
      }
    }

    if (!provider) {
      setStatus('idle');
      setError(i18n.language === 'ar' ? 'محفظة MetaMask غير مثبتة.' : 'MetaMask is not installed.');
      window.open('https://metamask.io/download/', '_blank');
      return;
    }

    try {
      // 2. Request accounts using the specific provider
      const browserProvider = new ethers.BrowserProvider(provider);
      const accounts = await browserProvider.send("eth_requestAccounts", []);
      const address = accounts[0];

      // 3. Check Network (Ethereum Mainnet is 1)
      const network = await browserProvider.getNetwork();
      if (network.chainId !== 1n) {
        try {
          await provider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x1' }],
          });
        } catch (switchError) {
          setStatus('idle');
          setError(i18n.language === 'ar' ? 'يرجى التبديل إلى شبكة Ethereum Mainnet.' : 'Please switch to Ethereum Mainnet.');
          return;
        }
      }

      // 4. Update global context
      connect(address, 'MetaMask');
      navigate('/loading');
    } catch (err) {
      console.error('MetaMask connection error:', err);
      setStatus('idle');
      if (err.code === 4001) {
        setError(i18n.language === 'ar' ? 'تم رفض طلب الاتصال.' : 'Connection request rejected.');
      } else {
        setError(i18n.language === 'ar' ? 'فشل الاتصال بـ MetaMask.' : 'Failed to connect to MetaMask.');
      }
    }
  };

  const handlePhantomConnect = async () => {
    setStatus('connecting');
    setError(null);

    try {
      // 1. Check if Phantom extension exists - use specific phantom provider if available
      const phantomProvider = window.phantom?.solana || window.solana;
      const isPhantomInstalled = phantomProvider?.isPhantom;

      if (!isPhantomInstalled) {
        setStatus('idle');
        setError(i18n.language === 'ar' ? 'محفظة Phantom غير مثبتة. يرجى تثبيتها أولاً.' : 'Phantom wallet is not installed. Please install it first.');
        window.open('https://phantom.app/', '_blank');
        return;
      }

      // 2. Attempt to connect to Phantom
      const response = await phantomProvider.connect();
      const publicKey = response.publicKey.toString();

      // 3. Update global context
      connect(publicKey, 'Phantom');
      
      // 4. Redirect to loading then dashboard
      navigate('/loading');
    } catch (err) {
      console.error('Phantom connection error:', err);
      setStatus('idle');
      if (err.code === 4001) {
        setError(i18n.language === 'ar' ? 'تم رفض طلب الاتصال من قبل المستخدم.' : 'Connection request rejected by user.');
      } else {
        setError(i18n.language === 'ar' ? 'حدث خطأ أثناء الاتصال بالمحفظة.' : 'An error occurred while connecting to the wallet.');
      }
    }
  };

  const handleConnect = (walletName) => {
    if (walletName === 'Phantom') {
      handlePhantomConnect();
      return;
    }
    
    if (walletName === 'MetaMask') {
      handleMetaMaskConnect();
      return;
    }

    if (walletName === 'Trust Wallet') {
      handleTrustWalletConnect();
      return;
    }

    if (walletName === 'Binance') {
      handleBinanceConnect();
      return;
    }

    if (walletName === 'OKX') {
      handleOKXConnect();
      return;
    }

    if (walletName === 'Google' || walletName === 'X') {
      handleSocialLogin();
      return;
    }

    if (walletName === 'WalletConnect') {
      handleWalletConnect();
      return;
    }

    // Placeholder for other wallets
    setStatus('connecting');
    setError(null);
    setTimeout(() => {
      setStatus('idle');
      setError(i18n.language === 'ar' ? 'هذه المحفظة ستكون متاحة قريباً.' : 'This wallet will be available soon.');
    }, 1000);
  };

  const wallets = [
    { name: 'Phantom', icon: '/assets/hero-character.png', color: 'bg-[#AB9FF2]/10', borderColor: 'border-[#AB9FF2]', recommended: true },
    { name: 'MetaMask', icon: 'https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Logo.svg', color: 'bg-[#E2761B]/10', borderColor: 'border-[#E2761B]' },
    { name: 'OKX', icon: 'https://static.okx.com/cdn/assets/imgs/247/1C0D98E9A3C7E3B2.png', color: 'bg-black/10', borderColor: 'border-black' },
    { name: 'Binance', icon: 'https://upload.wikimedia.org/wikipedia/commons/5/57/Binance_Logo.svg', color: 'bg-[#F3BA2F]/10', borderColor: 'border-[#F3BA2F]' },
    { name: 'Trust Wallet', icon: 'https://trustwallet.com/assets/images/media/assets/trust_platform.svg', color: 'bg-[#3375BB]/10', borderColor: 'border-[#3375BB]' },
    { name: 'Google', icon: 'https://upload.wikimedia.org/wikipedia/commons/5/53/Google_尊_Logo.svg', isSocial: true, color: 'bg-white', borderColor: 'border-gray-200' },
    { name: 'X', icon: 'https://upload.wikimedia.org/wikipedia/commons/c/ce/X_logo_2023.svg', isSocial: true, color: 'bg-black', borderColor: 'border-black' },
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
                    group relative flex items-center justify-between p-4 sm:p-5 rounded-2xl border-4 border-pepe-black transition-all
                    hover:-translate-y-1 active:scale-[0.98] disabled:opacity-50
                    ${wallet.recommended ? 'bg-pepe-yellow shadow-[6px_6px_0_0_#000] hover:shadow-[10px_10px_0_0_#000]' : 
                      wallet.isSocial ? 'bg-white shadow-[4px_4px_0_0_#000] hover:shadow-[6px_6px_0_0_#000]' :
                      'bg-white hover:bg-gray-50 shadow-[6px_6px_0_0_#000] hover:shadow-[10px_10px_0_0_#000]'}
                  `}
                >
                  <div className="flex items-center space-x-4 space-x-reverse">
                    <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-xl border-4 border-pepe-black flex items-center justify-center overflow-hidden bg-white`}>
                      {wallet.isWC ? (
                        <Globe size={24} strokeWidth={3} className="text-[#3396FF]" />
                      ) : (
                        <img src={wallet.icon} alt={wallet.name} className="w-6 h-6 sm:w-10 sm:h-10 object-contain" />
                      )}
                    </div>
                    <div className="text-right">
                      <span className="text-xl sm:text-2xl font-black uppercase block leading-none">{wallet.name}</span>
                      {wallet.recommended && <span className="text-[10px] font-black uppercase tracking-widest text-pepe-black/60">Recommended</span>}
                      {wallet.isSocial && <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Social Login</span>}
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

            {/* Troubleshooting / Multi-wallet conflict tip */}
            <div className="bg-pepe-green/5 border-2 border-dashed border-pepe-green/30 p-4 rounded-2xl">
              <div className="flex items-start space-x-3 space-x-reverse">
                <HelpCircle size={18} className="text-pepe-green mt-1 flex-shrink-0" />
                <div className="space-y-1">
                  <p className="text-[10px] sm:text-xs font-black uppercase text-pepe-green">
                    {i18n.language === 'ar' ? 'هل تواجه تعارضاً بين المحافظ؟' : 'Wallet Conflict?'}
                  </p>
                  <p className="text-[9px] sm:text-[10px] font-bold text-gray-500 leading-tight">
                    {i18n.language === 'ar' 
                      ? 'إذا ظهرت نافذة Phantom عند اختيار MetaMask، يرجى التحقق من إعدادات Phantom وإيقاف خيار "Default Wallet".' 
                      : 'If Phantom pops up when selecting MetaMask, please check Phantom settings and disable "Default Wallet" option.'}
                  </p>
                </div>
              </div>
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
