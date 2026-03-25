import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, Rocket, Info, Shield, Map, HelpCircle, ArrowRight, Download, Globe, Copy, Check, Lock, ExternalLink, Droplets, ShieldCheck, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useWallet } from '../context/WalletContext';
import { formatAddress } from '../utils/format';
import ProfitCalculator from '../components/ProfitCalculator';
import ViewModeToggle from '../components/ViewModeToggle';
import MoneyRain from '../components/MoneyRain';

// ASSET PLACEHOLDERS
const ASSETS = {
  HERO_BACKGROUND_IMAGE: '/assets/fomo-pump-bg.svg', // تم التحديث للخلفية الجديدة
  HERO_MOBILE_BG: '/assets/fomo-pump-bg.svg', // استخدام نفس الخلفية للموبايل حالياً أو صورة متوافقة
  HERO_CHARACTER_IMAGE: '/assets/hero-character.png',
  TOKENOMICS_FULL_IMAGE: '/assets/hero-character.png', // Placeholder if missing
  RISK_WARNING_BACKGROUND: '/assets/risk-bg.svg',
  NAVBAR_BACKGROUND_IMAGE: '/assets/navbar-bg.png', 
  CUSTOM_BUTTON_IMAGE_PRIMARY: '/assets/btn-primary.png',
  CUSTOM_BUTTON_IMAGE_SECONDARY: '/assets/btn-secondary.png',
  COIN_ICON: '/assets/hero-character.png', // Placeholder if missing
  WHY_BUY_BG: '/assets/risk-bg.svg',
  WHY_BUY_MOBILE_BG: '/assets/risk-bg-mobil.png',
  TOKENOMICS_BG: '/assets/hero-section.svg', 
  BUY_BOX_BG: '/assets/presel-bg.svg', // Fixed from 'Untitled design.svg'
  BUY_BOX_MOBILE_BG: '/assets/sell-mb-bg.png',
};

const Modal = ({ isOpen, onClose, title, children, headerColor = 'bg-pepe-yellow' }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-pepe-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative bg-white border-4 border-pepe-black rounded-[2.5rem] shadow-[12px_12px_0_0_rgba(10,10,10,1)] w-full max-w-4xl overflow-hidden z-10"
          >
            <div className={`p-8 border-b-4 border-pepe-black flex items-center justify-between ${headerColor}`}>
              <h3 className="text-3xl font-black text-pepe-black uppercase italic">{title}</h3>
              <button onClick={onClose} className="p-2 hover:bg-pepe-black/10 rounded-xl transition-colors">
                <X size={32} className="text-pepe-black" strokeWidth={3} />
              </button>
            </div>
            <div className="p-8 max-h-[75vh] overflow-y-auto custom-scrollbar">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const Button = ({ children, onClick, variant = 'primary', className = '' }) => {
  const asset = variant === 'primary' ? ASSETS.CUSTOM_BUTTON_IMAGE_PRIMARY : ASSETS.CUSTOM_BUTTON_IMAGE_SECONDARY;
  
  const baseStyles = "relative flex items-center justify-center font-black uppercase italic transition-all active:scale-95 group overflow-hidden";
  const variants = {
    primary: "text-pepe-black",
    secondary: "text-white",
    outline: "border-4 border-pepe-black bg-white hover:bg-gray-50 text-pepe-black",
  };

  if (variant === 'outline') {
    return (
      <button onClick={onClick} className={`${baseStyles} ${variants.outline} rounded-2xl ${className}`}>
        <span className="relative z-10 flex items-center">{children}</span>
      </button>
    );
  }

  return (
    <button onClick={onClick} className={`${baseStyles} ${variants[variant]} rounded-2xl ${className}`}>
      <div className="absolute inset-0 z-0">
        {asset === '/assets/btn-primary.png' || asset === '/assets/btn-secondary.png' ? (
          <div className={`w-full h-full ${variant === 'primary' ? 'bg-pepe-yellow' : 'bg-pepe-pink'}`} />
        ) : (
          <img src={asset} alt="Button" className="absolute inset-0 w-full h-full object-cover z-0" />
        )}
      </div>
      <span className="relative z-10 flex items-center">{children}</span>
    </button>
  );
};

const WalletButton = ({ t }) => {
  const { isConnected, address } = useWallet();
  const navigate = useNavigate();

  const connectWallet = () => {
    if (isConnected) {
      navigate('/dashboard');
      return;
    }
    navigate('/connect');
  };

  const displayAddress = isConnected ? formatAddress(address) : t('nav.wallet.connect');

  return (
    <button
      onClick={connectWallet}
      className={`
        relative group flex items-center justify-center px-6 py-3 rounded-2xl border-4 border-pepe-black 
        font-black uppercase tracking-wider transition-all active:scale-95
        ${isConnected ? 'bg-pepe-green text-pepe-black shadow-[4px_4px_0_0_#000]' : 
          'bg-pepe-yellow text-pepe-black shadow-[6px_6px_0_0_#000] hover:-translate-y-1 hover:shadow-[8px_8px_0_0_#000]'}
      `}
    >
      <span className="flex items-center space-x-2 space-x-reverse">
        {isConnected ? (
          <Check size={20} strokeWidth={3} />
        ) : (
          <Globe size={20} strokeWidth={3} />
        )}
        <span>
          {displayAddress}
        </span>
      </span>
    </button>
  );
};

const Ticker = ({ t }) => {
  const messages = [t('ticker.m1'), t('ticker.m2'), t('ticker.m3'), t('ticker.m4')];
  
  return (
    <div className="bg-pepe-yellow border-y-4 border-pepe-black py-4 overflow-hidden relative z-20 shadow-[0_4px_20px_rgba(0,0,0,0.3)]" dir="ltr">
      <div className="animate-marquee whitespace-nowrap flex flex-row">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="flex flex-row items-center">
            {messages.map((msg, idx) => (
              <span key={idx} className="text-xl md:text-2xl font-black text-pepe-black mx-6 md:mx-12 flex items-center drop-shadow-sm">
                <Rocket size={20} className="mr-2 md:mr-4 rtl:ml-2 rtl:mr-0" />
                {msg}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

const FeaturedIn = ({ t }) => {
  const platforms = ['Yahoo Finance', 'MarketWatch', 'Bloomberg', 'Cointelegraph', 'Decrypt'];
  
  return (
    <div className="bg-black border-y-4 border-pepe-black py-8 overflow-hidden relative z-20" dir="ltr">
      <div className="animate-marquee-slow whitespace-nowrap flex flex-row items-center">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="flex flex-row items-center">
            <span className="text-xl font-black uppercase tracking-[0.3em] text-white/40 mx-10">
              {t('featured.title')}
            </span>
            {platforms.map((p, idx) => (
              <span key={idx} className="text-2xl md:text-4xl font-black text-white mx-10 md:mx-20 uppercase italic tracking-tighter hover:text-pepe-yellow transition-colors cursor-default">
                {p}
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

const PartnersTicker = ({ t }) => {
  const partners = [
    { name: 'Solana', color: 'text-[#14F195]' },
    { name: 'Raydium', color: 'text-[#FF00FF]' },
    { name: 'Binance', color: 'text-[#F3BA2F]' },
    { name: 'CoinMarketCap', color: 'text-[#1098AD]' },
    { name: 'Oracle', color: 'text-[#F80000]' }
  ];
  
  return (
    <div className="bg-white border-y-4 border-pepe-black py-12 overflow-hidden relative z-20" dir="ltr">
      <div className="animate-marquee whitespace-nowrap flex flex-row items-center">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="flex flex-row items-center">
            <span className="text-2xl font-black uppercase tracking-widest text-pepe-black/30 mx-12">
              {t('partners.title')}
            </span>
            {partners.map((p, idx) => (
              <div key={idx} className="flex flex-row items-center mx-12 md:mx-20 group cursor-pointer transition-all duration-300">
                <span className={`text-3xl md:text-5xl font-black uppercase italic tracking-tighter ${p.color} group-hover:scale-110 transition-transform`}>
                  {p.name}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

const HeroSection = ({ t, openBuyModal }) => {
  return (
    <section className="relative min-h-[90vh] sm:min-h-screen flex items-center justify-center pt-28 pb-12 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <picture>
          <source media="(max-width: 1024px)" srcSet={ASSETS.HERO_MOBILE_BG} />
          <img 
            src={ASSETS.HERO_BACKGROUND_IMAGE} 
            alt="Hero BG" 
            className="section-bg-full opacity-40 grayscale-[20%]" 
            loading="eager"
          />
        </picture>
        {/* Money Rain Component */}
        <MoneyRain />
      </div>
      <div className="section-container relative z-10 w-full flex flex-col items-center justify-center text-center space-y-8 sm:space-y-12 py-0">
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8 }}
          className="max-w-[95%] md:max-w-2xl lg:max-w-3xl xl:max-w-5xl mx-auto"
        >
          {/* Floating Character Pair Animation */}
          <div className="relative mb-8 flex justify-center space-x-[-20px] scale-75 sm:scale-100">
             <motion.div
               animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
               transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
               className="relative z-10 w-32 h-32 sm:w-48 sm:h-48"
             >
                <img src="/assets/hero-character.png" alt="Pepe Male" className="w-full h-full object-contain filter drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]" />
             </motion.div>
             <motion.div
               animate={{ y: [0, -10, 0], rotate: [0, -5, 0] }}
               transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
               className="relative z-20 w-32 h-32 sm:w-48 sm:h-48 mt-8"
             >
                <img src="/assets/hero-character.png" alt="Pepe Wife" className="w-full h-full object-contain filter hue-rotate-[180deg] drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]" />
             </motion.div>
          </div>

          <span className="bg-pepe-pink text-white px-6 sm:px-8 py-2 sm:py-3 rounded-full border-4 border-pepe-black font-black uppercase tracking-widest shadow-[4px_4px_0_0_#000] sm:shadow-[6px_6px_0_0_#000] rotate-[-2deg] inline-block mb-6 sm:mb-8 text-xs sm:text-base">
            {t('hero.badge')}
          </span>
          <h1 className="text-3xl sm:text-6xl md:text-8xl lg:text-[9rem] font-black tracking-tighter leading-[1] sm:leading-[0.85] mb-8 sm:mb-12 text-pepe-black drop-shadow-[4px_4px_0px_rgba(255,255,255,1)] sm:drop-shadow-[10px_10px_0px_rgba(255,255,255,1)] uppercase italic animate-title-gradient break-words">
            {t('hero.title_meet')} {t('hero.title_pepe')}<br />
            {t('hero.title_wife')}
          </h1>
          <div className="relative inline-block mb-10 sm:mb-14 px-2 sm:px-0 max-w-2xl mx-auto">
            <p className="text-base sm:text-2xl md:text-3xl font-black text-white leading-tight bg-pepe-black border-4 border-pepe-black p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-[4px_4px_0_0_#FF69B4] sm:shadow-[8px_8px_0_0_#FF69B4] transform hover:rotate-1 transition-transform">
              {t('hero.desc')}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mt-10 px-4 sm:px-0">
            <Button variant="outline" className="w-full sm:w-auto group text-lg sm:text-2xl py-4 sm:py-6 px-6 sm:px-10 shadow-[6px_6px_0_0_#000]">
              <Download size={24} strokeWidth={3} className="mr-3 group-hover:animate-bounce" />
              {t('hero.whitepaper')}
            </Button>
            <Button 
              variant="primary" 
              onClick={openBuyModal}
              className="w-full sm:w-auto group text-lg sm:text-2xl py-4 sm:py-6 px-6 sm:px-10 shadow-[6px_6px_0_0_#000]"
            >
              {t('hero.join_presale')}
              <ArrowRight size={24} strokeWidth={3} className="ml-3 group-hover:translate-x-2 transition-transform rtl:rotate-180 rtl:group-hover:-translate-x-2" />
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const BuyBoxSection = ({ t, openModal, openBuyModal }) => {
  const [amount, setAmount] = useState('');
  return (
    <section className="py-16 sm:py-24 min-h-[700px] lg:min-h-[800px] relative overflow-hidden flex items-center">
      <div className="absolute inset-0 z-0">
        <picture>
          <source media="(max-width: 1024px)" srcSet={ASSETS.BUY_BOX_MOBILE_BG} />
          <img src={ASSETS.BUY_BOX_BG} alt="Buy Box BG" className="section-bg-full" />
        </picture>
      </div>
      <div className="section-container relative z-10 px-4 sm:px-6 w-full">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ y: 50, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} className="bg-white/95 backdrop-blur-sm p-6 sm:p-12 rounded-[2rem] sm:rounded-[2.5rem] border-4 border-pepe-black shadow-[8px_8px_0_0_#000] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 sm:w-40 sm:h-40 bg-pepe-pink opacity-10 rounded-full -mr-16 -mt-16 sm:-mr-20 sm:-mt-20" />
            <div className="text-center mb-8 sm:mb-12">
              <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black text-pepe-black mb-4 uppercase italic tracking-tight animate-title-gradient">{t('buybox.title')}</h2>
              <p className="text-gray-600 text-sm sm:text-lg lg:text-xl font-bold">{t('buybox.desc')}</p>
            </div>
            <div className="flex justify-center mb-8 sm:mb-12">
              <div className="bg-pepe-yellow/20 border-4 border-pepe-black px-4 sm:px-10 py-3 sm:py-6 rounded-2xl sm:rounded-[2rem] flex items-center space-x-3 sm:space-x-6 space-x-reverse transform rotate-1">
                <div className="w-10 h-10 sm:w-16 sm:h-16 bg-pepe-yellow rounded-xl sm:rounded-2xl border-4 border-pepe-black flex items-center justify-center text-pepe-black font-black text-lg sm:text-3xl shadow-[2px_2px_0px_0px_rgba(10,10,10,1)] sm:shadow-[4px_4px_0px_0px_rgba(10,10,10,1)]">
                  {ASSETS.COIN_ICON === '/assets/coin-icon.png' ? '$' : <img src={ASSETS.COIN_ICON} className="w-full h-full object-cover rounded-xl" />}
                </div>
                <div>
                  <div className="text-[8px] sm:text-xs text-pepe-black font-black uppercase tracking-[0.2em]">{t('buybox.current_price')}</div>
                  <div className="text-lg sm:text-3xl font-black text-pepe-black tracking-tight whitespace-nowrap">1 $PWIFE = 0.00012 USDT</div>
                </div>
              </div>
            </div>
            <div className="space-y-6 sm:space-y-8 max-w-2xl mx-auto">
              <div className="relative group">
                <input 
                  type="number" 
                  value={amount} 
                  onChange={(e) => setAmount(e.target.value)} 
                  placeholder={t('buybox.input_placeholder')} 
                  className="w-full bg-white border-4 border-pepe-black rounded-xl sm:rounded-[1.5rem] px-4 sm:px-8 py-3 sm:py-6 text-lg sm:text-2xl font-black outline-none transition-all placeholder:text-gray-400 text-center shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] sm:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[2px_2px_0px_0px_rgba(10,10,10,1)]" 
                />
              </div>
              <div className="flex flex-col space-y-4 sm:space-y-6">
                <Button 
                  variant="primary" 
                  onClick={openBuyModal}
                  className="w-full py-4 sm:py-6 text-xl sm:text-3xl shadow-[6px_6px_0_0_rgba(10,10,10,1)] sm:shadow-[8px_8px_0_0_rgba(10,10,10,1)]"
                >
                  {t('buybox.buy_now')}
                </Button>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <Button variant="secondary" className="py-3 sm:py-5 text-base sm:text-xl">
                    {t('buybox.how_to_buy')}
                  </Button>
                  <Button variant="outline" className="py-3 sm:py-5 text-base sm:text-xl" onClick={() => openModal('audit')}>
                    {t('buybox.audit')}
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const TokenomicsSection = ({ t, openModal }) => {
  const distribution = [
    { label: t('tokenomics.category_presale', 'Presale'), percentage: 40, color: 'bg-pepe-pink' },
    { label: t('tokenomics.category_liquidity', 'Liquidity'), percentage: 30, color: 'bg-pepe-green' },
    { label: t('tokenomics.category_staking', 'Staking'), percentage: 15, color: 'bg-pepe-yellow' },
    { label: t('tokenomics.category_team', 'Team'), percentage: 10, color: 'bg-pepe-black' },
    { label: t('tokenomics.category_marketing', 'Marketing'), percentage: 5, color: 'bg-white' },
  ];
  return (
    <section id="tokenomics" className="relative py-16 sm:py-24 overflow-hidden bg-white">
      <div className="section-container relative z-10 px-4 sm:px-6">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-7xl font-black uppercase italic drop-shadow-[6px_6px_0px_rgba(255,255,255,1)] text-pepe-black animate-title-gradient">{t('tokenomics.title')}</h2>
        </div>
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <div className="space-y-8">
            <div className="bg-white p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] border-4 border-pepe-black shadow-[8px_8px_0_0_rgba(10,10,10,1)] lg:shadow-[12px_12px_0px_0px_rgba(10,10,10,1)]">
              <h3 className="text-xl sm:text-3xl font-black uppercase mb-6 sm:mb-8 italic">{t('tokenomics.distribution_title', 'Token Distribution')}</h3>
              <div className="space-y-4 sm:space-y-6">
                {distribution.map((item, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between font-black uppercase italic text-xs sm:text-base">
                      <span>{item.label}</span>
                      <span>{item.percentage}%</span>
                    </div>
                    <div className="h-5 sm:h-6 w-full bg-gray-200 border-2 sm:border-4 border-pepe-black rounded-full overflow-hidden shadow-[2px_2px_0_0_rgba(10,10,10,1)] sm:shadow-[4px_4px_0_0_rgba(10,10,10,1)]">
                      <motion.div initial={{ width: 0 }} whileInView={{ width: `${item.percentage}%` }} transition={{ duration: 1, delay: idx * 0.1 }} className={`h-full ${item.color}`} />
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="primary" className="w-full mt-8 sm:mt-10 py-3 sm:py-4 text-base sm:text-xl shadow-[4px_4px_0_0_rgba(10,10,10,1)] sm:shadow-[6px_6px_0_0_rgba(10,10,10,1)]" onClick={() => openModal('tokenomics')}>
                {t('tokenomics.details_button', 'Detailed Tokenomics')}
              </Button>
            </div>
          </div>
          <div className="flex flex-col space-y-6">
            <div className="relative group overflow-hidden rounded-[2rem] border-4 border-pepe-black shadow-[8px_8px_0_0_#000]">
              <div className="relative p-0 aspect-video flex items-center justify-center overflow-hidden">
                <img src={ASSETS.HERO_CHARACTER_IMAGE} alt="Tokenomics Illustration" className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" loading="lazy" />
              </div>
            </div>
            <div className="bg-pepe-black text-white p-6 sm:p-8 rounded-[2rem] border-4 border-pepe-black shadow-[8px_8px_0_0_#FF69B4] space-y-4">
              <div className="flex items-center justify-between bg-white/10 p-3 sm:p-4 rounded-xl border-2 border-white/20">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <Flame size={20} className="text-pepe-yellow" />
                  <span className="font-black uppercase italic tracking-tight text-xs sm:text-base">{t('tokenomics.zero_tax')}</span>
                </div>
                <div className="bg-pepe-green text-pepe-black px-2 sm:px-3 py-1 rounded-full text-[10px] font-black uppercase animate-pulse">Active</div>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <div className="flex items-center space-x-2 space-x-reverse bg-white/5 p-2 sm:p-3 rounded-xl border-2 border-white/10">
                  <Lock size={14} className="text-pepe-pink" />
                  <span className="text-[9px] sm:text-xs font-bold uppercase">{t('tokenomics.liquidity_lock')}</span>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse bg-white/5 p-2 sm:p-3 rounded-xl border-2 border-white/10">
                  <ShieldCheck size={14} className="text-pepe-green" />
                  <span className="text-[9px] sm:text-xs font-bold uppercase">{t('tokenomics.team_lock')}</span>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse bg-white/5 p-2 sm:p-3 rounded-xl border-2 border-white/10">
                  <Lock size={14} className="text-pepe-yellow" />
                  <span className="text-[9px] sm:text-xs font-bold uppercase">{t('tokenomics.marketing_lock')}</span>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse bg-white/5 p-2 sm:p-3 rounded-xl border-2 border-white/10">
                  <Droplets size={14} className="text-blue-400" />
                  <span className="text-[9px] sm:text-xs font-bold uppercase">{t('tokenomics.linear_vesting')}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:gap-3 opacity-50 cursor-not-allowed grayscale">
                <div className="flex items-center space-x-2 space-x-reverse bg-white/5 p-2 sm:p-3 rounded-xl border-2 border-white/10">
                  <X size={14} className="text-red-500" />
                  <span className="text-[9px] sm:text-xs font-bold uppercase line-through">{t('tokenomics.freeze')}</span>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse bg-white/5 p-2 sm:p-3 rounded-xl border-2 border-white/10">
                  <X size={14} className="text-red-500" />
                  <span className="text-[9px] sm:text-xs font-bold uppercase line-through">{t('tokenomics.mint')}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const WhyBuySection = ({ t }) => (
  <section id="about" className="relative py-16 sm:py-32 min-h-[700px] lg:min-h-[800px] overflow-hidden flex items-center">
    <div className="absolute inset-0 z-0">
      <picture>
        <source media="(max-width: 1024px)" srcSet={ASSETS.WHY_BUY_MOBILE_BG} />
        <img src={ASSETS.WHY_BUY_BG} alt="Why Buy BG" className="section-bg-full bg-no-repeat brightness-[0.8] contrast-[1.2]" loading="lazy" />
      </picture>
    </div>
    <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px] z-[1]" />
    <div className="section-container relative z-10 px-4 sm:px-6 w-full">
      <div className="grid lg:grid-cols-2 gap-10 lg:gap-20 items-center">
        <div className="space-y-6 sm:space-y-8 text-center lg:text-left rtl:lg:text-right">
          <span className="btn-secondary py-2 px-6 rotate-[-3deg] inline-block text-xs sm:text-base">{t('whybuy.badge')}</span>
          <h2 className="text-2xl sm:text-5xl lg:text-7xl font-black uppercase italic leading-[1.1] lg:leading-[0.9] drop-shadow-[4px_4px_0px_rgba(10,10,10,1)] lg:drop-shadow-[8px_8px_0px_rgba(10,10,10,1)] animate-title-gradient">
            {t('whybuy.title_why')} <br />{t('whybuy.title_pepewife')}
          </h2>
          <p className="text-sm sm:text-2xl font-bold text-gray-800 leading-snug max-w-2xl mx-auto lg:mx-0 drop-shadow-sm">
            {t('whybuy.desc')}
          </p>
          <Button variant="primary" className="w-full sm:w-auto text-lg sm:text-2xl py-4 sm:py-6 shadow-[6px_6px_0_0_rgba(10,10,10,1)] lg:shadow-[8px_8px_0_0_rgba(10,10,10,1)]">{t('whybuy.cta')}</Button>
        </div>
        <div className="grid gap-4 sm:gap-8">
          {[1, 2, 3].map(i => (
            <motion.div key={i} initial={{ x: 50, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} className="bg-white/90 p-4 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] border-4 border-pepe-black shadow-green-custom flex items-center space-x-4 sm:space-x-8 space-x-reverse">
              <div className="w-12 h-12 sm:w-20 sm:h-20 bg-pepe-yellow rounded-xl sm:rounded-[1.5rem] border-4 border-pepe-black flex items-center justify-center shrink-0 shadow-[2px_2px_0px_0px_rgba(10,10,10,1)] sm:shadow-[4px_4px_0px_0px_rgba(10,10,10,1)]">
                {i === 1 ? <Rocket size={24} strokeWidth={3} className="sm:w-10 sm:h-10" /> : i === 2 ? <Globe size={24} strokeWidth={3} className="sm:w-10 sm:h-10" /> : <Shield size={24} strokeWidth={3} className="sm:w-10 sm:h-10" />}
              </div>
              <div className="text-right flex-1">
                <h3 className="text-lg sm:text-2xl font-black uppercase italic mb-1 sm:mb-2">{t(`whybuy.reason${i}_title`)}</h3>
                <p className="text-gray-700 font-bold text-xs sm:text-base leading-tight">{t(`whybuy.reason${i}_desc`)}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

const PepeCoupleSVG = () => (
  <div className="absolute inset-0 z-0 pointer-events-none opacity-15 flex items-center justify-around px-10 overflow-hidden">
    {/* Pepe the Frog - Sarcastic/Funny Face */}
    <div className="w-64 h-64 relative transform -rotate-12 translate-y-10 scale-125">
      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        {/* Head */}
        <path d="M30,110 Q30,40 100,40 Q170,40 170,110 Q170,180 100,180 Q30,180 30,110" fill="#4CAF50" stroke="#000" strokeWidth="5" />
        {/* Famous Big Eyes */}
        <ellipse cx="70" cy="80" rx="30" ry="35" fill="white" stroke="#000" strokeWidth="4" />
        <ellipse cx="130" cy="80" rx="30" ry="35" fill="white" stroke="#000" strokeWidth="4" />
        {/* Pupils looking slightly upward/sarcastic */}
        <circle cx="70" cy="75" r="10" fill="black" />
        <circle cx="130" cy="75" r="10" fill="black" />
        {/* Sarcastic Mouth */}
        <path d="M60,140 Q100,160 140,140" fill="none" stroke="#000" strokeWidth="5" strokeLinecap="round" />
        <path d="M50,130 Q60,135 70,130" fill="none" stroke="#000" strokeWidth="3" />
        <path d="M130,130 Q140,135 150,130" fill="none" stroke="#000" strokeWidth="3" />
        {/* Heavy Eyelids */}
        <path d="M40,75 Q70,50 100,75" fill="none" stroke="#000" strokeWidth="3" />
        <path d="M100,75 Q130,50 160,75" fill="none" stroke="#000" strokeWidth="3" />
      </svg>
    </div>

    {/* Pepe's Wife - Funny/Sarcastic Female Version */}
    <div className="w-64 h-64 relative transform rotate-12 -translate-y-10 scale-125">
      <svg viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
        {/* Head */}
        <path d="M30,110 Q30,40 100,40 Q170,40 170,110 Q170,180 100,180 Q30,180 30,110" fill="#81C784" stroke="#000" strokeWidth="5" />
        {/* Big Pink Bow */}
        <path d="M80,30 L120,30 L130,10 L70,10 Z" fill="#FF4081" stroke="#000" strokeWidth="3" />
        <circle cx="100" cy="25" r="12" fill="#FF4081" stroke="#000" strokeWidth="3" />
        {/* Big Eyes with Long Eyelashes */}
        <ellipse cx="70" cy="80" rx="30" ry="35" fill="white" stroke="#000" strokeWidth="4" />
        <ellipse cx="130" cy="80" rx="30" ry="35" fill="white" stroke="#000" strokeWidth="4" />
        <circle cx="70" cy="85" r="10" fill="black" />
        <circle cx="130" cy="85" r="10" fill="black" />
        {/* Eyelashes */}
        <path d="M40,60 L25,40" stroke="#000" strokeWidth="3" strokeLinecap="round" />
        <path d="M55,50 L45,30" stroke="#000" strokeWidth="3" strokeLinecap="round" />
        <path d="M145,50 L155,30" stroke="#000" strokeWidth="3" strokeLinecap="round" />
        <path d="M160,60 L175,40" stroke="#000" strokeWidth="3" strokeLinecap="round" />
        {/* Sarcastic/Worried Smile */}
        <path d="M75,145 Q100,130 125,145" fill="none" stroke="#000" strokeWidth="5" strokeLinecap="round" />
        {/* Blush */}
        <circle cx="50" cy="120" r="15" fill="#FF80AB" opacity="0.5" />
        <circle cx="150" cy="120" r="15" fill="#FF80AB" opacity="0.5" />
      </svg>
    </div>
  </div>
);

const RiskWarningSection = ({ t }) => (
  <section className="relative py-20 sm:py-32 overflow-hidden border-y-8 border-pepe-black bg-pepe-pink/5">
    {/* Pepe Couple Background */}
    <PepeCoupleSVG />
    
    <div className="section-container relative z-20">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} transition={{ duration: 0.6 }} className="risk-card max-w-5xl mx-auto text-center transform rotate-1 bg-white/90 backdrop-blur-sm relative group">
        <div className="absolute top-6 right-6 text-pepe-pink opacity-20 group-hover:opacity-100 transition-opacity"><Info size={40} strokeWidth={3} /></div>
        <Shield size={60} strokeWidth={3} className="sm:w-[100px] sm:h-[100px] text-pepe-pink mx-auto mb-6 sm:mb-10 animate-pulse" />
        <h2 className="text-2xl sm:text-7xl font-black uppercase italic mb-6 sm:mb-10 tracking-tight text-pepe-black drop-shadow-sm animate-title-gradient">{t('risk.title')}</h2>
        <div className="space-y-4 sm:space-y-8 text-sm sm:text-2xl font-bold text-gray-700 leading-relaxed max-w-3xl mx-auto">
          <p className="border-l-4 border-pepe-pink pl-4 sm:pl-6 rtl:border-l-0 rtl:border-r-4 rtl:pr-4 sm:pr-6 py-2 bg-pepe-pink/5 rounded-r-2xl rtl:rounded-r-none rtl:rounded-l-2xl">{t('risk.p1')}</p>
          <p className="border-l-4 border-pepe-black pl-4 sm:pl-6 rtl:border-l-0 rtl:border-r-4 rtl:pr-4 sm:pr-6 py-2 bg-gray-50 rounded-r-2xl rtl:rounded-r-none rtl:rounded-l-2xl">{t('risk.p2')}</p>
        </div>
      </motion.div>
    </div>
  </section>
);

const WhitepaperSection = ({ t, openModal }) => {
  const features = [
    { id: 1, icon: <Globe size={32} />, color: 'bg-pepe-green', title: t('whitepaper.feat1_title'), desc: t('whitepaper.feat1_desc') },
    { id: 2, icon: <Lock size={32} />, color: 'bg-pepe-yellow', title: t('whitepaper.feat2_title'), desc: t('whitepaper.feat2_desc') },
    { id: 3, icon: <Rocket size={32} />, color: 'bg-pepe-green', title: t('whitepaper.feat3_title'), desc: t('whitepaper.feat3_desc') },
  ];

  return (
    <section id="whitepaper" className="relative py-20 sm:py-32 overflow-hidden bg-pepe-black text-white border-y-8 border-pepe-black">
      {/* Technical Grid Background */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: 'linear-gradient(#39FF14 1px, transparent 1px), linear-gradient(90deg, #39FF14 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      
      <div className="section-container relative z-10 px-4 sm:px-6">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <motion.div initial={{ x: -50, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} className="space-y-8 text-center lg:text-left rtl:lg:text-right">
            <span className="bg-pepe-yellow text-pepe-black px-6 py-2 rounded-full border-4 border-pepe-black font-black uppercase tracking-widest shadow-[4px_4px_0_0_#39FF14] rotate-[-2deg] inline-block text-sm">
              {t('whitepaper.badge')}
            </span>
            <h2 className="text-3xl sm:text-6xl lg:text-7xl font-black uppercase italic leading-none text-pepe-green drop-shadow-[4px_4px_0px_rgba(255,255,255,0.1)]">
              {t('whitepaper.title')}
            </h2>
            <p className="text-base sm:text-2xl font-bold text-gray-300 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              {t('whitepaper.desc')}
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-6 pt-4 justify-center lg:justify-start">
              <Button variant="primary" className="w-full sm:w-auto px-10 py-5 text-xl shadow-[6px_6px_0_0_#fff]">
                <Download size={24} className="mr-3 rtl:ml-3 rtl:mr-0" strokeWidth={3} />
                {t('whitepaper.download_btn')}
              </Button>
              <button onClick={() => openModal('about')} className="text-pepe-yellow font-black uppercase italic border-b-4 border-pepe-yellow hover:text-white hover:border-white transition-all py-2">
                {t('whitepaper.read_online')}
              </button>
            </div>
          </motion.div>

          <div className="relative flex justify-center items-center py-10">
            {/* 3D Book Mockup Effect */}
            <motion.div 
              animate={{ rotateY: [10, -10, 10], y: [0, -15, 0] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
              className="relative w-64 h-80 sm:w-80 sm:h-[450px] preserve-3d group cursor-pointer"
            >
              {/* Book Spine */}
              <div className="absolute left-0 top-0 w-12 h-full bg-pepe-green border-4 border-pepe-black rounded-l-lg transform -translate-x-1/2 rotate-y-90 origin-right shadow-2xl z-20" />
              
              {/* Book Cover */}
              <div className="absolute inset-0 bg-pepe-yellow border-4 border-pepe-black rounded-lg shadow-2xl flex flex-col items-center justify-between p-8 sm:p-12 overflow-hidden group-hover:bg-pepe-green transition-colors duration-500">
                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, black 1px, transparent 0)', backgroundSize: '16px 16px' }} />
                <div className="w-full h-1 bg-pepe-black mb-4 opacity-20" />
                <div className="text-center relative z-10">
                  <img src={ASSETS.HERO_CHARACTER_IMAGE} alt="Logo" className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-6 sm:mb-8 object-contain drop-shadow-2xl animate-float" />
                  <h3 className="text-2xl sm:text-4xl font-black text-pepe-black uppercase italic tracking-tighter leading-none mb-2">
                    Pepe Wife
                  </h3>
                  <p className="text-xs sm:text-sm font-black text-pepe-black/60 uppercase tracking-[0.3em]">Official Document</p>
                </div>
                <div className="w-full h-1 bg-pepe-black mt-4 opacity-20" />
              </div>

              {/* Decorative elements */}
              <div className="absolute -top-10 -right-10 w-24 h-24 bg-pepe-green/20 rounded-full blur-3xl animate-pulse" />
              <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-pepe-yellow/20 rounded-full blur-3xl animate-pulse delay-700" />
            </motion.div>
          </div>
        </div>

        <div className="grid sm:grid-cols-3 gap-6 sm:gap-10 mt-20">
          {features.map((feat, idx) => (
            <motion.div 
              key={feat.id}
              initial={{ y: 50, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: idx * 0.2 }}
              className="bg-white/5 backdrop-blur-md p-8 rounded-[2rem] border-4 border-pepe-black hover:border-pepe-green transition-all group hover:-translate-y-2"
            >
              <div className={`w-16 h-16 ${feat.color} rounded-2xl border-4 border-pepe-black flex items-center justify-center mb-6 shadow-[4px_4px_0_0_#000] group-hover:scale-110 transition-transform`}>
                {feat.icon}
              </div>
              <h4 className="text-xl sm:text-2xl font-black uppercase italic mb-4 text-pepe-yellow group-hover:text-pepe-green transition-colors">{feat.title}</h4>
              <p className="text-gray-400 font-bold leading-relaxed">{feat.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Footer = ({ t }) => (
  <footer className="footer-black py-16 sm:py-24">
    <div className="section-container">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-12 sm:gap-16 mb-16 sm:mb-24 text-center md:text-left rtl:md:text-right">
        <div className="sm:col-span-2 md:col-span-1 space-y-6 sm:space-y-8">
          <div className="flex items-center justify-center md:justify-start space-x-3 space-x-reverse">
            <img src={ASSETS.HERO_CHARACTER_IMAGE} alt="PW" className="w-12 h-12 sm:w-16 sm:h-16 object-contain" loading="lazy" />
            <span className="text-3xl sm:text-4xl font-black uppercase text-white">Pepe Wife</span>
          </div>
          <p className="text-lg sm:text-xl font-bold text-white/60">{t('footer.desc')}</p>
        </div>
        {['links', 'community', 'legal'].map(cat => (
          <div key={cat}>
            <h4 className="text-xl sm:text-2xl font-black uppercase italic text-pepe-pink mb-6 sm:mb-10 drop-shadow-[2px_2px_0px_rgba(255,255,255,0.1)]">{t(`footer.${cat}_title`)}</h4>
            <ul className="space-y-4 sm:space-y-6 text-base sm:text-lg font-black uppercase text-white/80">
              {cat === 'links' ? ['presale', 'tokenomics', 'roadmap', 'whitepaper'].map(l => <li key={l}><a href={`#${l === 'presale' ? '' : l}`} className="hover:text-pepe-green transition-all hover:translate-x-1 inline-block">{t(`nav.${l}` === 'nav.presale' ? 'nav.home' : `nav.${l}`)}</a></li>) :
               cat === 'community' ? ['Twitter (X)', 'Telegram', 'Instagram', 'Discord'].map(l => <li key={l}><a href="#" className="hover:text-pepe-green transition-all hover:translate-x-1 inline-block">{l}</a></li>) :
               ['Terms', 'Privacy', 'Risk'].map(l => <li key={l}><a href="#" className="hover:text-pepe-green transition-all hover:translate-x-1 inline-block">{l}</a></li>)}
            </ul>
          </div>
        ))}
      </div>
      <div className="pt-12 sm:pt-16 border-t-4 border-white/10 flex flex-col md:flex-row justify-between items-center gap-6 sm:gap-8 opacity-60">
        <p className="text-xs sm:text-sm font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-white text-center">{t('footer.rights')}</p>
        <p className="text-xs sm:text-sm font-black uppercase tracking-[0.2em] sm:tracking-[0.3em] text-white text-center">{t('footer.built_with')}</p>
      </div>
    </div>
  </footer>
);

const Navbar = ({ isOpen, setIsOpen, changeLanguage, t, currentLng, openModal }) => {
  return (
    <nav className="fixed top-2 sm:top-4 left-2 sm:left-4 right-2 sm:right-4 z-50 rounded-2xl sm:rounded-[2rem] border-4 border-pepe-black shadow-[0_4px_0_0_rgba(10,10,10,1)] sm:shadow-[0_8px_0_0_rgba(10,10,10,1)] overflow-hidden h-16 sm:h-20 bg-white">
      <div className="absolute inset-0 z-0">
        {ASSETS.NAVBAR_BACKGROUND_IMAGE === '/assets/navbar-bg.png' ? <div className="w-full h-full bg-white" /> : <img src={ASSETS.NAVBAR_BACKGROUND_IMAGE} alt="Nav BG" className="w-full h-full object-cover" />}
      </div>
      <div className="relative z-10 h-full px-3 sm:px-8 flex items-center justify-between">
        <div className="flex items-center space-x-2 sm:space-x-3 space-x-reverse cursor-pointer group shrink-0" onClick={() => openModal('home')}>
          <div className="flex items-center space-x-2 space-x-reverse group-hover:scale-105 transition-transform">
            <img src={ASSETS.HERO_CHARACTER_IMAGE} alt="PW" className="w-8 h-8 sm:w-12 sm:h-12 object-contain" />
            <div className="flex flex-col justify-center">
              <span className="text-sm sm:text-xl font-black uppercase leading-none bg-gradient-to-r from-pepe-green to-gray-400 bg-clip-text text-transparent animate-gradient-text">
                Pepe Wife
              </span>
              <span className="text-[8px] sm:text-[10px] font-black uppercase tracking-widest bg-gradient-to-r from-pepe-green to-gray-400 bg-clip-text text-transparent animate-gradient-text">
                $PWIFE
              </span>
            </div>
          </div>
        </div>

        <div className="hidden lg:flex items-center space-x-4 xl:space-x-6 space-x-reverse">
          {[{ id: 'home', label: t('nav.home') }, { id: 'about', label: t('nav.about') }, { id: 'tokenomics', label: t('nav.tokenomics') }, { id: 'roadmap', label: t('nav.roadmap') }, { id: 'faq', label: t('nav.faq') }].map((item) => (
            <button key={item.id} onClick={() => openModal(item.id)} className="text-pepe-black font-black uppercase tracking-tight hover:text-pepe-pink transition-all hover:-translate-y-1 text-sm xl:text-base">{item.label}</button>
          ))}
          <button onClick={() => openModal('contract')} className="text-pepe-black font-black uppercase tracking-tight hover:text-pepe-pink transition-all hover:-translate-y-1 text-sm xl:text-base">{t('nav.contract')}</button>
        </div>

        <div className="flex items-center space-x-2 md:space-x-4 space-x-reverse shrink-0">
          <div className="hidden sm:flex bg-pepe-black/10 p-1 rounded-xl border-2 border-pepe-black/20">
            {['en', 'ar', 'fr'].map((lang) => <button key={lang} onClick={() => changeLanguage(lang)} className={`px-2 md:px-3 py-1 rounded-lg text-[10px] md:text-xs font-black uppercase transition-all ${currentLng === lang ? 'bg-pepe-pink text-white shadow-md' : 'text-pepe-black/60 hover:text-pepe-black'}`}>{lang}</button>)}
          </div>
          <div className="hidden md:block">
            <WalletButton t={t} />
          </div>
          <button onClick={() => setIsOpen(!isOpen)} className="lg:hidden p-1.5 sm:p-2 hover:bg-pepe-black/5 rounded-xl transition-colors border-4 border-pepe-black">
            {isOpen ? <X size={20} strokeWidth={3} /> : <Menu size={20} strokeWidth={3} />}
          </button>
        </div>
      </div>
    </nav>
  );
};

const BuyModal = ({ isOpen, onClose, t }) => {
  const [amount, setAmount] = useState('');
  const [currency, setSolCurrency] = useState('SOL');
  const [isLoading, setIsLoading] = useState(false);
  const { isConnected, sendTransaction, address } = useWallet();
  const navigate = useNavigate();

  const handleBuy = async () => {
    if (!isConnected) {
      navigate('/connect');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }

    setIsLoading(true);
    try {
      // For demonstration, we'll use a placeholder address
      const treasuryAddress = '0x1234567890abcdef1234567890abcdef12345678';
      const tx = await sendTransaction(treasuryAddress, amount, currency);
      console.log('Transaction success:', tx);
      alert('Transaction successful! Your $PWIFE tokens will be sent shortly.');
      onClose();
    } catch (error) {
      if (error.message === 'USER_REJECTED') {
        alert('Transaction cancelled by user.');
      } else if (error.message.includes('Invalid')) {
        alert(error.message);
      } else {
        console.error('Transaction error:', error);
        alert('Transaction failed. Please ensure you have enough balance and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('hero.join_presale')} headerColor="bg-pepe-green">
      <div className="space-y-6 sm:space-y-8">
        <div className="text-center space-y-2 sm:space-y-4">
          <h4 className="text-xl sm:text-3xl font-black uppercase italic animate-title-gradient">Phase 1 is Live!</h4>
          <p className="text-base sm:text-xl font-bold text-gray-600">1 $PWIFE = 0.00012 USDT</p>
        </div>

        <div className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <button 
              onClick={() => setSolCurrency('SOL')}
              className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border-4 border-pepe-black font-black uppercase italic transition-all text-sm sm:text-base ${currency === 'SOL' ? 'bg-pepe-yellow shadow-[4px_4px_0_0_#000]' : 'bg-gray-100'}`}
            >
              Pay with SOL
            </button>
            <button 
              onClick={() => setSolCurrency('USDT')}
              className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border-4 border-pepe-black font-black uppercase italic transition-all text-sm sm:text-base ${currency === 'USDT' ? 'bg-pepe-yellow shadow-[4px_4px_0_0_#000]' : 'bg-gray-100'}`}
            >
              Pay with USDT
            </button>
          </div>

          <div className="relative">
            <input 
              type="number" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={t('buybox.input_placeholder')}
              className="w-full bg-white border-4 border-pepe-black rounded-xl sm:rounded-2xl p-4 sm:p-6 text-xl sm:text-2xl font-black outline-none shadow-[4px_4px_0_0_#000] sm:shadow-[6px_6px_0_0_#000]"
            />
            <span className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 font-black text-pepe-pink text-sm sm:text-base">{currency}</span>
          </div>

          <div className="bg-pepe-black text-white p-4 sm:p-6 rounded-xl sm:rounded-2xl border-4 border-pepe-black flex justify-between items-center">
            <span className="font-black uppercase text-xs sm:text-base">You will get:</span>
            <span className="text-lg sm:text-2xl font-black text-pepe-yellow">{amount ? (amount * 8333).toLocaleString() : '0'} $PWIFE</span>
          </div>

          <button 
            onClick={handleBuy}
            disabled={isLoading}
            className={`w-full bg-pepe-green text-pepe-black border-4 border-pepe-black py-4 sm:py-6 rounded-xl sm:rounded-2xl text-xl sm:text-2xl font-black uppercase italic shadow-[6px_6px_0_0_#000] sm:shadow-[8px_8px_0_0_#000] hover:translate-y-1 transition-all ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoading ? 'Processing...' : t('buybox.buy_now')}
          </button>
        </div>

        <div className="flex items-center justify-center gap-2 opacity-60">
          <Shield size={16} className="text-pepe-green" />
          <span className="text-[10px] sm:text-xs font-black uppercase">Secure Transaction by Smart Contract</span>
        </div>
      </div>
    </Modal>
  );
};

const LandingPage = () => {
  console.log("LandingPage: Component rendering...");
  const { t, i18n } = useTranslation();
  console.log("LandingPage: t is ready, language:", i18n.language);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const isRTL = i18n.language === 'ar';
  console.log("LandingPage: isRTL is", isRTL);

  useEffect(() => {
    document.body.dir = isRTL ? 'rtl' : 'ltr';
  }, [isRTL]);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setIsMobileMenuOpen(false);
  };

  const copyAddress = () => {
    navigator.clipboard.writeText('0x1234567890abcdef1234567890abcdef12345678');
  };

  return (
    <div className={`min-h-screen bg-white text-pepe-black selection:bg-pepe-pink selection:text-white ${isRTL ? 'rtl' : 'ltr'}`}>
      <Navbar isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} changeLanguage={changeLanguage} t={t} currentLng={i18n.language} openModal={setActiveModal} />
      
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="fixed inset-0 z-[60] bg-pepe-yellow flex flex-col items-center justify-center p-10 space-y-10">
            <button className="absolute top-10 right-10 text-pepe-black hover:scale-110 transition-transform" onClick={() => setIsMobileMenuOpen(false)}><X size={48} strokeWidth={3} /></button>
            <nav className="flex flex-col items-center space-y-6">
              {[{ id: 'home', label: t('nav.home') }, { id: 'about', label: t('nav.about') }, { id: 'tokenomics', label: t('nav.tokenomics') }, { id: 'roadmap', label: t('nav.roadmap') }, { id: 'faq', label: t('nav.faq') }].map((item) => (
                <button key={item.id} className="text-3xl font-black uppercase hover:text-pepe-pink transition-colors" onClick={() => { setActiveModal(item.id); setIsMobileMenuOpen(false); }}>{item.label}</button>
              ))}
            </nav>
            <div className="flex flex-col space-y-4 w-full px-12">
              <WalletButton t={t} openModal={setActiveModal} />
            </div>
            <div className="flex space-x-4 space-x-reverse">
              {['en', 'ar', 'fr'].map((lang) => <button key={lang} onClick={() => changeLanguage(lang)} className={`px-4 py-2 rounded-xl font-black uppercase border-2 border-pepe-black ${i18n.language === lang ? 'bg-pepe-pink text-white' : 'bg-white'}`}>{lang}</button>)}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main>
        <HeroSection t={t} openBuyModal={() => setIsBuyModalOpen(true)} />
        <Ticker t={t} />
        <BuyBoxSection t={t} openModal={setActiveModal} openBuyModal={() => setIsBuyModalOpen(true)} />
        <FeaturedIn t={t} />
        <TokenomicsSection t={t} openModal={setActiveModal} />
        <WhyBuySection t={t} />
        <PartnersTicker t={t} />
        <WhitepaperSection t={t} openModal={setActiveModal} />
        <RiskWarningSection t={t} />
      </main>

      {/* BUY MODAL */}
      <BuyModal isOpen={isBuyModalOpen} onClose={() => setIsBuyModalOpen(false)} t={t} />

      {/* MODALS */}
      <Modal isOpen={activeModal === 'home'} onClose={() => setActiveModal(null)} title={t('nav.home')} headerColor="bg-pepe-yellow">
        <div className="text-center space-y-8 py-10">
          <motion.div animate={{ rotate: [0, 5, -5, 0] }} transition={{ duration: 4, repeat: Infinity }} className="w-48 h-48 mx-auto"><img src={ASSETS.HERO_CHARACTER_IMAGE} alt="Welcome" className="w-full h-full object-contain" /></motion.div>
          <div className="space-y-4">
            <h4 className="text-4xl font-black uppercase italic animate-title-gradient">{t('hero.title_meet')} {t('hero.title_pepe')} {t('hero.title_wife')}</h4>
            <p className="text-2xl font-bold text-gray-700 leading-relaxed max-w-2xl mx-auto">{t('hero.desc')}</p>
          </div>
          <div className="flex justify-center gap-4 pt-6"><Button variant="primary" className="px-10 py-4 text-xl shadow-[6px_6px_0_0_#000]" onClick={() => setActiveModal(null)}>{t('hero.join_presale')}</Button></div>
        </div>
      </Modal>

      <Modal isOpen={activeModal === 'contract'} onClose={() => setActiveModal(null)} title={t('contract.title')} headerColor="bg-pepe-yellow">
        <div className="space-y-8">
          <div className="bg-pepe-yellow/10 border-4 border-pepe-black rounded-[2rem] p-8 text-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-pepe-yellow opacity-10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
            <h4 className="text-xl font-black mb-4 uppercase text-gray-500">{t('contract.copy_address')}</h4>
            <div className="flex items-center justify-between bg-white border-4 border-pepe-black rounded-2xl p-4 shadow-[6px_6px_0_0_rgba(10,10,10,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
              <code className="text-lg font-black truncate mr-4">0x1234...5678</code>
              <button onClick={copyAddress} className="p-3 bg-pepe-pink text-white rounded-xl hover:scale-110 transition-transform"><Copy size={24} strokeWidth={3} /></button>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-pepe-pink/5 border-4 border-pepe-black rounded-[2rem] p-6 text-center shadow-[8px_8px_0_0_rgba(10,10,10,1)] hover:-translate-y-1 transition-all"><Lock className="mx-auto mb-4 text-pepe-pink" size={40} strokeWidth={3} /><h5 className="text-lg font-black uppercase mb-1">{t('contract.locked_liquidity')}</h5><p className="text-2xl font-black text-pepe-pink italic">{t('contract.duration')}</p></div>
            <div className="bg-pepe-green/5 border-4 border-pepe-black rounded-[2rem] p-6 text-center shadow-[8px_8px_0_0_rgba(10,10,10,1)] hover:-translate-y-1 transition-all"><Shield className="mx-auto mb-4 text-pepe-green" size={40} strokeWidth={3} /><h5 className="text-lg font-black uppercase mb-1">{t('contract.locked_team')}</h5><p className="text-2xl font-black text-pepe-green italic">{t('contract.duration')}</p></div>
          </div>
        </div>
      </Modal>

      <Modal isOpen={activeModal === 'audit'} onClose={() => setActiveModal(null)} title={t('audit.title')} headerColor="bg-pepe-yellow">
        <div className="text-center space-y-8">
          <div className="w-32 h-32 bg-pepe-green rounded-full border-4 border-pepe-black flex items-center justify-center mx-auto shadow-[8px_8px_0_0_rgba(10,10,10,1)]"><Shield size={60} strokeWidth={3} className="text-white" /></div>
          <div className="space-y-4"><span className="bg-pepe-green text-white px-6 py-2 rounded-full font-black uppercase text-sm border-2 border-pepe-black">{t('audit.status')}</span><p className="text-xl font-bold text-gray-700 leading-relaxed">{t('audit.desc')}</p></div>
          <Button variant="primary" className="w-full py-6 text-2xl group shadow-[8px_8px_0_0_rgba(10,10,10,1)]">{t('audit.button')}<ExternalLink className="ml-3 group-hover:rotate-12 transition-transform" size={24} strokeWidth={3} /></Button>
        </div>
      </Modal>

      <Modal isOpen={activeModal === 'tokenomics'} onClose={() => setActiveModal(null)} title={t('tokenomics.distribution_title', 'Detailed Tokenomics')} headerColor="bg-pepe-green">
        <div className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
            <div className="relative rounded-3xl border-4 border-pepe-black overflow-hidden shadow-[8px_8px_0_0_#000]"><img src={ASSETS.HERO_CHARACTER_IMAGE} alt="Tokenomics" className="w-full h-full object-cover" /></div>
            <div className="space-y-6"><h4 className="text-3xl font-black uppercase italic text-pepe-green">{t('tokenomics.title')}</h4><p className="text-lg font-bold text-gray-700 leading-relaxed">{t('tokenomics.desc_detailed', 'Pepe Wife features a sustainable economic model designed for long-term growth and community rewards. Our zero-tax policy ensures maximum efficiency for traders.')}</p><div className="grid grid-cols-2 gap-4"><div className="bg-gray-50 p-4 rounded-2xl border-2 border-pepe-black/10"><div className="text-xs font-black text-gray-400 uppercase">{t('tokenomics.zero_tax')}</div><div className="text-xl font-black text-pepe-green">0% BUY / 0% SELL</div></div><div className="bg-gray-50 p-4 rounded-2xl border-2 border-pepe-black/10"><div className="text-xs font-black text-gray-400 uppercase">{t('tokenomics.total_supply_label', 'Total Supply')}</div><div className="text-xl font-black text-pepe-pink">1 BILLION</div></div></div></div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left rtl:text-right border-collapse">
              <thead><tr className="bg-pepe-green/20"><th className="p-4 border-4 border-pepe-black font-black uppercase italic">{t('tokenomics.table_header_category', 'Category')}</th><th className="p-4 border-4 border-pepe-black font-black uppercase italic">{t('tokenomics.table_header_percentage', 'Percentage')}</th><th className="p-4 border-4 border-pepe-black font-black uppercase italic">{t('tokenomics.table_header_amount', 'Amount')}</th></tr></thead>
              <tbody>{[{ cat: t('tokenomics.category_presale', 'Presale'), pct: '40%', amt: '400,000,000' }, { cat: t('tokenomics.category_liquidity', 'Liquidity'), pct: '30%', amt: '300,000,000' }, { cat: t('tokenomics.category_staking', 'Staking'), pct: '15%', amt: '150,000,000' }, { cat: t('tokenomics.category_team', 'Team'), pct: '10%', amt: '100,000,000' }, { cat: t('tokenomics.category_marketing', 'Marketing'), pct: '5%', amt: '50,000,000' }].map((row, i) => (<tr key={i} className="border-4 border-pepe-black font-bold"><td className="p-4 border-4 border-pepe-black uppercase">{row.cat}</td><td className="p-4 border-4 border-pepe-black text-pepe-pink">{row.pct}</td><td className="p-4 border-4 border-pepe-black">{row.amt}</td></tr>))}</tbody>
            </table>
          </div>
          <div className="text-center text-xl font-black uppercase italic py-4 bg-pepe-yellow/10 border-4 border-pepe-black rounded-2xl shadow-[4px_4px_0_0_#000]">{t('tokenomics.total_supply', 'Total Supply: 1,000,000,000 $PWIFE')}</div>
        </div>
      </Modal>

      <Modal isOpen={activeModal === 'roadmap'} onClose={() => setActiveModal(null)} title={t('roadmap.title_roadmap')} headerColor="bg-pepe-pink">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">{[1, 2, 3, 4].map(phase => (<div key={phase} className="bg-white p-8 rounded-[2rem] border-4 border-pepe-black shadow-[8px_8px_0_0_#000] hover:shadow-[12px_12px_0_0_#000] transition-all hover:-translate-y-1"><div className="w-12 h-12 bg-pepe-pink rounded-xl border-4 border-pepe-black flex items-center justify-center text-white font-black text-xl mb-6 shadow-[4px_4px_0_0_#000]">{phase}</div><h3 className="text-2xl font-black uppercase italic mb-6 text-pepe-black">{t(`roadmap.phase${phase}_title`)}</h3><ul className="space-y-4">{[1, 2, 3, 4].map(item => (<li key={item} className="flex items-start space-x-3 space-x-reverse group"><div className="mt-1.5 w-3 h-3 bg-pepe-green rounded-full border-2 border-pepe-black shrink-0 group-hover:scale-125 transition-transform" /><span className="text-gray-700 font-bold text-base leading-tight">{t(`roadmap.phase${phase}_item${item}`)}</span></li>))}</ul></div>))}</div>
      </Modal>

      <Modal isOpen={activeModal === 'faq'} onClose={() => setActiveModal(null)} title={t('nav.faq')} headerColor="bg-pepe-yellow">
        <div className="space-y-6">{[1, 2, 3, 4].map((i) => (<div key={i} className="bg-white rounded-[2rem] border-4 border-pepe-black shadow-[6px_6px_0_0_#000] p-8"><h4 className="text-2xl font-black uppercase italic text-pepe-black mb-4">{t(`faq.q${i}`)}</h4><p className="text-gray-700 font-bold text-lg leading-relaxed border-t-4 border-pepe-black/5 pt-4">{t(`faq.a${i}`)}</p></div>))}</div>
      </Modal>

      <Modal isOpen={activeModal === 'about'} onClose={() => setActiveModal(null)} title={t('nav.about')} headerColor="bg-pepe-yellow">
        <div className="space-y-10">
          <div className="text-center space-y-6"><h4 className="text-4xl font-black uppercase italic animate-title-gradient">{t('whybuy.title_why')} {t('whybuy.title_pepewife')}</h4><p className="text-xl font-bold text-gray-700 leading-relaxed max-w-3xl mx-auto">{t('whybuy.desc')}</p></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">{[1, 2, 3].map(i => (<div key={i} className="bg-white p-8 rounded-[2rem] border-4 border-pepe-black shadow-[8px_8px_0_0_#000] text-center space-y-4"><div className="w-16 h-16 bg-pepe-yellow rounded-2xl border-4 border-pepe-black flex items-center justify-center mx-auto shadow-[4px_4px_0_0_#000]">{i === 1 ? <Rocket size={32} /> : i === 2 ? <Globe size={32} /> : <Shield size={32} />}</div><h5 className="text-xl font-black uppercase italic">{t(`whybuy.reason${i}_title`)}</h5><p className="text-sm font-bold text-gray-600">{t(`whybuy.reason${i}_desc`)}</p></div>))}</div>
        </div>
      </Modal>

      <Footer t={t} />
      <ViewModeToggle />
    </div>
  );
};

export default LandingPage;
