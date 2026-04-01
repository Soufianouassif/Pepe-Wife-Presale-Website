import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, X, Rocket, Info, Shield, Map, HelpCircle, ArrowRight, Download, Globe, Copy, Check, Lock, ExternalLink, Droplets, ShieldCheck, Flame } from '../components/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useWallet } from '../context/WalletContext';
import { formatAddress } from '../utils/format';
import ProfitCalculator from '../components/ProfitCalculator';
import ViewModeToggle from '../components/ViewModeToggle';
import MoneyRain from '../components/MoneyRain';
import TokenomicsBackground from '../components/TokenomicsBackground';
import RiskWarningBackground from '../components/RiskWarningBackground';
import LanguageSwitcher from '../components/LanguageSwitcher';
import BrandLogo from '../components/BrandLogo';
import { PRESALE_CONFIG, TOKENS_PER_USDT } from '../presaleConfig';
import { validatePaymentAmount, getPaymentRange, clampPaymentAmount } from '../utils/amountValidation';
import EthereumUsdtNotice from '../components/EthereumUsdtNotice';
import { PROJECT_CURRENCY_SYMBOL } from '../constants/projectConstants';

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

const dashboardTickerItems = [
  'Presale Live Now',
  'Secure Multi-Wallet Access',
  'Real-Time Analytics Dashboard',
  'Roadmap Execution In Progress',
  'Community Rewards & Referral',
  'Token Utility Expansion'
];

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
            className="section-bg-full" 
            loading="eager"
          />
        </picture>
      </div>
      <div className="section-container relative z-10 w-full flex flex-col items-center justify-center text-center space-y-8 sm:space-y-12 py-0">
        <motion.div 
          initial={{ opacity: 0, y: 30 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8 }}
          className="max-w-[95%] md:max-w-2xl lg:max-w-3xl xl:max-w-5xl mx-auto"
        >
          <span className="bg-pepe-pink text-white px-6 sm:px-8 py-2 sm:py-3 rounded-full border-4 border-pepe-black font-black uppercase tracking-widest shadow-[4px_4px_0_0_#000] sm:shadow-[6px_6px_0_0_#000] rotate-[-2deg] inline-block mb-6 sm:mb-8 text-xs sm:text-base">
            {t('hero.badge')}
          </span>
          <h1 className="text-3xl sm:text-6xl md:text-8xl lg:text-[9rem] font-black tracking-tighter leading-[1] sm:leading-[0.85] mb-8 sm:mb-12 text-pepe-black uppercase italic animate-title-gradient break-words">
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
  const [isDoorOpen, setIsDoorOpen] = useState(false);
  const currentPrice = PRESALE_CONFIG.currentPhase.priceUsd.toFixed(8);
  const landingRange = getPaymentRange('USDT');
  return (
    <section className="py-16 sm:py-24 min-h-[760px] lg:min-h-[860px] relative overflow-hidden flex items-center bg-[#78D7FF]">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <motion.div
          animate={{ x: [0, 22, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-10 left-8 w-28 h-16 sm:w-44 sm:h-24 bg-white rounded-full border-4 border-pepe-black shadow-[5px_5px_0_0_#000]"
        >
          <div className="absolute -left-4 top-4 w-14 h-10 bg-white rounded-full border-4 border-pepe-black" />
          <div className="absolute left-12 -top-3 w-16 h-12 bg-white rounded-full border-4 border-pepe-black" />
        </motion.div>
        <motion.div
          animate={{ x: [0, -24, 0] }}
          transition={{ duration: 8, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-20 right-6 sm:right-14 w-24 h-14 sm:w-40 sm:h-20 bg-white rounded-full border-4 border-pepe-black shadow-[5px_5px_0_0_#000]"
        >
          <div className="absolute -right-4 top-2 w-12 h-9 bg-white rounded-full border-4 border-pepe-black" />
          <div className="absolute left-6 -top-3 w-14 h-10 bg-white rounded-full border-4 border-pepe-black" />
        </motion.div>
        <div className="absolute bottom-0 left-0 right-0 h-24 sm:h-28 bg-[#4A4A4A] border-t-4 border-pepe-black">
          <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 border-t-4 border-dashed border-pepe-yellow/80" />
        </div>
      </div>
      <div className="section-container relative z-10 px-4 sm:px-6 w-full">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            className="relative mx-auto w-full max-w-4xl min-h-[560px] sm:min-h-[620px] lg:min-h-[680px]"
          >
            <div className="absolute left-1/2 top-[16%] -translate-x-1/2 z-10 w-[92%] sm:w-[78%] lg:w-[68%]">
              <AnimatePresence>
                {isDoorOpen && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 25 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 25 }}
                    transition={{ duration: 0.35 }}
                    className="bg-white/95 backdrop-blur-sm p-5 sm:p-8 rounded-[1.8rem] sm:rounded-[2.2rem] border-4 border-pepe-black shadow-[8px_8px_0_0_#000] overflow-hidden"
                  >
                    <div className="text-center mb-6 sm:mb-8">
                      <h2 className="text-xl sm:text-3xl lg:text-4xl font-black text-pepe-black mb-3 uppercase italic tracking-tight animate-title-gradient">{t('buybox.title')}</h2>
                      <p className="text-[10px] sm:text-xs font-black uppercase text-pepe-pink mb-2">{t('buybox.phase_badge', { current: PRESALE_CONFIG.currentPhase.id, total: PRESALE_CONFIG.totalPhases })}</p>
                      <p className="text-gray-700 text-xs sm:text-base lg:text-lg font-bold">{t('buybox.desc')}</p>
                    </div>
                    <div className="flex justify-center mb-6 sm:mb-8">
                      <div className="bg-pepe-yellow/25 border-4 border-pepe-black px-3 sm:px-8 py-3 sm:py-4 rounded-2xl sm:rounded-[2rem] flex items-center space-x-3 sm:space-x-5 space-x-reverse transform rotate-1">
                        <div className="w-9 h-9 sm:w-14 sm:h-14 bg-pepe-yellow rounded-xl border-4 border-pepe-black flex items-center justify-center text-pepe-black font-black text-base sm:text-2xl shadow-[2px_2px_0px_0px_rgba(10,10,10,1)] sm:shadow-[4px_4px_0px_0px_rgba(10,10,10,1)]">
                          {ASSETS.COIN_ICON === '/assets/coin-icon.png' ? '$' : <img src={ASSETS.COIN_ICON} className="w-full h-full object-cover rounded-xl" />}
                        </div>
                        <div>
                          <div className="text-[8px] sm:text-[10px] text-pepe-black font-black uppercase tracking-[0.2em]">{t('buybox.current_price')}</div>
                          <div className="text-sm sm:text-xl font-black text-pepe-black tracking-tight whitespace-nowrap">{t('buybox.price_line', { price: currentPrice })}</div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4 sm:space-y-6 max-w-xl mx-auto">
                      <label className="block text-xs sm:text-sm font-black uppercase tracking-wide text-pepe-black text-center">
                        {t('buybox.input_label')}
                      </label>
                      <input
                        type="number"
                        min={landingRange.min}
                        max={landingRange.max}
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        placeholder={t('buybox.input_placeholder')}
                        className="w-full bg-white border-4 border-pepe-black rounded-xl sm:rounded-[1.3rem] px-4 sm:px-6 py-3 sm:py-4 text-base sm:text-xl font-black outline-none transition-all placeholder:text-gray-400 text-center shadow-[4px_4px_0px_0px_rgba(10,10,10,1)] sm:shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[2px_2px_0px_0px_rgba(10,10,10,1)]"
                      />
                      <p className="text-[11px] sm:text-xs font-bold text-gray-600 text-center">{t('buy_modal.range_hint', { min: landingRange.min, max: landingRange.max })}</p>
                      <div className="flex flex-col space-y-3 sm:space-y-4">
                        <Button
                          variant="primary"
                          onClick={openBuyModal}
                          className="w-full py-3 sm:py-4 text-lg sm:text-2xl shadow-[6px_6px_0_0_rgba(10,10,10,1)]"
                        >
                          {t('buybox.buy_now')}
                        </Button>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                          <Button variant="secondary" className="py-3 text-sm sm:text-lg">
                            {t('buybox.how_to_buy')}
                          </Button>
                          <Button variant="outline" className="py-3 text-sm sm:text-lg" onClick={() => openModal('audit')}>
                            {t('buybox.audit')}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="absolute inset-x-0 bottom-20 sm:bottom-24 mx-auto w-full max-w-4xl h-[420px] sm:h-[500px] bg-[#FFD166] border-4 border-pepe-black rounded-[2.5rem] shadow-[10px_10px_0_0_#000] z-20 overflow-hidden">
              <div className="absolute inset-x-0 top-0 h-16 sm:h-20 bg-[#FF6FA9] border-b-4 border-pepe-black" />
              <div className="absolute top-12 sm:top-14 left-[10%] w-20 h-20 sm:w-28 sm:h-28 bg-[#B8F2E6] border-4 border-pepe-black rounded-2xl shadow-[4px_4px_0_0_#000]">
                <div className="absolute inset-x-1/2 top-0 bottom-0 -translate-x-1/2 border-l-4 border-pepe-black" />
                <div className="absolute inset-y-1/2 left-0 right-0 -translate-y-1/2 border-t-4 border-pepe-black" />
              </div>
              <div className="absolute top-12 sm:top-14 right-[10%] w-20 h-20 sm:w-28 sm:h-28 bg-[#B8F2E6] border-4 border-pepe-black rounded-2xl shadow-[4px_4px_0_0_#000]">
                <div className="absolute inset-x-1/2 top-0 bottom-0 -translate-x-1/2 border-l-4 border-pepe-black" />
                <div className="absolute inset-y-1/2 left-0 right-0 -translate-y-1/2 border-t-4 border-pepe-black" />
              </div>

              <div className="absolute left-1/2 bottom-0 -translate-x-1/2 w-[46%] sm:w-[40%] h-[62%] sm:h-[66%]">
                <div className="absolute inset-0 bg-[#8B5A2B] border-4 border-pepe-black rounded-t-[2rem]" />
                <motion.button
                  type="button"
                  onClick={() => setIsDoorOpen((prev) => !prev)}
                  whileTap={{ scale: 0.98 }}
                  animate={{ rotateY: isDoorOpen ? -110 : 0 }}
                  transition={{ duration: 0.55, ease: 'easeInOut' }}
                  style={{ transformOrigin: 'left center', transformStyle: 'preserve-3d' }}
                  className="absolute inset-0 bg-[#A06B37] border-4 border-pepe-black rounded-t-[2rem] shadow-[5px_5px_0_0_#000] cursor-pointer"
                >
                  <span className="absolute top-4 sm:top-6 left-1/2 -translate-x-1/2 bg-pepe-yellow border-4 border-pepe-black rounded-xl px-2 sm:px-4 py-1 sm:py-2 text-[10px] sm:text-xs font-black text-pepe-black whitespace-nowrap">
                    {t('home_buy_house.open_door')}
                  </span>
                  <span className="absolute top-1/2 right-4 sm:right-5 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 bg-pepe-yellow border-4 border-pepe-black rounded-full" />
                </motion.button>
              </div>
            </div>
            <div className="absolute inset-x-0 bottom-8 sm:bottom-10 mx-auto w-[88%] max-w-4xl h-12 sm:h-14 bg-[#2D2D2D] border-4 border-pepe-black rounded-xl z-30" />
            <div className="absolute inset-x-0 bottom-8 sm:bottom-10 mx-auto w-[88%] max-w-4xl h-12 sm:h-14 z-30 pointer-events-none">
              <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 border-t-4 border-dashed border-pepe-yellow/80" />
            </div>
          </motion.div>
          <div className="text-center mt-8">
            <p className="inline-flex items-center bg-white border-4 border-pepe-black rounded-full px-5 py-2 text-xs sm:text-sm font-black text-pepe-black shadow-[4px_4px_0_0_#000]">
              {isDoorOpen ? t('home_buy_house.opened_hint') : t('home_buy_house.closed_hint')}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

const TokenomicsSection = ({ t, openModal }) => {
  const [isAnimationEnabled, setIsAnimationEnabled] = useState(true);
  const distribution = [
    { label: t('tokenomics.category_presale', 'Presale'), percentage: 40, color: 'bg-pepe-pink' },
    { label: t('tokenomics.category_liquidity', 'Liquidity'), percentage: 30, color: 'bg-pepe-green' },
    { label: t('tokenomics.category_staking', 'Staking'), percentage: 15, color: 'bg-pepe-yellow' },
    { label: t('tokenomics.category_team', 'Team'), percentage: 10, color: 'bg-pepe-black' },
    { label: t('tokenomics.category_marketing', 'Marketing'), percentage: 5, color: 'bg-white' },
  ];
  return (
    <section id="tokenomics" className="relative py-16 sm:py-24 overflow-hidden bg-[#38C172]">
      <TokenomicsBackground isEnabled={isAnimationEnabled} />

      <div className="section-container relative z-10 px-4 sm:px-6">
        <div className="text-center mb-12 sm:mb-16 relative">
          <div className="absolute top-0 right-0 sm:right-4 z-20">
            <button 
              onClick={() => setIsAnimationEnabled(!isAnimationEnabled)}
              className="bg-white border-2 border-pepe-black px-3 py-1 rounded-full text-[10px] font-semibold uppercase shadow-[2px_2px_0_0_#000] hover:bg-pepe-yellow transition-colors"
            >
              {isAnimationEnabled ? 'Pause BG' : 'Play BG'}
            </button>
          </div>

          <h2 className="text-3xl sm:text-7xl font-semibold uppercase text-pepe-black animate-title-gradient relative inline-block">
            {t('tokenomics.title')}
            <motion.span 
              animate={isAnimationEnabled ? { opacity: [0.5, 1, 0.5] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
              className="block text-pepe-black text-2xl sm:text-4xl mt-2"
            >
              $PWIFE TOKENOMICS
            </motion.span>
          </h2>
        </div>
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          <div className="space-y-8">
            <div className="bg-white p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] border-4 border-pepe-black shadow-[8px_8px_0_0_rgba(10,10,10,1)] lg:shadow-[12px_12px_0px_0px_rgba(10,10,10,1)]">
              <h3 className="text-xl sm:text-3xl font-semibold uppercase mb-6 sm:mb-8">{t('tokenomics.distribution_title', 'Token Distribution')}</h3>
              <div className="space-y-4 sm:space-y-6">
                {distribution.map((item, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between font-semibold uppercase text-xs sm:text-base">
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
              <div className="flex items-center justify-between bg-white p-3 sm:p-4 rounded-xl border-2 border-pepe-black">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <Flame size={20} className="text-pepe-yellow" />
                  <span className="font-semibold uppercase tracking-tight text-xs sm:text-base text-pepe-black">{t('tokenomics.zero_tax')}</span>
                </div>
                <div className="bg-pepe-green text-pepe-black px-2 sm:px-3 py-1 rounded-full text-[10px] font-semibold uppercase">{t('tokenomics.active')}</div>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <div className="flex items-center space-x-2 space-x-reverse bg-white p-2 sm:p-3 rounded-xl border-2 border-pepe-black">
                  <Lock size={14} className="text-pepe-pink" />
                  <span className="text-[9px] sm:text-xs font-medium uppercase text-pepe-black">{t('tokenomics.liquidity_lock')}</span>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse bg-white p-2 sm:p-3 rounded-xl border-2 border-pepe-black">
                  <ShieldCheck size={14} className="text-pepe-green" />
                  <span className="text-[9px] sm:text-xs font-medium uppercase text-pepe-black">{t('tokenomics.team_lock')}</span>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse bg-white p-2 sm:p-3 rounded-xl border-2 border-pepe-black">
                  <Lock size={14} className="text-pepe-yellow" />
                  <span className="text-[9px] sm:text-xs font-medium uppercase text-pepe-black">{t('tokenomics.marketing_lock')}</span>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse bg-white p-2 sm:p-3 rounded-xl border-2 border-pepe-black">
                  <Droplets size={14} className="text-blue-400" />
                  <span className="text-[9px] sm:text-xs font-medium uppercase text-pepe-black">{t('tokenomics.linear_vesting')}</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <div className="flex items-center space-x-2 space-x-reverse bg-white p-2 sm:p-3 rounded-xl border-2 border-pepe-black">
                  <X size={14} className="text-red-500" />
                  <span className="text-[9px] sm:text-xs font-medium uppercase text-pepe-black line-through">{t('tokenomics.freeze')}</span>
                </div>
                <div className="flex items-center space-x-2 space-x-reverse bg-white p-2 sm:p-3 rounded-xl border-2 border-pepe-black">
                  <X size={14} className="text-red-500" />
                  <span className="text-[9px] sm:text-xs font-medium uppercase text-pepe-black line-through">{t('tokenomics.mint')}</span>
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
          <h2 className="text-2xl sm:text-5xl lg:text-7xl font-black uppercase italic leading-[1.1] lg:leading-[0.9] animate-title-gradient">
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
  <section className="relative py-20 sm:py-32 overflow-hidden border-y-8 border-pepe-black">
    {/* Animated Floating Circles Background */}
    <RiskWarningBackground />
    
    <div className="section-container relative z-20">
      <motion.div initial={{ scale: 0.95, opacity: 0 }} whileInView={{ scale: 1, opacity: 1 }} transition={{ duration: 0.6 }} className="risk-card max-w-5xl mx-auto text-center transform rotate-1 bg-white/80 backdrop-blur-md relative group border-4 border-pepe-black shadow-[12px_12px_0_0_#000]">
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
            <h2 className="text-3xl sm:text-6xl lg:text-7xl font-black uppercase italic leading-none text-pepe-green">
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
                    {t('brand.name')}
                  </h3>
                  <p className="text-xs sm:text-sm font-black text-pepe-black/60 uppercase tracking-[0.3em]">{t('whitepaper.cover_subtitle')}</p>
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
          <BrandLogo
            size="lg"
            className="justify-center md:justify-start"
            nameClassName="text-white"
            symbolClassName="text-white/80"
          />
          <p className="text-lg sm:text-xl font-bold text-white/60">{t('footer.desc')}</p>
        </div>
        {['links', 'community', 'legal'].map(cat => (
          <div key={cat}>
            <h4 className="text-xl sm:text-2xl font-black uppercase italic text-pepe-pink mb-6 sm:mb-10">{t(`footer.${cat}_title`)}</h4>
            <ul className="space-y-4 sm:space-y-6 text-base sm:text-lg font-black uppercase text-white/80">
              {cat === 'links' ? ['presale', 'tokenomics', 'roadmap', 'whitepaper'].map(l => <li key={l}><a href={`#${l === 'presale' ? '' : l}`} className="hover:text-pepe-green transition-all hover:translate-x-1 inline-block">{t(`nav.${l}` === 'nav.presale' ? 'nav.home' : `nav.${l}`)}</a></li>) :
               cat === 'community' ? ['x', 'telegram', 'instagram', 'discord'].map(l => <li key={l}><a href="#" className="hover:text-pepe-green transition-all hover:translate-x-1 inline-block">{t(`footer.community_links.${l}`)}</a></li>) :
               ['terms', 'privacy', 'risk'].map(l => <li key={l}><a href="#" className="hover:text-pepe-green transition-all hover:translate-x-1 inline-block">{t(`footer.legal_links.${l}`)}</a></li>)}
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
};

const DashboardTickerSection = ({ t }) => (
  <section className="py-4 overflow-hidden border-y-4 border-pepe-black bg-white">
    <div className="h-[60px] w-full px-4 flex items-center overflow-hidden">
      <div className="dashboard-marquee-track text-sm md:text-base font-bold text-pepe-black whitespace-nowrap">
        {[...dashboardTickerItems, ...dashboardTickerItems].map((item, index) => (
          <span key={`${item}-${index}`} className="inline-flex items-center gap-3 mr-10">
            <Rocket size={15} className="text-pepe-green" />
            <span>{item}</span>
          </span>
        ))}
      </div>
    </div>
  </section>
);

const DashboardRoadmapSection = ({ t }) => {
  const phases = [
    { id: '01', title: t('roadmap.phase1_title'), items: [t('roadmap.phase1_item1'), t('roadmap.phase1_item2'), t('roadmap.phase1_item3'), t('roadmap.phase1_item4')] },
    { id: '02', title: t('roadmap.phase2_title'), items: [t('roadmap.phase2_item1'), t('roadmap.phase2_item2'), t('roadmap.phase2_item3'), t('roadmap.phase2_item4')] },
    { id: '03', title: t('roadmap.phase3_title'), items: [t('roadmap.phase3_item1'), t('roadmap.phase3_item2'), t('roadmap.phase3_item3'), t('roadmap.phase3_item4')] },
    { id: '04', title: t('roadmap.phase4_title'), items: [t('roadmap.phase4_item1'), t('roadmap.phase4_item2'), t('roadmap.phase4_item3'), t('roadmap.phase4_item4')] },
  ];
  return (
    <section className="py-16 sm:py-20 bg-white border-y-4 border-pepe-black">
      <div className="section-container px-4 sm:px-6">
        <h2 className="text-3xl sm:text-5xl font-black uppercase italic text-pepe-black mb-10 text-center">{t('roadmap.title_roadmap')}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {phases.map((phase) => (
            <div key={phase.id} className="bg-white p-6 sm:p-8 rounded-[2rem] border-4 border-pepe-black shadow-[8px_8px_0_0_#000] hover:shadow-[12px_12px_0_0_#000] transition-all hover:-translate-y-1">
              <div className="w-12 h-12 bg-pepe-pink rounded-xl border-4 border-pepe-black flex items-center justify-center text-white font-black text-xl mb-6 shadow-[4px_4px_0_0_#000]">
                {phase.id}
              </div>
              <h3 className="text-xl sm:text-2xl font-black uppercase italic mb-6 text-pepe-black">{phase.title}</h3>
              <ul className="space-y-4">
                {phase.items.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-3 group">
                    <div className="mt-1.5 w-3 h-3 bg-pepe-green rounded-full border-2 border-pepe-black shrink-0 group-hover:scale-125 transition-transform" />
                    <span className="text-gray-700 font-bold text-sm sm:text-base leading-tight">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const DashboardTokenContractSection = ({ t }) => {
  const tokenContractAddress = import.meta?.env?.VITE_PWIFE_TOKEN_CONTRACT || 'YOUR_TOKEN_MINT_ADDRESS_HERE';
  const handleCopy = async (text) => { if (text) await navigator.clipboard.writeText(text); };
  return (
    <section className="py-16 sm:py-20 bg-pepe-black text-white border-y-4 border-pepe-black">
      <div className="section-container px-4 sm:px-6">
        <h2 className="text-3xl sm:text-5xl font-black uppercase italic text-pepe-green mb-10 text-center">{t('nav.contract')}</h2>
        <div className="space-y-6">
          <div className="bg-white/10 backdrop-blur-md p-6 sm:p-8 rounded-[2rem] border-4 border-white/20">
            <p className="text-pepe-yellow font-black uppercase text-sm mb-2">Token</p>
            <p className="text-2xl sm:text-3xl font-black text-white">PWIFE</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-6 sm:p-8 rounded-[2rem] border-4 border-white/20">
            <p className="text-pepe-yellow font-black uppercase text-sm mb-2">Network</p>
            <p className="text-xl sm:text-2xl font-black text-white">Solana · Mainnet</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md p-6 sm:p-8 rounded-[2rem] border-4 border-white/20">
            <p className="text-pepe-yellow font-black uppercase text-sm mb-2">Contract Address</p>
            <p className="text-xs sm:text-sm text-white/80 break-all font-mono mb-4">{tokenContractAddress}</p>
            <button onClick={() => handleCopy(tokenContractAddress)} className="h-11 px-6 rounded-xl border-4 border-pepe-green bg-pepe-green text-pepe-black font-black uppercase text-sm hover:bg-pepe-yellow hover:border-pepe-yellow transition-all shadow-[4px_4px_0_0_#fff]">
              Copy Address
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

const DashboardFaqSection = ({ t }) => {
  const faqs = [
    { q: t('faq.q1'), a: t('faq.a1') },
    { q: t('faq.q2'), a: t('faq.a2') },
    { q: t('faq.q3'), a: t('faq.a3') },
    { q: t('faq.q4'), a: t('faq.a4') },
  ];
  return (
    <section className="py-16 sm:py-20 bg-pepe-yellow border-y-4 border-pepe-black">
      <div className="section-container px-4 sm:px-6">
        <h2 className="text-3xl sm:text-5xl font-black uppercase italic text-pepe-black mb-10 text-center">{t('faq.title')}</h2>
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx} className="bg-white p-5 sm:p-6 rounded-[1.5rem] border-4 border-pepe-black shadow-[4px_4px_0_0_#000]">
              <p className="font-black text-pepe-black text-sm sm:text-base mb-2">{faq.q}</p>
              <p className="text-gray-700 font-bold text-sm sm:text-base">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const DashboardRiskSection = ({ t }) => (
  <section className="py-16 sm:py-20 bg-white border-y-4 border-pepe-black">
    <div className="section-container px-4 sm:px-6">
      <h2 className="text-3xl sm:text-5xl font-black uppercase italic text-pepe-pink mb-10 text-center">{t('risk.title')}</h2>
      <div className="bg-pepe-pink/10 p-6 sm:p-8 rounded-[2rem] border-4 border-pepe-pink">
        <ul className="space-y-4">
          <li className="flex items-start gap-3">
            <span className="mt-1 text-pepe-pink"><X size={18} /></span>
            <span className="text-gray-700 font-bold text-sm sm:text-base">{t('risk.p1')}</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-1 text-pepe-pink"><X size={18} /></span>
            <span className="text-gray-700 font-bold text-sm sm:text-base">{t('risk.p2')}</span>
          </li>
          <li className="flex items-start gap-3">
            <span className="mt-1 text-pepe-pink"><X size={18} /></span>
            <span className="text-gray-700 font-bold text-sm sm:text-base">Only invest funds you can afford to lose and always use your own research.</span>
          </li>
        </ul>
      </div>
    </div>
  </section>
);

const Navbar = ({ isOpen, setIsOpen, t, openModal }) => {
  return (
    <nav className="fixed top-2 sm:top-4 left-2 sm:left-4 right-2 sm:right-4 z-50 rounded-2xl sm:rounded-[2rem] border-4 border-pepe-black shadow-[0_4px_0_0_rgba(10,10,10,1)] sm:shadow-[0_8px_0_0_rgba(10,10,10,1)] overflow-hidden h-16 sm:h-20 bg-white">
      <div className="absolute inset-0 z-0">
        {ASSETS.NAVBAR_BACKGROUND_IMAGE === '/assets/navbar-bg.png' ? <div className="w-full h-full bg-white" /> : <img src={ASSETS.NAVBAR_BACKGROUND_IMAGE} alt="Nav BG" className="w-full h-full object-cover" />}
      </div>
      <div className="relative z-10 h-full px-3 sm:px-8 flex items-center justify-between">
        <button className="cursor-pointer group shrink-0" onClick={() => openModal('home')}>
          <BrandLogo size="md" className="group-hover:scale-105 transition-transform" />
        </button>

        <div className="hidden lg:flex items-center space-x-4 xl:space-x-6 space-x-reverse">
          {[{ id: 'home', label: t('nav.home') }, { id: 'about', label: t('nav.about') }, { id: 'tokenomics', label: t('nav.tokenomics') }, { id: 'roadmap', label: t('nav.roadmap') }, { id: 'faq', label: t('nav.faq') }].map((item) => (
            <button key={item.id} onClick={() => openModal(item.id)} className="text-pepe-black font-black uppercase tracking-tight hover:text-pepe-pink transition-all hover:-translate-y-1 text-sm xl:text-base">{item.label}</button>
          ))}
          <button onClick={() => openModal('contract')} className="text-pepe-black font-black uppercase tracking-tight hover:text-pepe-pink transition-all hover:-translate-y-1 text-sm xl:text-base">{t('nav.contract')}</button>
        </div>

        <div className="flex items-center space-x-2 md:space-x-4 space-x-reverse shrink-0">
          <LanguageSwitcher className="hidden sm:flex" />
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
  const [amountError, setAmountError] = useState('');
  const { isConnected, sendTransaction, walletType, setRequiredEvmChainId } = useWallet();
  const navigate = useNavigate();
  const currentPrice = PRESALE_CONFIG.currentPhase.priceUsd.toFixed(8);
  const amountRange = getPaymentRange(currency);

  const handleAmountChange = (nextRaw) => {
    setAmount(nextRaw);
    if (nextRaw === '') {
      setAmountError('');
      return;
    }
    const result = validatePaymentAmount(nextRaw, currency);
    if (!result.valid) {
      setAmountError(t('validation.amount_range', { min: result.min, max: result.max }));
      return;
    }
    setAmountError('');
  };

  const handleAmountBlur = () => {
    if (amount === '') return;
    const result = validatePaymentAmount(amount, currency);
    if (!result.valid) {
      setAmount(clampPaymentAmount(amount, currency));
    }
  };

  const handleBuy = async () => {
    const paymentCurrency = currency === 'USDT' ? 'USDT' : 'SOL';
    const targetChainId = paymentCurrency === 'USDT' ? '0x1' : null;
    if (targetChainId) {
      try {
        setRequiredEvmChainId(targetChainId);
      } catch (error) {
        alert(error?.userMessage || t('buy_modal.errors.invalid_network_config'));
        return;
      }
    }
    if (!isConnected) {
      navigate('/connect');
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      alert(t('buy_modal.errors.invalid_amount'));
      return;
    }
    const validation = validatePaymentAmount(amount, currency);
    if (!validation.valid) {
      alert(t('validation.amount_range', { min: validation.min, max: validation.max }));
      return;
    }

    setIsLoading(true);
    try {
      if (paymentCurrency === 'USDT' && !['MetaMask', 'Coinbase', 'Binance', 'WalletConnect'].includes(walletType)) {
        throw new Error(t('buy_modal.errors.require_evm'));
      }
      if (paymentCurrency === 'SOL' && !['Phantom', 'Solflare', 'Backpack', 'OKX', 'Trust Wallet', 'Social'].includes(walletType)) {
        throw new Error(t('buy_modal.errors.require_solana'));
      }
      const tx = await sendTransaction({
        to: paymentCurrency === 'USDT'
          ? (import.meta?.env?.VITE_ETH_TREASURY_ADDRESS || '0x000000000000000000000000000000000000dEaD')
          : (import.meta?.env?.VITE_SOL_TREASURY_ADDRESS || ''),
        from: undefined,
        value: undefined,
        paymentCurrency,
        amount
      });
      console.log('Transaction success:', tx);
      alert(t('buy_modal.success'));
      onClose();
    } catch (error) {
      if (error.message === 'USER_REJECTED') {
        alert(t('buy_modal.errors.user_cancelled'));
      } else if (error.message.includes('Invalid')) {
        alert(error.message);
      } else {
        console.error('Transaction error:', error);
        alert(t('buy_modal.errors.failed'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={t('hero.join_presale')} headerColor="bg-pepe-green">
      <div className="space-y-6 sm:space-y-8">
        <div className="text-center space-y-2 sm:space-y-4">
          <h4 className="text-xl sm:text-3xl font-black uppercase italic animate-title-gradient">{t('buy_modal.phase_live', { current: PRESALE_CONFIG.currentPhase.id, total: PRESALE_CONFIG.totalPhases })}</h4>
          <p className="text-base sm:text-xl font-bold text-gray-600">{t('buybox.price_line', { price: currentPrice })}</p>
        </div>

        <div className="space-y-4 sm:space-y-6">
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <button 
              onClick={() => {
                setSolCurrency('SOL');
                if (amount) {
                  const v = validatePaymentAmount(amount, 'SOL');
                  setAmountError(v.valid ? '' : t('validation.amount_range', { min: v.min, max: v.max }));
                }
              }}
              className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border-4 border-pepe-black font-black uppercase italic transition-all text-sm sm:text-base ${currency === 'SOL' ? 'bg-pepe-yellow shadow-[4px_4px_0_0_#000]' : 'bg-gray-100'}`}
            >
              {t('buy_modal.pay_sol')}
            </button>
            <button 
              onClick={() => {
                setSolCurrency('USDT');
                if (amount) {
                  const v = validatePaymentAmount(amount, 'USDT');
                  setAmountError(v.valid ? '' : t('validation.amount_range', { min: v.min, max: v.max }));
                }
              }}
              className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border-4 border-pepe-black font-black uppercase italic transition-all text-sm sm:text-base ${currency === 'USDT' ? 'bg-pepe-yellow shadow-[4px_4px_0_0_#000]' : 'bg-gray-100'}`}
            >
              {t('buy_modal.pay_usdt')}
            </button>
          </div>

          <div className="space-y-2">
            <label className="block text-xs sm:text-sm font-black uppercase tracking-wide text-pepe-black">
              {t('buy_modal.amount_label', { currency })}
            </label>
            <input 
              type="number" 
              value={amount}
              min={amountRange.min}
              max={amountRange.max}
              onChange={(e) => handleAmountChange(e.target.value)}
              onBlur={handleAmountBlur}
              placeholder={t('buybox.input_placeholder')}
              className="w-full bg-white border-4 border-pepe-black rounded-xl sm:rounded-2xl p-4 sm:p-6 text-xl sm:text-2xl font-black outline-none shadow-[4px_4px_0_0_#000] sm:shadow-[6px_6px_0_0_#000]"
            />
            <div className="flex items-center justify-between gap-3">
              <span className="text-[11px] sm:text-xs font-bold text-gray-600">{t('buy_modal.range_hint', { min: amountRange.min, max: amountRange.max })}</span>
              <span className="font-black text-pepe-pink text-sm sm:text-base">{currency}</span>
            </div>
            {amountError && <p className="text-xs font-black text-red-600">{amountError}</p>}
          </div>

          {currency === 'USDT' && <EthereumUsdtNotice />}

          <div className="bg-pepe-black text-white p-4 sm:p-6 rounded-xl sm:rounded-2xl border-4 border-pepe-black flex justify-between items-center">
            <span className="font-black uppercase text-xs sm:text-base">{t('buy_modal.you_will_get')}</span>
            <span className="text-lg sm:text-2xl font-black text-pepe-yellow">{amount ? (amount * TOKENS_PER_USDT).toLocaleString() : '0'} {PROJECT_CURRENCY_SYMBOL}</span>
          </div>

          <button 
            onClick={handleBuy}
            disabled={isLoading || !!amountError}
            className={`w-full bg-pepe-green text-pepe-black border-4 border-pepe-black py-4 sm:py-6 rounded-xl sm:rounded-2xl text-xl sm:text-2xl font-black uppercase italic shadow-[6px_6px_0_0_#000] sm:shadow-[8px_8px_0_0_#000] hover:translate-y-1 transition-all ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoading ? t('buy_modal.processing') : t('buybox.buy_now')}
          </button>
        </div>

        <div className="flex items-center justify-center gap-2 opacity-60">
          <Shield size={16} className="text-pepe-green" />
          <span className="text-[10px] sm:text-xs font-black uppercase">{t('buy_modal.secure_tx')}</span>
        </div>
      </div>
    </Modal>
  );
};

const LandingPage = () => {
  try {
    console.log("LandingPage: Component rendering...");
    const { t, i18n } = useTranslation();
    console.log("LandingPage: t is ready, language:", i18n.language);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [activeModal, setActiveModal] = useState(null);
    const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
    const isRTL = i18n.language?.startsWith('ar');
    console.log("LandingPage: isRTL is", isRTL);

    useEffect(() => {
      document.body.dir = isRTL ? 'rtl' : 'ltr';
    }, [isRTL]);

    const copyAddress = () => {
      navigator.clipboard.writeText('0x1234567890abcdef1234567890abcdef12345678');
    };

    return (
      <div className={`min-h-screen bg-white text-pepe-black selection:bg-pepe-pink selection:text-white ${isRTL ? 'rtl' : 'ltr'}`}>
        <Navbar isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} t={t} openModal={setActiveModal} />
        
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
                <LanguageSwitcher />
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
          <DashboardTickerSection t={t} />
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 xl:gap-10">
            <DashboardRoadmapSection t={t} />
            <DashboardTokenContractSection t={t} />
          </div>
          <WhitepaperSection t={t} openModal={setActiveModal} />
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 xl:gap-10">
            <DashboardFaqSection t={t} />
            <DashboardRiskSection t={t} />
          </div>
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

        <Modal isOpen={activeModal === 'tokenomics'} onClose={() => setActiveModal(null)} title={t('tokenomics.distribution_title')} headerColor="bg-pepe-green">
          <div className="space-y-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
              <div className="relative rounded-3xl border-4 border-pepe-black overflow-hidden shadow-[8px_8px_0_0_#000]"><img src={ASSETS.HERO_CHARACTER_IMAGE} alt="Tokenomics" className="w-full h-full object-cover" /></div>
              <div className="space-y-6"><h4 className="text-3xl font-black uppercase italic text-pepe-green">{t('tokenomics.title')}</h4><p className="text-lg font-bold text-gray-700 leading-relaxed">{t('tokenomics.desc_detailed')}</p><div className="grid grid-cols-2 gap-4"><div className="bg-gray-50 p-4 rounded-2xl border-2 border-pepe-black/10"><div className="text-xs font-black text-gray-400 uppercase">{t('tokenomics.zero_tax')}</div><div className="text-xl font-black text-pepe-green">{t('tokenomics.zero_tax_value')}</div></div><div className="bg-gray-50 p-4 rounded-2xl border-2 border-pepe-black/10"><div className="text-xs font-black text-gray-400 uppercase">{t('tokenomics.total_supply_label')}</div><div className="text-xl font-black text-pepe-pink">{t('tokenomics.total_supply_value')}</div></div></div></div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left rtl:text-right border-collapse">
                <thead><tr className="bg-pepe-green/20"><th className="p-4 border-4 border-pepe-black font-black uppercase italic">{t('tokenomics.table_header_category')}</th><th className="p-4 border-4 border-pepe-black font-black uppercase italic">{t('tokenomics.table_header_percentage')}</th><th className="p-4 border-4 border-pepe-black font-black uppercase italic">{t('tokenomics.table_header_amount')}</th></tr></thead>
                <tbody>{[{ cat: t('tokenomics.category_presale'), pct: '40%', amt: '400,000,000' }, { cat: t('tokenomics.category_liquidity'), pct: '30%', amt: '300,000,000' }, { cat: t('tokenomics.category_staking'), pct: '15%', amt: '150,000,000' }, { cat: t('tokenomics.category_team'), pct: '10%', amt: '100,000,000' }, { cat: t('tokenomics.category_marketing'), pct: '5%', amt: '50,000,000' }].map((row, i) => (<tr key={i} className="border-4 border-pepe-black font-bold"><td className="p-4 border-4 border-pepe-black uppercase">{row.cat}</td><td className="p-4 border-4 border-pepe-black text-pepe-pink">{row.pct}</td><td className="p-4 border-4 border-pepe-black">{row.amt}</td></tr>))}</tbody>
              </table>
            </div>
            <div className="text-center text-xl font-black uppercase italic py-4 bg-pepe-yellow/10 border-4 border-pepe-black rounded-2xl shadow-[4px_4px_0_0_#000]">{t('tokenomics.total_supply')}</div>
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
  } catch (error) {
    console.error("LandingPage CRITICAL RENDER ERROR:", error);
    return <div style={{ padding: 50, color: 'red' }}>{t('error_boundary.title')}: {error.message}</div>;
  }
};

export default LandingPage;
