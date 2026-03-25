import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useWallet } from '../context/WalletContext';
import { formatAddress } from '../utils/format';
import { 
  Rocket, Shield, Globe, Copy, Check, Lock, 
  ExternalLink, TrendingUp, TrendingDown, 
  ArrowLeft, LogOut, LayoutDashboard, Wallet,
  Flame, ShieldCheck, Droplets, History, Settings,
  HelpCircle, User, Menu, X, Bell, Zap,
  ChevronRight, ArrowUpRight, Plus, Minus
} from 'lucide-react';
import ProfitCalculator from '../components/ProfitCalculator';
import BuyBox from '../components/BuyBox';

const DashboardPage = () => {
  const { t, i18n } = useTranslation();
  const { isConnected, address, disconnect, walletType } = useWallet();
  const navigate = useNavigate();
  const isRTL = i18n.language === 'ar';
  const [copied, setCopied] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [balance, setBalance] = useState(500000);
  const [stakedBalance, setStakedBalance] = useState(0);
  const [stakingAmount, setStakingAmount] = useState('');
  const [isStaking, setIsStaking] = useState(false);
  const [history, setHistory] = useState([
    { id: 1, date: 'March 24, 2026', type: 'Presale Purchase', amount: 100000, status: 'Confirmed' },
    { id: 2, date: 'March 22, 2026', type: 'Referral Reward', amount: 5000, status: 'Confirmed' },
    { id: 3, date: 'March 20, 2026', type: 'Presale Purchase', amount: 395000, status: 'Confirmed' },
  ]);

  useEffect(() => {
    if (!isConnected) {
      navigate('/connect');
    }
  }, [isConnected, navigate]);

  const handleStake = async () => {
    const amount = parseFloat(stakingAmount);
    if (amount > 0 && amount <= balance) {
      setIsStaking(true);
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setBalance(prev => prev - amount);
      setStakedBalance(prev => prev + amount);
      setHistory(prev => [{
        id: Date.now(),
        date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
        type: 'Staking Deposit',
        amount: -amount,
        status: 'Confirmed'
      }, ...prev]);
      setStakingAmount('');
      setIsStaking(false);
      return true;
    }
    return false;
  };

  const handleBuySuccess = (pwifeAmount) => {
    setBalance(prev => prev + pwifeAmount);
    setHistory(prev => [{
      id: Date.now(),
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      type: 'Presale Purchase',
      amount: pwifeAmount,
      status: 'Confirmed'
    }, ...prev]);
  };

  const handleDisconnect = () => {
    disconnect();
    navigate('/');
  };

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const sidebarItems = useMemo(() => [
    { id: 'overview', icon: <LayoutDashboard size={22} />, label: t('dashboard.tabs.overview', 'Overview') },
    { id: 'history', icon: <History size={22} />, label: t('dashboard.tabs.history', 'History') },
    { id: 'referrals', icon: <Globe size={22} />, label: t('dashboard.tabs.referrals', 'Referrals') },
    { id: 'staking', icon: <Lock size={22} />, label: t('dashboard.tabs.staking', 'Staking') },
    { id: 'settings', icon: <Settings size={22} />, label: t('dashboard.tabs.settings', 'Settings') },
  ], [t]);

  const BackgroundDecor = useMemo(() => () => (
    <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-pepe-yellow/10 blur-[150px] rounded-full" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-pepe-pink/5 blur-[120px] rounded-full" />
      <div className="absolute top-[40%] left-[20%] w-[30%] h-[30%] bg-pepe-green/5 blur-[100px] rounded-full" />
    </div>
  ), []);

  return (
    <div className={`min-h-screen bg-[#F8FAFC] text-pepe-black font-sans relative flex overflow-hidden ${isRTL ? 'rtl' : 'ltr'}`}>
      <BackgroundDecor />

      {/* Modern Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 w-80 bg-white border-r-4 border-pepe-black transition-transform duration-500 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : (isRTL ? 'translate-x-full' : '-translate-x-full')}
        lg:translate-x-0
      `}>
        <div className="h-full flex flex-col p-6 space-y-8">
          {/* Logo Section */}
          <div className="flex items-center space-x-3 space-x-reverse cursor-pointer group px-2" onClick={() => navigate('/')}>
            <div className="w-12 h-12 bg-white rounded-2xl border-4 border-pepe-black flex items-center justify-center shadow-[4px_4px_0_0_#000] group-hover:rotate-6 transition-transform overflow-hidden">
              <img src="/assets/hero-character.png" alt="Logo" className="w-10 h-10 object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black uppercase italic tracking-tighter">
                PEPE<span className="text-pepe-pink">WIFE</span>
              </span>
              <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest leading-none">
                PRE-SALE HUB
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 space-y-2">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  if (window.innerWidth < 1024) setIsSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center justify-between p-4 rounded-2xl transition-all group
                  ${activeTab === item.id 
                    ? 'bg-pepe-black text-white shadow-[8px_8px_0_0_#FF69B4] -translate-y-1' 
                    : 'text-gray-400 hover:bg-gray-100 hover:text-pepe-black'}
                `}
              >
                <div className="flex items-center gap-4">
                  <div className={`${activeTab === item.id ? 'text-pepe-yellow' : 'group-hover:text-pepe-pink'}`}>
                    {item.icon}
                  </div>
                  <span className="font-black uppercase italic text-sm tracking-tight">
                    {item.label}
                  </span>
                </div>
                {activeTab === item.id && <ChevronRight size={18} className="text-white/20" />}
              </button>
            ))}
          </nav>

          {/* User Profile Card Mini */}
          <div className="pt-6 border-t-2 border-gray-100 space-y-4">
            <div className="bg-gray-50 p-4 rounded-2xl border-2 border-pepe-black/5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-pepe-yellow rounded-xl border-2 border-pepe-black flex items-center justify-center">
                  <User size={20} strokeWidth={3} />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] font-black uppercase text-gray-400">Connected via</span>
                  <span className="text-xs font-black uppercase">{walletType || 'Wallet'}</span>
                </div>
              </div>
              <button 
                onClick={handleDisconnect}
                className="w-full flex items-center justify-center gap-2 bg-white border-2 border-red-500/20 py-2 rounded-xl text-[10px] font-black uppercase text-red-500 hover:bg-red-500 hover:text-white transition-all"
              >
                <LogOut size={14} strokeWidth={3} />
                <span>{t('dashboard.disconnect')}</span>
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Layout */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Modern Top Header */}
        <header className="h-24 px-6 lg:px-10 flex items-center justify-between sticky top-0 z-40 bg-white/50 backdrop-blur-md border-b-2 border-gray-100">
          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-3 bg-white border-2 border-pepe-black rounded-xl hover:bg-pepe-yellow transition-colors"
            >
              <Menu size={24} strokeWidth={3} />
            </button>
            <div className="hidden lg:block">
              <h2 className="text-3xl font-black uppercase italic animate-title-gradient">
                {sidebarItems.find(i => i.id === activeTab)?.label}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Network Indicator */}
            <div className="hidden md:flex items-center gap-2 bg-pepe-green/10 px-4 py-2 rounded-full border-2 border-pepe-green/20">
              <div className="w-2 h-2 bg-pepe-green rounded-full animate-pulse" />
              <span className="text-[10px] font-black uppercase text-pepe-green">Mainnet Alpha</span>
            </div>

            {/* Notification & Wallet */}
            <div className="flex items-center gap-3">
              <button className="w-12 h-12 bg-white border-2 border-gray-100 rounded-2xl flex items-center justify-center hover:border-pepe-black transition-all relative">
                <Bell size={20} />
                <span className="absolute top-3 right-3 w-2 h-2 bg-pepe-pink rounded-full border-2 border-white" />
              </button>
              
              <div className="flex items-center bg-pepe-black text-white px-5 h-12 rounded-2xl border-2 border-pepe-black shadow-[4px_4px_0_0_#FF69B4] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all cursor-pointer">
                <Wallet size={18} className="mr-3 rtl:mr-0 rtl:ml-3 text-pepe-yellow" />
                <span className="font-black text-xs tracking-wider">{formatAddress(address)}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto custom-scrollbar p-6 lg:p-10 bg-transparent">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-7xl mx-auto space-y-10 pb-10"
              >
                {/* Hero Section: Balance & Buy Box */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-10">
                  
                  {/* Premium Balance Card */}
                  <div className="lg:col-span-3 flex flex-col gap-8">
                    <div className="bg-pepe-black text-white p-10 rounded-[3.5rem] border-4 border-pepe-black shadow-[15px_15px_0_0_#FF69B4] relative overflow-hidden flex flex-col justify-between min-h-[420px] group">
                      {/* Decorative Background */}
                      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-pepe-pink opacity-5 rounded-full -mr-[250px] -mt-[250px] blur-[100px] group-hover:opacity-20 transition-opacity duration-1000" />
                      <div className="absolute bottom-0 left-0 w-80 h-80 bg-pepe-yellow opacity-5 rounded-full -ml-40 -mb-40 blur-[80px]" />
                      
                      <div className="relative z-10 space-y-10">
                        <div className="flex justify-between items-start">
                          <div className="bg-white/10 px-6 py-2 rounded-full border-2 border-white/20 flex items-center space-x-3 space-x-reverse backdrop-blur-md">
                            <Rocket className="text-pepe-yellow" size={20} />
                            <span className="text-xs font-black uppercase tracking-[0.2em]">{t('dashboard.balance')}</span>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <span className="bg-pepe-green/20 text-pepe-green px-4 py-1 rounded-full text-[10px] font-black uppercase border border-pepe-green/20">
                              Stage 1: LIVE
                            </span>
                            <span className="text-[10px] font-bold text-white/40 uppercase">Presale ending in 12d 4h</span>
                          </div>
                        </div>

                        <div className="space-y-4">
                          <p className="text-[10px] font-black uppercase text-white/40 tracking-[0.4em] ml-2">Estimated Balance</p>
                          <div className="flex items-baseline gap-4">
                            <p className="text-8xl lg:text-[10rem] font-black italic text-pepe-yellow leading-none tracking-tighter animate-title-gradient drop-shadow-[8px_8px_0px_#000]">
                              {balance >= 1000000 ? `${(balance / 1000000).toFixed(1)}M` : balance >= 1000 ? `${(balance / 1000).toFixed(0)}K` : balance}
                            </p>
                            <span className="text-4xl font-black text-white/20 uppercase tracking-tighter">$PWIFE</span>
                          </div>
                        </div>
                      </div>

                      <div className="relative z-10 grid grid-cols-2 gap-10 mt-10">
                        <div className="bg-white/5 p-6 rounded-[2rem] border-2 border-white/10 flex items-center justify-between group/card hover:bg-white/10 transition-colors">
                          <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase text-gray-500">Current Value</p>
                            <p className="text-3xl font-black text-white italic">${(balance * 0.00012 + stakedBalance * 0.00012).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                          </div>
                          <div className="w-10 h-10 bg-pepe-green rounded-xl flex items-center justify-center rotate-[-10deg] group-hover/card:rotate-0 transition-transform">
                            <TrendingUp size={20} className="text-pepe-black" strokeWidth={3} />
                          </div>
                        </div>
                        <div className="bg-white/5 p-6 rounded-[2rem] border-2 border-white/10 flex items-center justify-between group/card hover:bg-white/10 transition-colors">
                          <div className="space-y-1">
                            <p className="text-[10px] font-black uppercase text-gray-500">Staked Balance</p>
                            <p className="text-3xl font-black text-pepe-pink italic">{stakedBalance > 0 ? (stakedBalance >= 1000 ? `${(stakedBalance / 1000).toFixed(0)}K` : stakedBalance) : '0'}</p>
                          </div>
                          <div className="w-10 h-10 bg-pepe-pink/20 rounded-xl flex items-center justify-center rotate-[10deg] group-hover/card:rotate-0 transition-transform">
                            <Lock size={20} className="text-pepe-pink" strokeWidth={3} />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Staking Banner Mini */}
                    <div 
                      onClick={() => setActiveTab('staking')}
                      className="bg-pepe-yellow p-8 rounded-[3rem] border-4 border-pepe-black shadow-[10px_10px_0_0_#000] flex items-center justify-between group hover:translate-y-[-4px] transition-transform cursor-pointer"
                    >
                      <div className="flex items-center gap-6">
                        <div className="w-16 h-16 bg-white rounded-2xl border-4 border-pepe-black flex items-center justify-center shadow-[4px_4px_0_0_#000] group-hover:scale-110 transition-transform">
                          <Lock size={32} strokeWidth={3} className="text-pepe-pink" />
                        </div>
                        <div className="space-y-1">
                          <h4 className="text-xl font-black uppercase italic leading-none">High-Yield Staking</h4>
                          <p className="text-sm font-bold text-pepe-black/60">Earn up to 450% APR by staking your $PWIFE</p>
                        </div>
                      </div>
                      <div className="hidden sm:flex items-center gap-2 bg-pepe-black text-white px-6 py-3 rounded-2xl font-black uppercase italic text-sm">
                        Go Stake <ChevronRight size={18} />
                      </div>
                    </div>
                  </div>

                  {/* Professional Buy Box Component */}
                  <div className="lg:col-span-2">
                    <BuyBox t={t} onSuccess={handleBuySuccess} />
                  </div>
                </div>

                {/* Second Grid: Referral & Calculator */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  
                  {/* Modern Referral System */}
                  <div className="bg-white p-10 rounded-[3.5rem] border-4 border-pepe-black shadow-[15px_15px_0_0_#000] flex flex-col justify-between group overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-pepe-yellow opacity-5 rounded-full -mr-32 -mt-32" />
                    
                    <div className="relative z-10">
                      <div className="flex items-center gap-4 mb-8">
                        <div className="w-16 h-16 bg-pepe-yellow rounded-2xl border-4 border-pepe-black flex items-center justify-center shadow-[6px_6px_0_0_#000]">
                          <Globe size={32} strokeWidth={3} />
                        </div>
                        <div>
                          <h4 className="text-3xl font-black uppercase italic leading-none">{t('dashboard.referral')}</h4>
                          <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mt-1">Earn 5% instantly</p>
                        </div>
                      </div>
                      <p className="text-lg font-bold text-gray-600 mb-10 leading-relaxed max-w-md">
                        {t('dashboard.referral_desc')}
                      </p>
                    </div>

                    <div className="space-y-6 relative z-10">
                      <div className="bg-gray-50 border-4 border-pepe-black/5 rounded-[2rem] p-6 space-y-4">
                        <p className="text-[10px] font-black uppercase text-gray-400 px-2 tracking-widest">Your unique referral link</p>
                        <div className="bg-white border-2 border-pepe-black/10 rounded-2xl p-4 flex items-center justify-between gap-4">
                          <code className="text-sm font-black text-pepe-black truncate">
                            {address ? `pepewife.com/?ref=${formatAddress(address)}` : 'Connect Wallet'}
                          </code>
                          <button 
                            onClick={copyAddress}
                            className={`
                              p-4 rounded-xl transition-all active:scale-95
                              ${copied ? 'bg-pepe-green text-pepe-black' : 'bg-pepe-black text-white hover:bg-pepe-pink'}
                            `}
                          >
                            {copied ? <Check size={20} strokeWidth={4} /> : <Copy size={20} strokeWidth={2} />}
                          </button>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-pepe-green/5 border-2 border-pepe-green/10 p-6 rounded-3xl text-center">
                          <p className="text-[10px] font-black uppercase text-pepe-green/60 mb-1">Total Referrals</p>
                          <p className="text-4xl font-black italic text-pepe-black">24</p>
                        </div>
                        <div className="bg-pepe-pink/5 border-2 border-pepe-pink/10 p-6 rounded-3xl text-center">
                          <p className="text-[10px] font-black uppercase text-pepe-pink/60 mb-1">Earned Rewards</p>
                          <p className="text-4xl font-black italic text-pepe-pink">5.2 SOL</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Profit Calculator with High-end Styling */}
                  <div className="relative">
                    <div className="absolute -top-6 -right-6 w-32 h-32 bg-pepe-pink opacity-5 blur-[40px] rounded-full" />
                    <ProfitCalculator t={t} />
                  </div>
                </div>

                {/* Trust & Security Section */}
                <div className="bg-pepe-black text-white p-10 lg:p-14 rounded-[4rem] border-4 border-pepe-black shadow-[20px_20px_0_0_#FF69B4] space-y-12 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_30%_30%,rgba(255,105,180,0.1)_0%,transparent_100%)]" />
                  
                  <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-10">
                    <div className="flex items-center space-x-8 space-x-reverse">
                      <div className="w-24 h-24 bg-pepe-green rounded-[2rem] border-4 border-pepe-black flex items-center justify-center shadow-[8px_8px_0_0_#000] rotate-[-5deg] group-hover:rotate-0 transition-transform">
                        <ShieldCheck className="text-pepe-black" size={56} strokeWidth={3} />
                      </div>
                      <div className="space-y-2">
                        <h4 className="text-4xl font-black uppercase italic leading-none">Protocol Integrity</h4>
                        <p className="text-white/40 font-bold text-lg">Smart contracts audited by industry-leading security firms</p>
                      </div>
                    </div>
                    <button className="bg-pepe-yellow text-pepe-black border-4 border-pepe-black px-12 py-5 rounded-2xl font-black uppercase italic text-xl shadow-[8px_8px_0_0_#fff] hover:translate-y-1 transition-all active:shadow-none">
                      Audit Report
                    </button>
                  </div>
                  
                  <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[
                      { icon: <Flame className="text-pepe-yellow" />, label: t('tokenomics.zero_tax'), status: 'Active', desc: 'No tax on trades' },
                      { icon: <Lock className="text-pepe-pink" />, label: t('tokenomics.liquidity_lock'), status: 'Verified', desc: 'Locked for 2 years' },
                      { icon: <ShieldCheck className="text-pepe-green" />, label: t('tokenomics.team_lock'), status: 'Locked', desc: 'Vesting implemented' },
                      { icon: <Droplets className="text-blue-400" />, label: t('tokenomics.linear_vesting'), status: 'Enabled', desc: 'Secure distribution' }
                    ].map((item, idx) => (
                      <div key={idx} className="bg-white/5 p-8 rounded-[2.5rem] border-2 border-white/10 flex flex-col items-center text-center space-y-5 hover:bg-white/10 transition-all hover:-translate-y-2 group">
                        <div className="w-16 h-16 bg-white/10 rounded-2xl border-2 border-white/20 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                          {item.icon}
                        </div>
                        <div className="space-y-1">
                          <span className="font-black uppercase italic text-sm block">{item.label}</span>
                          <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{item.desc}</p>
                        </div>
                        <span className="bg-pepe-green text-pepe-black px-5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-tighter">
                          {item.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'history' && (
              <motion.div
                key="history"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="max-w-5xl mx-auto bg-white border-4 border-pepe-black rounded-[3.5rem] p-10 shadow-[15px_15px_0_0_#000] space-y-10"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-4xl font-black uppercase italic">Activity Log</h3>
                  <button className="p-4 bg-gray-50 border-2 border-pepe-black/5 rounded-2xl hover:bg-pepe-yellow transition-colors">
                    <Plus size={24} />
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-right border-collapse">
                    <thead>
                      <tr className="bg-gray-50/50 border-b-4 border-pepe-black">
                        <th className="p-8 font-black uppercase italic text-sm text-gray-400">Date & Time</th>
                        <th className="p-8 font-black uppercase italic text-sm text-gray-400">Transaction Type</th>
                        <th className="p-8 font-black uppercase italic text-sm text-gray-400">Amount ($PWIFE)</th>
                        <th className="p-8 font-black uppercase italic text-sm text-gray-400">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-gray-100">
                      {history.map(item => (
                        <tr key={item.id} className="group hover:bg-gray-50 transition-colors">
                          <td className="p-8 font-bold text-gray-500 text-sm">{item.date}</td>
                          <td className="p-8">
                            <div className="flex items-center gap-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.amount > 0 ? 'bg-pepe-green/10' : 'bg-pepe-pink/10'}`}>
                                {item.amount > 0 ? <Plus size={14} className="text-pepe-green" strokeWidth={4} /> : <Minus size={14} className="text-pepe-pink" strokeWidth={4} />}
                              </div>
                              <span className="font-black uppercase text-sm">{item.type}</span>
                            </div>
                          </td>
                          <td className={`p-8 font-black text-lg ${item.amount > 0 ? 'text-pepe-green' : 'text-pepe-pink'}`}>
                            {item.amount > 0 ? '+' : ''}{item.amount.toLocaleString()}
                          </td>
                          <td className="p-8">
                            <div className="flex items-center gap-2 bg-pepe-green/10 w-fit px-4 py-1.5 rounded-full border-2 border-pepe-green/10">
                              <Check size={12} className="text-pepe-green" strokeWidth={4} />
                              <span className="text-[10px] font-black uppercase text-pepe-green">{item.status}</span>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === 'referrals' && (
              <motion.div
                key="referrals"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-6xl mx-auto space-y-10"
              >
                <div className="bg-pepe-yellow p-12 rounded-[4rem] border-4 border-pepe-black shadow-[15px_15px_0_0_#000] relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-80 h-80 bg-white opacity-20 rounded-full -mr-40 -mt-40" />
                  <div className="relative z-10 space-y-8">
                    <h3 className="text-5xl font-black uppercase italic leading-none">Partner Program</h3>
                    <p className="text-xl font-bold text-pepe-black/70 max-w-2xl">
                      Become a Pepe Wife ambassador. Share your link and earn <span className="text-pepe-pink underline">5% of every purchase</span> made by your referrals, instantly paid in SOL/ETH.
                    </p>
                    <div className="bg-white border-4 border-pepe-black rounded-3xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[10px_10px_0_0_#000]">
                      <div className="flex flex-col gap-2">
                        <span className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Share this link to earn</span>
                        <code className="text-xl font-black text-pepe-black tracking-tight">
                            {address ? `pepewife.com/?ref=${address}` : '...'}
                          </code>
                      </div>
                      <button onClick={copyAddress} className="w-full md:w-auto px-10 py-5 bg-pepe-pink text-white rounded-2xl border-4 border-pepe-black shadow-[6px_6px_0_0_#000] hover:translate-y-1 transition-all flex items-center justify-center gap-3">
                        <Copy size={24} strokeWidth={3} />
                        <span className="font-black uppercase italic">{copied ? 'Copied!' : 'Copy Link'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {[
                    { label: 'Total Referrals', value: '42', icon: <User className="text-pepe-pink" /> },
                    { label: 'Rewards Earned', value: '8.4 SOL', icon: <Zap className="text-pepe-yellow" fill="currentColor" /> },
                    { label: 'Network Level', value: 'Diamond', icon: <Shield className="text-pepe-green" /> }
                  ].map((stat, i) => (
                    <div key={i} className="bg-white border-4 border-pepe-black p-10 rounded-[3rem] shadow-[12px_12px_0_0_#000] flex flex-col items-center text-center gap-4 hover:-translate-y-2 transition-transform">
                      <div className="w-16 h-16 bg-gray-50 rounded-2xl border-2 border-gray-100 flex items-center justify-center">
                        {stat.icon}
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.3em] mb-1">{stat.label}</p>
                        <p className="text-4xl font-black italic">{stat.value}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'staking' && (
              <motion.div
                key="staking"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-6xl mx-auto space-y-10"
              >
                <div className="bg-pepe-black text-white p-12 rounded-[4rem] border-4 border-pepe-black shadow-[20px_20px_0_0_#FF69B4] relative overflow-hidden flex flex-col lg:flex-row items-center gap-12">
                  <div className="absolute top-0 right-0 w-96 h-96 bg-pepe-pink opacity-10 rounded-full blur-[100px]" />
                  
                  <div className="flex-1 space-y-8 relative z-10">
                    <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full border-2 border-white/10 backdrop-blur-md">
                      <Lock size={18} className="text-pepe-pink" />
                      <span className="text-[10px] font-black uppercase tracking-widest">Locked Staking v2</span>
                    </div>
                    <h3 className="text-5xl font-black uppercase italic text-pepe-yellow leading-none tracking-tighter">
                      Maximize Your <br /> $PWIFE Rewards
                    </h3>
                    <p className="text-xl font-bold text-white/60 leading-relaxed max-w-xl">
                      Stake your tokens in our high-yield pools and earn passive income daily. Join over 15,000 holders securing the network.
                    </p>
                    <div className="grid grid-cols-2 gap-6">
                      <div className="bg-white/5 p-6 rounded-3xl border-2 border-white/10">
                        <p className="text-[10px] font-black uppercase text-white/40 mb-2">Current APR</p>
                        <p className="text-4xl font-black text-pepe-green italic">450%</p>
                      </div>
                      <div className="bg-white/5 p-6 rounded-3xl border-2 border-white/10">
                        <p className="text-[10px] font-black uppercase text-white/40 mb-2">Total Staked</p>
                        <p className="text-4xl font-black italic">15.4M</p>
                      </div>
                    </div>
                  </div>

                  <div className="w-full lg:w-96 bg-white border-4 border-pepe-black p-8 rounded-[3rem] shadow-[12px_12px_0_0_#000] text-pepe-black space-y-8 relative z-10">
                    <div className="space-y-4">
                      <div className="flex justify-between px-2">
                        <span className="text-[10px] font-black uppercase text-gray-400">Amount to stake</span>
                        <span className="text-[10px] font-black uppercase text-pepe-pink">Balance: {balance >= 1000 ? `${(balance / 1000).toFixed(0)}K` : balance}</span>
                      </div>
                      <div className="relative">
                        <input 
                          type="number" 
                          value={stakingAmount}
                          onChange={(e) => setStakingAmount(e.target.value)}
                          placeholder="0.00" 
                          className="w-full border-4 border-pepe-black p-5 rounded-2xl font-black text-2xl outline-none focus:ring-4 ring-pepe-yellow/20 transition-all" 
                        />
                        <button 
                          onClick={() => setStakingAmount(balance.toString())}
                          className="absolute right-4 top-1/2 -translate-y-1/2 bg-pepe-black text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase hover:bg-pepe-pink transition-colors"
                        >
                          MAX
                        </button>
                      </div>
                    </div>
                    <div className="space-y-3 bg-gray-50 p-4 rounded-2xl border-2 border-pepe-black/5">
                      <div className="flex justify-between text-[10px] font-bold text-gray-500">
                        <span>Lock Period</span>
                        <span className="text-pepe-black">30 Days</span>
                      </div>
                      <div className="flex justify-between text-[10px] font-bold text-gray-500">
                        <span>Expected Rewards</span>
                        <span className="text-pepe-green font-black">+{stakingAmount ? (parseFloat(stakingAmount) * 0.025).toLocaleString() : '0'} $PWIFE</span>
                      </div>
                    </div>
                    <button 
                      onClick={handleStake}
                      disabled={isStaking || !stakingAmount || parseFloat(stakingAmount) <= 0 || parseFloat(stakingAmount) > balance}
                      className="w-full bg-pepe-yellow border-4 border-pepe-black py-5 rounded-2xl font-black uppercase italic text-xl shadow-[6px_6px_0_0_#000] hover:translate-y-1 active:shadow-none transition-all disabled:opacity-50"
                    >
                      {isStaking ? 'Staking...' : 'Stake Now'}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="max-w-4xl mx-auto bg-white border-4 border-pepe-black rounded-[3.5rem] p-12 shadow-[20px_20px_0_0_#000] space-y-12 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-64 h-64 bg-pepe-pink/5 rounded-full blur-[60px]" />
                
                <div className="relative z-10 space-y-2">
                  <h3 className="text-4xl font-black uppercase italic">Profile Settings</h3>
                  <p className="text-gray-400 font-bold">Manage your account and preferences</p>
                </div>

                <div className="relative z-10 space-y-10">
                  <div className="grid md:grid-cols-2 gap-10">
                    <div className="space-y-4">
                      <label className="font-black uppercase italic text-xs tracking-widest text-gray-400 ml-2">Display Name</label>
                      <div className="relative">
                        <User className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={20} />
                        <input type="text" placeholder="Pepe Enjoyer" className="w-full border-4 border-pepe-black p-5 pl-14 rounded-2xl font-black outline-none focus:ring-4 ring-pepe-yellow/20 transition-all" />
                      </div>
                    </div>
                    <div className="space-y-4">
                      <label className="font-black uppercase italic text-xs tracking-widest text-gray-400 ml-2">Email Address</label>
                      <input type="email" placeholder="pepe@crypto.com" className="w-full border-4 border-pepe-black p-5 rounded-2xl font-black outline-none focus:ring-4 ring-pepe-yellow/20 transition-all" />
                    </div>
                  </div>

                  <div className="space-y-6 bg-gray-50 p-8 rounded-[2.5rem] border-4 border-pepe-black/5">
                    <h4 className="font-black uppercase italic text-sm">Notifications</h4>
                    <div className="space-y-4">
                      {[
                        { label: 'Presale Phase Updates', desc: 'Get notified when a new stage begins', checked: true },
                        { label: 'Referral Rewards', desc: 'Alert when someone uses your link', checked: true },
                        { label: 'Security Alerts', desc: 'Critical account security notifications', checked: false }
                      ].map((item, i) => (
                        <div key={i} className="flex items-center justify-between group">
                          <div className="space-y-1">
                            <p className="font-black uppercase text-xs">{item.label}</p>
                            <p className="text-[10px] font-bold text-gray-400">{item.desc}</p>
                          </div>
                          <div className={`w-14 h-8 rounded-full border-4 border-pepe-black relative cursor-pointer transition-colors ${item.checked ? 'bg-pepe-green' : 'bg-gray-200'}`}>
                            <div className={`absolute top-1 w-4 h-4 bg-white border-2 border-pepe-black rounded-full transition-all ${item.checked ? 'right-1' : 'left-1'}`} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6 flex flex-col sm:flex-row gap-4">
                    <button className="flex-1 bg-pepe-black text-white border-4 border-pepe-black py-5 rounded-2xl font-black uppercase italic text-lg shadow-[8px_8px_0_0_#FF69B4] hover:translate-y-1 active:shadow-none transition-all">
                      Save Profile
                    </button>
                    <button className="px-10 border-4 border-pepe-black py-5 rounded-2xl font-black uppercase italic text-lg hover:bg-gray-50 transition-all">
                      Cancel
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Modern Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-pepe-black/40 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default DashboardPage;
