import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, Rocket, Info, Shield, Map, HelpCircle, ArrowRight, Download, Globe, Copy, Check, Lock, ExternalLink, Droplets, ShieldCheck, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useWallet } from '../context/WalletContext';
import ProfitCalculator from '../components/ProfitCalculator';

// ASSET PLACEHOLDERS
const ASSETS = {
  HERO_BACKGROUND_IMAGE: '/assets/hero-section.svg',
  HERO_MOBILE_BG: '/assets/her-sectionmb-bg.svg',
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
          {isConnected ? address : t('nav.wallet.connect')}
        </span>
      </span>
    </button>
  );
};

const Ticker = ({ t }) => {
  const messages = [t('ticker.m1'), t('ticker.m2'), t('ticker.m3'), t('ticker.m4')];
  return (
    <div className="animate-gradient-bg border-y-4 border-pepe-black py-4 overflow-hidden relative z-20 shadow-[0_4px_20px_rgba(0,0,0,0.3)]" dir="ltr">
      <div className="animate-marquee whitespace-nowrap">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="flex items-center">
            {messages.map((msg, idx) => (
              <span key={idx} className="text-xl md:text-2xl font-black text-pepe-black mx-6 md:mx-12 flex items-center drop-shadow-sm">
                <Rocket size={20} className="mr-2 md:mr-4" />
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
      <div className="animate-marquee-slow whitespace-nowrap flex items-center">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="flex items-center">
            <span className="text-xl font-black uppercase tracking-[0.3em] text-white/40 mx-10">{t('featured.title')}</span>
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
      <div className="animate-marquee whitespace-nowrap flex items-center">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="flex items-center">
            <span className="text-2xl font-black uppercase tracking-widest text-pepe-black/30 mx-12">{t('partners.title')}</span>
            {partners.map((p, idx) => (
              <div key={idx} className="flex items-center mx-12 md:mx-20 group cursor-pointer transition-all duration-300">
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

const HeroSection = ({ t }) => {
  return (
    <section className="relative min-h-screen flex items-center justify-center pt-20 pb-10 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <picture>
          <source media="(max-width: 1024px)" srcSet={ASSETS.HERO_MOBILE_BG} />
          <img src={ASSETS.HERO_BACKGROUND_IMAGE} alt="Hero BG" className="w-full h-full object-cover lg:object-fill object-center" />
        </picture>
      </div>
      <div className="section-container relative z-10 w-full flex flex-col items-center justify-center text-center space-y-10">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
          <span className="bg-pepe-pink text-white px-8 py-3 rounded-full border-4 border-pepe-black font-black uppercase tracking-widest shadow-[6px_6px_0_0_#000] rotate-[-2deg] inline-block mb-8">
            {t('hero.badge')}
          </span>
          <h1 className="text-5xl sm:text-7xl md:text-[10rem] font-black tracking-tighter leading-[1] sm:leading-[0.8] mb-10 text-pepe-black drop-shadow-[6px_6px_0px_rgba(255,255,255,1)] sm:drop-shadow-[10px_10px_0px_rgba(255,255,255,1)] uppercase italic animate-title-gradient">
            {t('hero.title_meet')} {t('hero.title_pepe')}<br />
            {t('hero.title_wife')}
          </h1>
          <div className="relative inline-block mb-12 px-4 sm:px-0">
            <p className="text-xl sm:text-2xl md:text-4xl font-black text-white leading-tight bg-pepe-black border-4 border-pepe-black p-5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-[6px_6px_0_0_#FF69B4] sm:shadow-[8px_8px_0_0_#FF69B4] transform hover:rotate-1 transition-transform">
              {t('hero.desc')}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 mt-12 px-6 sm:px-0">
            <Button variant="outline" className="w-full sm:w-auto group text-xl sm:text-2xl py-4 sm:py-6 px-8 sm:px-10 shadow-[6px_6px_0_0_#000] sm:shadow-[8px_8px_0_0_#000]">
              <Download size={28} strokeWidth={3} className="mr-3 group-hover:animate-bounce" />
              {t('hero.whitepaper')}
            </Button>
            <Button variant="primary" className="w-full sm:w-auto group text-xl sm:text-2xl py-4 sm:py-6 px-8 sm:px-10 shadow-[6px_6px_0_0_#000] sm:shadow-[8px_8px_0_0_#000]">
              {t('hero.join_presale')}
              <ArrowRight size={28} strokeWidth={3} className="ml-3 group-hover:translate-x-2 transition-transform rtl:rotate-180 rtl:group-hover:-translate-x-2" />
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

const BuyBoxSection = ({ t, openModal }) => {
  const [amount, setAmount] = useState('');
  return (
    <section className="py-16 sm:py-24 lg:min-h-[800px] relative overflow-hidden flex items-center">
      <div className="absolute inset-0 z-0">
        <picture>
          <source media="(max-width: 1024px)" srcSet={ASSETS.BUY_BOX_MOBILE_BG} />
          <img src={ASSETS.BUY_BOX_BG} alt="Buy Box BG" className="w-full h-full object-cover lg:object-fill object-center" />
        </picture>
      </div>
      <div className="section-container relative z-10 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ y: 50, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} className="bg-white/95 backdrop-blur-sm p-6 sm:p-12 rounded-[2rem] sm:rounded-[2.5rem] border-4 border-pepe-black shadow-[8px_8px_0_0_#000] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 sm:w-40 sm:h-40 bg-pepe-pink opacity-10 rounded-full -mr-16 -mt-16 sm:-mr-20 sm:-mt-20" />
            <div className="text-center mb-10 sm:mb-12">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-pepe-black mb-4 uppercase italic tracking-tight animate-title-gradient">{t('buybox.title')}</h2>
              <p className="text-gray-600 text-base sm:text-lg lg:text-xl font-bold">{t('buybox.desc')}</p>
            </div>
            <div className="flex justify-center mb-10 sm:mb-12">
              <div className="bg-pepe-yellow/20 border-4 border-pepe-black px-6 sm:px-10 py-4 sm:py-6 rounded-2xl sm:rounded-[2rem] flex items-center space-x-4 sm:space-x-6 space-x-reverse transform rotate-1">
                <div className="w-12 h-12 sm:w-16 sm:h-16 bg-pepe-yellow rounded-xl sm:rounded-2xl border-4 border-pepe-black flex items-center justify-center text-pepe-black font-black text-xl sm:text-3xl shadow-[3px_3px_0px_0px_rgba(10,10,10,1)] sm:shadow-[4px_4px_0px_0px_rgba(10,10,10,1)]">
                  {ASSETS.COIN_ICON === '/assets/coin-icon.png' ? '$' : <img src={ASSETS.COIN_ICON} className="w-full h-full object-cover rounded-xl" />}
                </div>
                <div>
                  <div className="text-[10px] sm:text-xs text-pepe-black font-black uppercase tracking-[0.2em]">{t('buybox.current_price')}</div>
                  <div className="text-xl sm:text-3xl font-black text-pepe-black tracking-tight">1 $PWIFE = 0.00012 USDT</div>
                </div>
              </div>
            </div>
            <div className="space-y-6 sm:space-y-8 max-w-2xl mx-auto">
              <div className="relative group">
                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder={t('buybox.input_placeholder')} className="w-full bg-white border-4 border-pepe-black rounded-xl sm:rounded-[1.5rem] px-6 sm:px-8 py-4 sm:py-6 text-xl sm:text-2xl font-black outline-none transition-all placeholder:text-gray-400 text-center shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] sm:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[2px_2px_0px_0px_rgba(10,10,10,1)]" />
              </div>
              <div className="flex flex-col space-y-4 sm:space-y-6">
                <Button variant="primary" className="w-full py-4 sm:py-6 text-2xl sm:text-3xl shadow-[6px_6px_0_0_rgba(10,10,10,1)] sm:shadow-[8px_8px_0_0_rgba(10,10,10,1)]">
                  {t('buybox.buy_now')}
                </Button>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <Button variant="secondary" className="py-4 sm:py-5 text-lg sm:text-xl">
                    {t('buybox.how_to_buy')}
                  </Button>
                  <Button variant="outline" className="py-4 sm:py-5 text-lg sm:text-xl" onClick={() => openModal('audit')}>
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
    <section id="tokenomics" className="relative py-24 overflow-hidden bg-white">
      <div className="section-container relative z-10 px-4 sm:px-6">
        <div className="text-center mb-16">
          <h2 className="text-5xl sm:text-7xl font-black uppercase italic drop-shadow-[10px_10px_0px_rgba(255,255,255,1)] text-pepe-black animate-title-gradient">{t('tokenomics.title')}</h2>
        </div>
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <div className="space-y-8">
            <div className="bg-white p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] border-4 border-pepe-black shadow-[8px_8px_0_0_rgba(10,10,10,1)] lg:shadow-[12px_12px_0px_0px_rgba(10,10,10,1)]">
              <h3 className="text-2xl sm:text-3xl font-black uppercase mb-8 italic">{t('tokenomics.distribution_title', 'Token Distribution')}</h3>
              <div className="space-y-6">
                {distribution.map((item, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between font-black uppercase italic text-sm sm:text-base">
                      <span>{item.label}</span>
                      <span>{item.percentage}%</span>
                    </div>
                    <div className="h-6 w-full bg-gray-200 border-4 border-pepe-black rounded-full overflow-hidden shadow-[4px_4px_0_0_rgba(10,10,10,1)]">
                      <motion.div initial={{ width: 0 }} whileInView={{ width: `${item.percentage}%` }} transition={{ duration: 1, delay: idx * 0.1 }} className={`h-full ${item.color}`} />
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="primary" className="w-full mt-10 py-4 text-lg sm:text-xl shadow-[6px_6px_0_0_rgba(10,10,10,1)]" onClick={() => openModal('tokenomics')}>
                {t('tokenomics.details_button', 'Detailed Tokenomics')}
              </Button>
            </div>
          </div>
          <div className="flex flex-col space-y-6">
            <div className="relative group overflow-hidden rounded-[2rem] border-4 border-pepe-black shadow-[8px_8px_0_0_#000]">
              <div className="relative p-0 aspect-video flex items-center justify-center overflow-hidden">
                <img src={ASSETS.HERO_CHARACTER_IMAGE} alt="Tokenomics Illustration" className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500" />
              </div>
            </div>
            <div className="bg-pepe-black text-white p-6 sm:p-8 rounded-[2rem] border-4 border-pepe-black shadow-[8px_8px_0_0_#FF69B4] space-y-4">
              <div className="flex items-center justify-between bg-white/10 p-4 rounded-xl border-2 border-white/20">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <Flame size={24} className="text-pepe-yellow" />
                  <span className="font-black uppercase italic tracking-tight">{t('tokenomics.zero_tax')}</span>
                </div>
                <div className="bg-pepe-green text-pepe-black px-3 py-1 rounded-full text-xs font-black uppercase animate-pulse">Active</div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="flex items-center space-x-2 space-x-reverse bg-white/5 p-3 rounded-xl border-2 border-white/10">
                  <Lock size={16} className="text-pepe-pink" />
                  <span className="text-[10px] sm:text-xs font-bold uppercase">{t('tokenomics.liquidity_lock')}</span>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse bg-white/5 p-3 rounded-xl border-2 border-white/10">
                  <ShieldCheck size={16} className="text-pepe-green" />
                  <span className="text-[10px] sm:text-xs font-bold uppercase">{t('tokenomics.team_lock')}</span>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse bg-white/5 p-3 rounded-xl border-2 border-white/10">
                  <Lock size={16} className="text-pepe-yellow" />
                  <span className="text-[10px] sm:text-xs font-bold uppercase">{t('tokenomics.marketing_lock')}</span>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse bg-white/5 p-3 rounded-xl border-2 border-white/10">
                  <Droplets size={16} className="text-blue-400" />
                  <span className="text-[10px] sm:text-xs font-bold uppercase">{t('tokenomics.linear_vesting')}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 opacity-50 cursor-not-allowed grayscale">
                <div className="flex items-center space-x-2 space-x-reverse bg-white/5 p-3 rounded-xl border-2 border-white/10">
                  <X size={16} className="text-red-500" />
                  <span className="text-[10px] sm:text-xs font-bold uppercase line-through">{t('tokenomics.freeze')}</span>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse bg-white/5 p-3 rounded-xl border-2 border-white/10">
                  <X size={16} className="text-red-500" />
                  <span className="text-[10px] sm:text-xs font-bold uppercase line-through">{t('tokenomics.mint')}</span>
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
  <section id="about" className="relative py-20 sm:py-32 lg:min-h-[800px] overflow-hidden flex items-center">
    <div className="absolute inset-0 z-0">
      <picture>
        <source media="(max-width: 1024px)" srcSet={ASSETS.WHY_BUY_MOBILE_BG} />
        <img src={ASSETS.WHY_BUY_BG} alt="Why Buy BG" className="w-full h-full object-cover lg:object-fill object-center bg-no-repeat brightness-[0.8] contrast-[1.2]" />
      </picture>
    </div>
    <div className="absolute inset-0 bg-white/20 backdrop-blur-[1px] z-[1]" />
    <div className="section-container relative z-10 px-4 sm:px-6">
      <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
        <div className="space-y-6 sm:space-y-8 text-center lg:text-left rtl:lg:text-right">
          <span className="btn-secondary py-2 px-6 rotate-[-3deg] inline-block text-sm sm:text-base">{t('whybuy.badge')}</span>
          <h2 className="text-4xl sm:text-5xl lg:text-7xl font-black uppercase italic leading-[1.1] lg:leading-[0.9] drop-shadow-[6px_6px_0px_rgba(10,10,10,1)] lg:drop-shadow-[8px_8px_0px_rgba(10,10,10,1)] animate-title-gradient">
            {t('whybuy.title_why')} <br />{t('whybuy.title_pepewife')}
          </h2>
          <p className="text-lg sm:text-2xl font-bold text-gray-800 leading-snug max-w-2xl mx-auto lg:mx-0 drop-shadow-sm">
            {t('whybuy.desc')}
          </p>
          <Button variant="primary" className="w-full sm:w-auto text-xl sm:text-2xl py-4 sm:py-6 shadow-[6px_6px_0_0_rgba(10,10,10,1)] lg:shadow-[8px_8px_0_0_rgba(10,10,10,1)]">{t('whybuy.cta')}</Button>
        </div>
        <div className="grid gap-6 sm:gap-8">
          {[1, 2, 3].map(i => (
            <motion.div key={i} initial={{ x: 50, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} className="bg-white/90 p-6 sm:p-8 rounded-[1.5rem] sm:rounded-[2rem] border-4 border-pepe-black shadow-green-custom flex items-center space-x-4 sm:space-x-8 space-x-reverse">
              <div className="w-14 h-12 sm:w-20 sm:h-20 bg-pepe-yellow rounded-xl sm:rounded-[1.5rem] border-4 border-pepe-black flex items-center justify-center shrink-0 shadow-[3px_3px_0px_0px_rgba(10,10,10,1)] sm:shadow-[4px_4px_0px_0px_rgba(10,10,10,1)]">
                {i === 1 ? <Rocket size={30} strokeWidth={3} className="sm:w-10 sm:h-10" /> : i === 2 ? <Globe size={30} strokeWidth={3} className="sm:w-10 sm:h-10" /> : <Shield size={30} strokeWidth={3} className="sm:w-10 sm:h-10" />}
              </div>
              <div className="text-right flex-1">
                <h3 className="text-xl sm:text-2xl font-black uppercase italic mb-1 sm:mb-2">{t(`whybuy.reason${i}_title`)}</h3>
                <p className="text-gray-700 font-bold text-sm sm:text-base leading-tight">{t(`whybuy.reason${i}_desc`)}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  </section>
);

const RiskWarningSection = ({ t }) => (
  <section className="relative py-32 overflow-hidden border-y-8 border-pepe-black bg-pepe-pink/5">
    <div className="section-container relative z-20">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} transition={{ duration: 0.6 }} className="risk-card max-w-5xl mx-auto text-center transform rotate-1 bg-white relative group">
        <div className="absolute top-6 right-6 text-pepe-pink opacity-20 group-hover:opacity-100 transition-opacity"><Info size={40} strokeWidth={3} /></div>
        <Shield size={100} strokeWidth={3} className="text-pepe-pink mx-auto mb-10 animate-pulse" />
        <h2 className="text-5xl md:text-7xl font-black uppercase italic mb-10 tracking-tight text-pepe-black drop-shadow-sm animate-title-gradient">{t('risk.title')}</h2>
        <div className="space-y-8 text-xl md:text-2xl font-bold text-gray-700 leading-relaxed max-w-3xl mx-auto">
          <p className="border-l-4 border-pepe-pink pl-6 rtl:border-l-0 rtl:border-r-4 rtl:pr-6 py-2 bg-pepe-pink/5 rounded-r-2xl rtl:rounded-r-none rtl:rounded-l-2xl">{t('risk.p1')}</p>
          <p className="border-l-4 border-pepe-black pl-6 rtl:border-l-0 rtl:border-r-4 rtl:pr-6 py-2 bg-gray-50 rounded-r-2xl rtl:rounded-r-none rtl:rounded-l-2xl">{t('risk.p2')}</p>
        </div>
      </motion.div>
    </div>
  </section>
);

const Footer = ({ t }) => (
  <footer className="footer-black py-24">
    <div className="section-container">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-24 text-center md:text-left rtl:md:text-right">
        <div className="md:col-span-1 space-y-8">
          <div className="flex items-center justify-center md:justify-start space-x-3 space-x-reverse">
            <img src={ASSETS.HERO_CHARACTER_IMAGE} alt="PW" className="w-16 h-16 object-contain" />
            <span className="text-4xl font-black uppercase text-white">Pepe Wife</span>
          </div>
          <p className="text-xl font-bold text-white/60">{t('footer.desc')}</p>
        </div>
        {['links', 'community', 'legal'].map(cat => (
          <div key={cat}>
            <h4 className="text-2xl font-black uppercase italic text-pepe-pink mb-10 drop-shadow-[2px_2px_0px_rgba(255,255,255,0.1)]">{t(`footer.${cat}_title`)}</h4>
            <ul className="space-y-6 text-lg font-black uppercase text-white/80">
              {cat === 'links' ? ['presale', 'tokenomics', 'roadmap', 'whitepaper'].map(l => <li key={l}><a href={`#${l === 'presale' ? '' : l}`} className="hover:text-pepe-green transition-all hover:translate-x-1 inline-block">{t(`nav.${l}` === 'nav.presale' ? 'nav.home' : `nav.${l}`)}</a></li>) :
               cat === 'community' ? ['Twitter (X)', 'Telegram', 'Instagram', 'Discord'].map(l => <li key={l}><a href="#" className="hover:text-pepe-green transition-all hover:translate-x-1 inline-block">{l}</a></li>) :
               ['Terms', 'Privacy', 'Risk'].map(l => <li key={l}><a href="#" className="hover:text-pepe-green transition-all hover:translate-x-1 inline-block">{l}</a></li>)}
            </ul>
          </div>
        ))}
      </div>
      <div className="pt-16 border-t-4 border-white/10 flex flex-col md:flex-row justify-between items-center gap-8 opacity-60">
        <p className="text-sm font-black uppercase tracking-[0.3em] text-white">{t('footer.rights')}</p>
        <p className="text-sm font-black uppercase tracking-[0.3em] text-white">{t('footer.built_with')}</p>
      </div>
    </div>
  </footer>
);

const Navbar = ({ isOpen, setIsOpen, changeLanguage, t, currentLng, openModal }) => {
  return (
    <nav className="fixed top-4 left-4 right-4 z-50 rounded-[2rem] border-4 border-pepe-black shadow-[0_8px_0_0_rgba(10,10,10,1)] overflow-hidden h-20">
      <div className="absolute inset-0 z-0">
        {ASSETS.NAVBAR_BACKGROUND_IMAGE === '/assets/navbar-bg.png' ? <div className="w-full h-full bg-white" /> : <img src={ASSETS.NAVBAR_BACKGROUND_IMAGE} alt="Nav BG" className="w-full h-full object-cover" />}
      </div>
      <div className="relative z-10 h-full px-8 flex items-center justify-between">
        <div className="flex items-center space-x-3 space-x-reverse cursor-pointer group" onClick={() => openModal('home')}>
          <div className="w-12 h-12 bg-pepe-pink rounded-xl border-4 border-pepe-black flex items-center justify-center shadow-[4px_4px_0_0_#000] group-hover:scale-110 transition-transform">
            <img src={ASSETS.HERO_CHARACTER_IMAGE} alt="PW" className="w-8 h-8 object-contain" />
          </div>
          <span className="text-2xl font-black text-pepe-black uppercase hidden sm:block">Pepe Wife</span>
        </div>
        <div className="hidden md:flex items-center space-x-6 space-x-reverse">
          {[{ id: 'home', label: t('nav.home') }, { id: 'about', label: t('nav.about') }, { id: 'tokenomics', label: t('nav.tokenomics') }, { id: 'roadmap', label: t('nav.roadmap') }, { id: 'faq', label: t('nav.faq') }].map((item) => (
            <button key={item.id} onClick={() => openModal(item.id)} className="text-pepe-black font-black uppercase tracking-tight hover:text-pepe-pink transition-all hover:-translate-y-1">{item.label}</button>
          ))}
          <button onClick={() => openModal('contract')} className="text-pepe-black font-black uppercase tracking-tight hover:text-pepe-pink transition-all hover:-translate-y-1">{t('nav.contract')}</button>
        </div>
        <div className="flex items-center space-x-4 space-x-reverse">
          <div className="hidden sm:flex bg-pepe-black/10 p-1 rounded-xl border-2 border-pepe-black/20">
            {['en', 'ar', 'fr'].map((lang) => <button key={lang} onClick={() => changeLanguage(lang)} className={`px-3 py-1 rounded-lg text-xs font-black uppercase transition-all ${currentLng === lang ? 'bg-pepe-pink text-white shadow-md' : 'text-pepe-black/60 hover:text-pepe-black'}`}>{lang}</button>)}
          </div>
          <div className="hidden sm:block">
            <WalletButton t={t} openModal={openModal} />
          </div>
          <button onClick={() => setIsOpen(!isOpen)} className="md:hidden p-2 hover:bg-pepe-black/5 rounded-xl transition-colors border-4 border-pepe-black">
            {isOpen ? <X size={32} strokeWidth={3} /> : <Menu size={32} strokeWidth={3} />}
          </button>
        </div>
      </div>
    </nav>
  );
};

const LandingPage = () => {
  const { t, i18n } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null);
  const isRTL = i18n.language === 'ar';

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
        <HeroSection t={t} />
        <Ticker t={t} />
        <BuyBoxSection t={t} openModal={setActiveModal} />
        <FeaturedIn t={t} />
        <TokenomicsSection t={t} openModal={setActiveModal} />
        <WhyBuySection t={t} />
        <PartnersTicker t={t} />
        <RiskWarningSection t={t} />
      </main>

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
    </div>
  );
};

export default LandingPage;
