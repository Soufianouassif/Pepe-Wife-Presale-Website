import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  ShieldCheck, Users, TrendingUp, Wallet, 
  Settings, Lock, Unlock, ArrowRight,
  Database, Activity, BarChart3, AlertTriangle,
  Search, Download, Save, RefreshCw
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import BrandLogo from '../components/BrandLogo';

const AdminPage = () => {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const [activeTab, setActiveTab] = useState('overview');

  const stats = [
    { label: t('admin.stats.total_raised'), value: '4,250 SOL', icon: <TrendingUp className="text-pepe-green" />, trend: '+12.5%' },
    { label: t('admin.stats.total_participants'), value: '1,842', icon: <Users className="text-pepe-yellow" />, trend: t('admin.stats.trend_today') },
    { label: t('admin.stats.token_supply_sold'), value: '45.2%', icon: <Activity className="text-pepe-pink" />, trend: t('admin.stats.trend_phase_1') },
    { label: t('admin.stats.vault_balance'), value: '1,120 SOL', icon: <Wallet className="text-blue-400" />, trend: t('admin.stats.trend_secured') },
  ];

  const sidebarItems = [
    { id: 'overview', label: t('admin.sidebar.dashboard'), icon: <BarChart3 size={20} /> },
    { id: 'presale', label: t('admin.sidebar.presale_settings'), icon: <Settings size={20} /> },
    { id: 'whitelist', label: t('admin.sidebar.whitelist_management'), icon: <Users size={20} /> },
    { id: 'security', label: t('admin.sidebar.security_access'), icon: <Lock size={20} /> },
    { id: 'logs', label: t('admin.sidebar.system_logs'), icon: <Database size={20} /> },
  ];

  return (
    <div className={`min-h-screen bg-[#F1F5F9] flex ${isRTL ? 'rtl' : 'ltr'}`}>
      {/* Admin Sidebar */}
      <aside className="w-72 bg-pepe-black text-white p-8 flex flex-col space-y-10 border-r-8 border-pepe-black">
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="w-10 h-10 bg-pepe-yellow rounded-xl flex items-center justify-center border-2 border-white shadow-[4px_4px_0_0_#FF69B4]">
            <ShieldCheck size={24} className="text-pepe-black" strokeWidth={3} />
          </div>
          <BrandLogo size="sm" nameClassName="text-white" symbolClassName="text-white/80" />
        </div>

        <nav className="flex-1 space-y-2">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`
                w-full flex items-center gap-4 p-4 rounded-2xl transition-all
                ${activeTab === item.id 
                  ? 'bg-pepe-yellow text-pepe-black shadow-[6px_6px_0_0_#FF69B4]' 
                  : 'text-gray-400 hover:bg-white/5'}
              `}
            >
              {item.icon}
              <span className="font-black uppercase italic text-sm">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="bg-white/5 p-6 rounded-3xl border-2 border-white/10 space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-pepe-green rounded-full animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">{t('admin.node_status_online')}</span>
          </div>
          <button className="w-full bg-red-500/20 text-red-500 py-2 rounded-xl text-[10px] font-black uppercase border border-red-500/20 hover:bg-red-500 hover:text-white transition-all">
            {t('admin.emergency_stop')}
          </button>
        </div>
      </aside>

      {/* Admin Content */}
      <main className="flex-1 p-10 overflow-y-auto custom-scrollbar">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h2 className="text-4xl font-black uppercase italic text-pepe-black">{t('admin.header.presale_management')}</h2>
            <p className="text-gray-400 font-bold">{t('admin.header.control_center')}</p>
          </div>
          <div className="flex gap-4">
            <button className="p-4 bg-white border-4 border-pepe-black rounded-2xl shadow-[6px_6px_0_0_#000] hover:translate-y-1 transition-all">
              <RefreshCw size={24} />
            </button>
            <button className="flex items-center gap-3 bg-pepe-black text-white px-8 py-4 rounded-2xl font-black uppercase italic shadow-[6px_6px_0_0_#FF69B4] hover:translate-y-1 transition-all">
              <Save size={20} />
              {t('admin.publish_changes')}
            </button>
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white p-8 rounded-[2.5rem] border-4 border-pepe-black shadow-[10px_10px_0_0_#000] space-y-4"
            >
              <div className="flex justify-between items-start">
                <div className="w-12 h-12 bg-gray-50 rounded-2xl border-2 border-pepe-black/5 flex items-center justify-center">
                  {stat.icon}
                </div>
                <span className="text-xs font-black text-pepe-green">{stat.trend}</span>
              </div>
              <div>
                <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em]">{stat.label}</p>
                <p className="text-3xl font-black italic text-pepe-black">{stat.value}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Main Management Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Phase Management */}
          <div className="lg:col-span-2 bg-white border-4 border-pepe-black rounded-[3.5rem] p-10 shadow-[15px_15px_0_0_#000] space-y-10">
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-black uppercase italic">{t('admin.phase.active_seed_round')}</h3>
              <span className="bg-pepe-green text-pepe-black px-6 py-2 rounded-full font-black uppercase text-xs">{t('admin.phase.running')}</span>
            </div>

            <div className="grid grid-cols-2 gap-8">
              <div className="space-y-4">
                <label className="text-xs font-black uppercase text-gray-400 ml-2">{t('admin.phase.token_price_sol')}</label>
                <input type="number" defaultValue="0.00000005" className="w-full border-4 border-pepe-black p-5 rounded-2xl font-black outline-none focus:ring-4 ring-pepe-yellow/20" />
              </div>
              <div className="space-y-4">
                <label className="text-xs font-black uppercase text-gray-400 ml-2">{t('admin.phase.hard_cap_sol')}</label>
                <input type="number" defaultValue="10000" className="w-full border-4 border-pepe-black p-5 rounded-2xl font-black outline-none focus:ring-4 ring-pepe-yellow/20" />
              </div>
              <div className="space-y-4">
                <label className="text-xs font-black uppercase text-gray-400 ml-2">{t('admin.phase.start_date')}</label>
                <input type="date" defaultValue="2026-03-20" className="w-full border-4 border-pepe-black p-5 rounded-2xl font-black outline-none" />
              </div>
              <div className="space-y-4">
                <label className="text-xs font-black uppercase text-gray-400 ml-2">{t('admin.phase.end_date')}</label>
                <input type="date" defaultValue="2026-04-20" className="w-full border-4 border-pepe-black p-5 rounded-2xl font-black outline-none" />
              </div>
            </div>

            <div className="bg-pepe-pink/5 border-4 border-pepe-pink/20 p-8 rounded-[2.5rem] flex items-center justify-between gap-10">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 bg-pepe-pink rounded-3xl flex items-center justify-center shadow-[6px_6px_0_0_#000]">
                  <Unlock size={32} className="text-white" />
                </div>
                <div>
                  <h4 className="text-xl font-black uppercase italic">{t('admin.vesting.title')}</h4>
                  <p className="text-sm font-bold text-gray-500 leading-none">{t('admin.vesting.desc')}</p>
                </div>
              </div>
              <button className="bg-pepe-black text-white px-8 py-4 rounded-2xl font-black uppercase italic text-sm shadow-[4px_4px_0_0_#FF69B4]">
                {t('admin.vesting.configure')}
              </button>
            </div>
          </div>

          {/* Quick Actions / Security */}
          <div className="space-y-10">
            <div className="bg-pepe-black text-white p-10 rounded-[3.5rem] border-4 border-pepe-black shadow-[15px_15px_0_0_#FF69B4] space-y-8">
              <h3 className="text-2xl font-black uppercase italic text-pepe-yellow">{t('admin.security_checks.title')}</h3>
              <div className="space-y-4">
                {[
                  { label: t('admin.security_checks.multisig_check'), status: t('admin.security_checks.passed') },
                  { label: t('admin.security_checks.contract_audit'), status: t('admin.security_checks.verified') },
                  { label: t('admin.security_checks.liquidity_lock'), status: t('admin.security_checks.active') },
                ].map((check, i) => (
                  <div key={i} className="flex justify-between items-center p-4 bg-white/5 rounded-2xl border-2 border-white/10">
                    <span className="font-black uppercase text-xs text-gray-400">{check.label}</span>
                    <span className="text-pepe-green font-black text-xs uppercase italic">{check.status}</span>
                  </div>
                ))}
              </div>
              <button className="w-full bg-white text-pepe-black border-4 border-pepe-black py-4 rounded-2xl font-black uppercase italic shadow-[6px_6px_0_0_#000]">
                {t('admin.security_checks.run_audit')}
              </button>
            </div>

            <div className="bg-pepe-yellow p-10 rounded-[3.5rem] border-4 border-pepe-black shadow-[15px_15px_0_0_#000] space-y-6">
              <div className="flex items-center gap-4">
                <AlertTriangle className="text-red-500" size={32} />
                <h3 className="text-2xl font-black uppercase italic leading-none text-pepe-black">{t('admin.risk_control.title')}</h3>
              </div>
              <p className="text-xs font-bold text-pepe-black/60 leading-relaxed">
                {t('admin.risk_control.desc')}
              </p>
              <div className="space-y-3">
                <button className="w-full bg-pepe-black text-white py-4 rounded-2xl font-black uppercase italic text-xs shadow-[4px_4px_0_0_#fff]">
                  {t('admin.risk_control.pause_presale')}
                </button>
                <button className="w-full bg-white border-4 border-pepe-black py-4 rounded-2xl font-black uppercase italic text-xs shadow-[4px_4px_0_0_#000]">
                  {t('admin.risk_control.withdraw_multisig')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminPage;
