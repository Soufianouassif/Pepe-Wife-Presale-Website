import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useWallet } from '../context/WalletContext';
import { 
  Rocket, Shield, Globe, Copy, Check, Lock, 
  ExternalLink, TrendingUp, TrendingDown, 
  ArrowLeft, LogOut, LayoutDashboard, Wallet,
  Flame, ShieldCheck, Droplets, History, Settings,
  HelpCircle, User, Menu, X, Bell
} from 'lucide-react';
import ProfitCalculator from '../components/ProfitCalculator';

const DashboardPage = () => {
  const { t, i18n } = useTranslation();
  const { isConnected, address, disconnect } = useWallet();
  const navigate = useNavigate();
  const isRTL = i18n.language === 'ar';
  const [copied, setCopied] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (!isConnected) {
      navigate('/connect');
    }
  }, [isConnected, navigate]);

  const handleDisconnect = () => {
    disconnect();
    navigate('/');
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sidebarItems = [
    { id: 'overview', icon: <LayoutDashboard size={24} />, label: t('dashboard.tabs.overview', 'Overview') },
    { id: 'history', icon: <History size={24} />, label: t('dashboard.tabs.history', 'History') },
    { id: 'referrals', icon: <Globe size={24} />, label: t('dashboard.tabs.referrals', 'Referrals') },
    { id: 'staking', icon: <Lock size={24} />, label: t('dashboard.tabs.staking', 'Staking') },
    { id: 'settings', icon: <Settings size={24} />, label: t('dashboard.tabs.settings', 'Settings') },
  ];

  return (
    <div className={`min-h-screen bg-[#F0F2F5] text-pepe-black font-sans flex ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Sidebar - Desktop */}
      <aside className={`
        fixed inset-y-0 z-50 w-80 bg-white border-r-8 border-pepe-black transition-transform duration-300 lg:translate-x-0 lg:static lg:block
        ${isSidebarOpen ? 'translate-x-0' : (isRTL ? 'translate-x-full' : '-translate-x-full')}
      `}>
        <div className="h-full flex flex-col p-8 space-y-10">
          {/* Logo */}
          <div className="flex items-center space-x-4 space-x-reverse cursor-pointer group" onClick={() => navigate('/')}>
            <div className="flex items-center space-x-2 space-x-reverse group-hover:scale-105 transition-transform">
              <img src="/assets/hero-character.png" alt="Logo" className="w-14 h-14 object-contain" />
              <div className="flex flex-col">
                <span className="text-2xl font-black uppercase leading-none bg-gradient-to-r from-pepe-green to-gray-400 bg-clip-text text-transparent animate-gradient-text">
                  Pepe Wife
                </span>
                <span className="text-xs font-black uppercase tracking-widest bg-gradient-to-r from-pepe-green to-gray-400 bg-clip-text text-transparent animate-gradient-text">
                  $PWIFE
                </span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-4">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`
                  w-full flex items-center space-x-4 space-x-reverse p-4 rounded-2xl border-4 transition-all
                  ${activeTab === item.id 
                    ? 'bg-pepe-yellow border-pepe-black shadow-[6px_6px_0_0_#000] translate-x-1 translate-y-1' 
                    : 'bg-white border-transparent hover:bg-gray-50'}
                `}
              >
                <div className={`${activeTab === item.id ? 'text-pepe-black' : 'text-gray-400'}`}>
                  {item.icon}
                </div>
                <span className={`text-lg font-black uppercase italic ${activeTab === item.id ? 'text-pepe-black' : 'text-gray-400'}`}>
                  {item.label}
                </span>
              </button>
            ))}
          </nav>

          {/* Bottom Sidebar Info */}
          <div className="pt-6 border-t-4 border-pepe-black/5 space-y-6">
            <div className="bg-pepe-pink/10 p-6 rounded-[2rem] border-4 border-pepe-black text-center space-y-4">
              <div className="w-12 h-12 bg-pepe-pink rounded-xl border-4 border-pepe-black flex items-center justify-center mx-auto shadow-[4px_4px_0_0_#000]">
                <HelpCircle size={24} className="text-white" />
              </div>
              <p className="text-sm font-black uppercase">Need Help?</p>
              <button className="w-full bg-white border-4 border-pepe-black py-2 rounded-xl text-xs font-black uppercase shadow-[4px_4px_0_0_#000] hover:translate-y-1 hover:shadow-none transition-all">
                Contact Support
              </button>
            </div>

            <button 
              onClick={handleDisconnect}
              className="w-full flex items-center justify-center space-x-3 space-x-reverse bg-red-50 text-red-500 border-4 border-red-500 p-4 rounded-2xl font-black uppercase italic hover:bg-red-500 hover:text-white transition-all shadow-[6px_6px_0_0_rgba(239,68,68,0.2)]"
            >
              <LogOut size={24} strokeWidth={3} />
              <span>{t('dashboard.disconnect')}</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Top Navbar */}
        <header className="bg-white border-b-8 border-pepe-black p-6 sticky top-0 z-40 flex items-center justify-between">
          <div className="flex items-center space-x-4 space-x-reverse">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="lg:hidden p-3 border-4 border-pepe-black rounded-xl hover:bg-pepe-yellow transition-colors"
            >
              {isSidebarOpen ? <X size={24} strokeWidth={3} /> : <Menu size={24} strokeWidth={3} />}
            </button>
            <h2 className="text-2xl font-black uppercase italic hidden sm:block">
              {sidebarItems.find(i => i.id === activeTab)?.label}
            </h2>
          </div>

          <div className="flex items-center space-x-4 space-x-reverse">
            <button className="p-3 bg-white border-4 border-pepe-black rounded-xl shadow-[4px_4px_0_0_#000] hover:translate-y-1 hover:shadow-none transition-all relative">
              <Bell size={24} strokeWidth={3} />
              <span className="absolute top-0 right-0 w-4 h-4 bg-pepe-pink rounded-full border-2 border-pepe-black animate-pulse" />
            </button>
            
            <div className="flex items-center bg-pepe-black text-white px-6 py-2 rounded-2xl border-4 border-pepe-black shadow-[4px_4px_0_0_#FF69B4] hover:-translate-y-1 transition-all cursor-pointer">
              <Wallet size={20} className="mr-3 rtl:mr-0 rtl:ml-3 text-pepe-yellow" />
              <span className="font-black text-sm">{address}</span>
            </div>

            <div className="w-12 h-12 bg-pepe-yellow rounded-xl border-4 border-pepe-black flex items-center justify-center shadow-[4px_4px_0_0_#000] cursor-pointer hover:rotate-6 transition-transform">
              <User size={28} strokeWidth={3} />
            </div>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 p-6 lg:p-10 space-y-10">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-10"
              >
                {/* Welcome & Quick Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Main Balance Card */}
                  <div className="lg:col-span-2 bg-pepe-black text-white p-10 rounded-[3rem] border-8 border-pepe-black shadow-[20px_20px_0_0_#FF69B4] relative overflow-hidden flex flex-col justify-between min-h-[350px] group">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-pepe-pink opacity-10 rounded-full -mr-48 -mt-48 group-hover:scale-110 transition-transform duration-1000" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-pepe-yellow opacity-5 rounded-full -ml-32 -mb-32" />
                    
                    <div className="relative z-10 space-y-8">
                      <div className="flex justify-between items-start">
                        <div className="bg-white/10 px-6 py-2 rounded-full border-2 border-white/20 flex items-center space-x-3 space-x-reverse backdrop-blur-md">
                          <Rocket className="text-pepe-yellow" size={20} />
                          <span className="text-xs font-black uppercase tracking-[0.2em]">{t('dashboard.balance')}</span>
                        </div>
                        <div className="bg-pepe-green text-pepe-black px-4 py-1 rounded-full text-[10px] font-black uppercase animate-pulse">
                          Price Up +12%
                        </div>
                      </div>

                      <div className="space-y-2">
                        <p className="text-7xl sm:text-9xl font-black italic text-pepe-yellow leading-none tracking-tighter animate-title-gradient drop-shadow-[5px_5px_0px_#000]">
                          500,000
                        </p>
                        <p className="text-3xl font-black text-white/40 uppercase tracking-tighter">$PWIFE TOKENS</p>
                      </div>
                    </div>

                    <div className="relative z-10 mt-10 pt-10 border-t-4 border-white/10 grid grid-cols-2 gap-10">
                      <div className="space-y-1">
                        <p className="text-xs font-black uppercase text-gray-500">{t('dashboard.claim_date')}</p>
                        <p className="text-3xl font-black text-pepe-green italic">Q3 2026</p>
                      </div>
                      <div className="text-right space-y-1">
                        <p className="text-xs font-black uppercase text-gray-500">Estimated Value</p>
                        <p className="text-3xl font-black text-pepe-pink italic">~$1,250.00</p>
                      </div>
                    </div>
                  </div>

                  {/* Secondary Actions Column */}
                  <div className="space-y-8">
                    {/* Buy More Card */}
                    <div className="bg-white border-8 border-pepe-black rounded-[3rem] p-8 shadow-[15px_15px_0_0_#000] text-center space-y-6">
                      <div className="w-16 h-16 bg-pepe-yellow rounded-2xl border-4 border-pepe-black flex items-center justify-center mx-auto shadow-[4px_4px_0_0_#000]">
                        <Flame size={32} className="text-pepe-black" strokeWidth={3} />
                      </div>
                      <h4 className="text-2xl font-black uppercase italic leading-none">Presale is Live!</h4>
                      <p className="text-sm font-bold text-gray-500">Buy more $PWIFE before the price increases in the next phase.</p>
                      <button className="w-full bg-pepe-green text-pepe-black border-4 border-pepe-black py-4 rounded-2xl font-black uppercase italic shadow-[6px_6px_0_0_#000] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
                        Buy Now
                      </button>
                    </div>

                    {/* Staking Preview */}
                    <div className="bg-pepe-black p-8 rounded-[3rem] border-8 border-pepe-black shadow-[15px_15px_0_0_#FF69B4] text-white">
                      <div className="flex justify-between items-center mb-4">
                        <span className="text-xs font-black uppercase text-gray-400">Current APR</span>
                        <span className="text-pepe-green font-black text-2xl">450%</span>
                      </div>
                      <p className="text-sm font-bold text-white/60 mb-6">Stake your tokens to earn massive rewards daily.</p>
                      <button className="w-full bg-white text-pepe-black border-4 border-pepe-black py-3 rounded-xl font-black uppercase text-sm shadow-[4px_4px_0_0_#000]">
                        Go to Staking
                      </button>
                    </div>
                  </div>
                </div>

                {/* Main Content Grid: Calculator & Referrals */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  {/* Referral System */}
                  <div className="bg-pepe-yellow p-10 rounded-[4rem] border-8 border-pepe-black shadow-[20px_20px_0_0_#000] flex flex-col justify-between group">
                    <div className="relative">
                      <div className="w-20 h-20 bg-white rounded-3xl border-4 border-pepe-black flex items-center justify-center mb-8 shadow-[6px_6px_0_0_#000] group-hover:rotate-12 transition-transform">
                        <Globe size={40} strokeWidth={3} className="text-pepe-pink" />
                      </div>
                      <h4 className="text-4xl font-black uppercase italic mb-4 leading-none">{t('dashboard.referral')}</h4>
                      <p className="text-xl font-bold text-pepe-black/70 mb-10 leading-relaxed max-w-md">
                        {t('dashboard.referral_desc')}
                      </p>
                    </div>

                    <div className="space-y-6">
                      <div className="bg-white border-4 border-pepe-black rounded-2xl p-6 flex items-center justify-between shadow-[8px_8px_0_0_#000]">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black uppercase text-gray-400 mb-1">Your Referral Link</span>
                          <code className="text-sm font-black text-pepe-black truncate max-w-[200px]">pepewife.com/?ref=0x71C...3921</code>
                        </div>
                        <button 
                          onClick={copyAddress}
                          className={`p-4 rounded-xl border-4 border-pepe-black transition-all ${copied ? 'bg-pepe-green text-white' : 'bg-pepe-pink text-white hover:scale-110 shadow-[4px_4px_0_0_#000]'}`}
                        >
                          {copied ? <Check size={24} strokeWidth={3} /> : <Copy size={24} strokeWidth={3} />}
                        </button>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white/50 border-4 border-pepe-black p-4 rounded-2xl text-center">
                          <p className="text-xs font-black uppercase text-gray-500">Total Referrals</p>
                          <p className="text-3xl font-black">24</p>
                        </div>
                        <div className="bg-white/50 border-4 border-pepe-black p-4 rounded-2xl text-center">
                          <p className="text-xs font-black uppercase text-gray-500">Earned Rewards</p>
                          <p className="text-3xl font-black text-pepe-green">+5,200</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Calculator */}
                  <div className="bg-white border-8 border-pepe-black rounded-[4rem] p-10 shadow-[20px_20px_0_0_#000]">
                    <ProfitCalculator t={t} />
                  </div>
                </div>

                {/* Security Section */}
                <div className="bg-white border-8 border-pepe-black rounded-[4rem] p-10 shadow-[20px_20px_0_0_#000] space-y-10">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="flex items-center space-x-6 space-x-reverse">
                      <div className="w-16 h-16 bg-pepe-green rounded-2xl border-4 border-pepe-black flex items-center justify-center shadow-[6px_6px_0_0_#000]">
                        <ShieldCheck className="text-white" size={40} strokeWidth={3} />
                      </div>
                      <div>
                        <h4 className="text-3xl font-black uppercase italic leading-none">Security Dashboard</h4>
                        <p className="text-gray-500 font-bold">Your assets are protected by smart contract audits</p>
                      </div>
                    </div>
                    <button className="bg-pepe-black text-white border-4 border-pepe-black px-8 py-3 rounded-2xl font-black uppercase italic shadow-[6px_6px_0_0_#000] hover:translate-y-1 transition-all">
                      View Audit Report
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[
                      { icon: <Flame className="text-pepe-yellow" />, label: t('tokenomics.zero_tax'), status: 'Active', color: 'bg-pepe-yellow/5' },
                      { icon: <Lock className="text-pepe-pink" />, label: t('tokenomics.liquidity_lock'), status: 'Verified', color: 'bg-pepe-pink/5' },
                      { icon: <ShieldCheck className="text-pepe-green" />, label: t('tokenomics.team_lock'), status: 'Locked', color: 'bg-pepe-green/5' },
                      { icon: <Droplets className="text-blue-400" />, label: t('tokenomics.linear_vesting'), status: 'Enabled', color: 'bg-blue-400/5' }
                    ].map((item, idx) => (
                      <div key={idx} className={`${item.color} p-6 rounded-3xl border-4 border-pepe-black shadow-[6px_6px_0_0_#000] flex flex-col items-center text-center space-y-4 hover:-translate-y-2 transition-transform`}>
                        <div className="w-12 h-12 bg-white rounded-xl border-4 border-pepe-black flex items-center justify-center shadow-[4px_4px_0_0_#000]">
                          {item.icon}
                        </div>
                        <span className="font-black uppercase italic text-sm">{item.label}</span>
                        <span className="bg-pepe-black text-white px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">{item.status}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'history' && (
              <motion.div
                key="history"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-white border-8 border-pepe-black rounded-[4rem] p-10 shadow-[20px_20px_0_0_#000] space-y-8"
              >
                <h3 className="text-4xl font-black uppercase italic">Transaction History</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-right border-collapse">
                    <thead>
                      <tr className="bg-gray-50 border-b-4 border-pepe-black">
                        <th className="p-6 font-black uppercase italic">Date</th>
                        <th className="p-6 font-black uppercase italic">Type</th>
                        <th className="p-6 font-black uppercase italic">Amount</th>
                        <th className="p-6 font-black uppercase italic">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y-2 divide-gray-100">
                      {[1, 2, 3, 4, 5].map(i => (
                        <tr key={i} className="hover:bg-gray-50 transition-colors">
                          <td className="p-6 font-bold text-gray-500">March {21-i}, 2026</td>
                          <td className="p-6 font-black uppercase">Presale Purchase</td>
                          <td className="p-6 font-black text-pepe-pink">+100,000 $PWIFE</td>
                          <td className="p-6">
                            <span className="bg-pepe-green/20 text-pepe-green px-4 py-1 rounded-full text-xs font-black uppercase border-2 border-pepe-green/20">Success</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-pepe-black/60 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default DashboardPage;
