import React, { useState, useEffect } from 'react';
import { Menu, X, Rocket, Info, Shield, Map, HelpCircle, ArrowRight, Download, Globe, Copy, Check, Lock, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

// ASSET PLACEHOLDERS
const ASSETS = {
  HERO_BACKGROUND_IMAGE: '/assets/hero-section.svg',
  HERO_CHARACTER_IMAGE: '/assets/hero-character.png',
  TOKENOMICS_FULL_IMAGE: '/assets/tokenomics.png',
  RISK_WARNING_BACKGROUND: '/assets/risk-bg.svg',
  NAVBAR_BACKGROUND_IMAGE: '/assets/navbar-bg.png', // New customizable background
  CUSTOM_BUTTON_IMAGE_PRIMARY: '/assets/btn-primary.png',
  CUSTOM_BUTTON_IMAGE_SECONDARY: '/assets/btn-secondary.png',
  COIN_ICON: '/assets/coin-icon.png',
  WHY_BUY_BG: '/assets/hero-section.svg',
};

const Modal = ({ isOpen, onClose, title, children }) => {
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
            className="relative bg-white border-4 border-pepe-black rounded-[2.5rem] shadow-[12px_12px_0_0_rgba(10,10,10,1)] w-full max-w-2xl overflow-hidden z-10"
          >
            <div className="p-8 border-b-4 border-pepe-black flex items-center justify-between bg-pepe-yellow">
              <h3 className="text-3xl font-black text-pepe-black uppercase italic">{title}</h3>
              <button onClick={onClose} className="p-2 hover:bg-pepe-black/10 rounded-xl transition-colors">
                <X size={32} className="text-pepe-black" strokeWidth={3} />
              </button>
            </div>
            <div className="p-8 max-h-[70vh] overflow-y-auto">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

const Button = ({ variant = 'primary', children, className = '', ...props }) => {
  const isCustom = variant === 'primary' 
    ? ASSETS.CUSTOM_BUTTON_IMAGE_PRIMARY !== '/assets/btn-primary.png'
    : ASSETS.CUSTOM_BUTTON_IMAGE_SECONDARY !== '/assets/btn-secondary.png';
    
  const asset = variant === 'primary' 
    ? ASSETS.CUSTOM_BUTTON_IMAGE_PRIMARY 
    : ASSETS.CUSTOM_BUTTON_IMAGE_SECONDARY;

  return (
    <button 
      className={`btn-${variant} ${className}`} 
      {...props}
    >
      {isCustom ? (
        <>
          <img src={asset} alt="Button" className="absolute inset-0 w-full h-full object-cover z-0" />
          <span className="relative z-10">{children}</span>
        </>
      ) : children}
    </button>
  );
};

function App() {
  const { t, i18n } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState(null); // 'contract', 'audit', 'tokenomics'
  const isRTL = i18n.language === 'ar';

  useEffect(() => {
    document.body.dir = isRTL ? 'rtl' : 'ltr';
    localStorage.setItem('i18nextLng', i18n.language);
  }, [i18n.language, isRTL]);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setIsMobileMenuOpen(false);
  };

  const [copied, setCopied] = useState(false);
  const copyAddress = () => {
    navigator.clipboard.writeText('0x1234567890abcdef1234567890abcdef12345678');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`min-h-screen bg-white text-pepe-black selection:bg-pepe-pink selection:text-white`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* 1. NAVBAR */}
      <Navbar 
        isOpen={isMobileMenuOpen} 
        setIsOpen={setIsMobileMenuOpen} 
        changeLanguage={changeLanguage} 
        t={t} 
        currentLng={i18n.language} 
        openModal={setActiveModal}
      />

      {/* MODALS */}
      <Modal 
        isOpen={activeModal === 'contract'} 
        onClose={() => setActiveModal(null)}
        title={t('contract.title')}
      >
        <div className="space-y-8">
          <div className="bg-pepe-yellow/10 border-4 border-pepe-black rounded-[2rem] p-8 text-center relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-pepe-yellow opacity-10 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
            <h4 className="text-xl font-black mb-4 uppercase text-gray-500">{t('contract.copy_address')}</h4>
            <div className="flex items-center justify-between bg-white border-4 border-pepe-black rounded-2xl p-4 shadow-[6px_6px_0_0_rgba(10,10,10,1)] hover:translate-x-1 hover:translate-y-1 hover:shadow-none transition-all">
              <code className="text-lg font-black truncate mr-4">0x1234...5678</code>
              <button 
                onClick={copyAddress}
                className={`p-3 rounded-xl transition-all ${copied ? 'bg-pepe-green text-white' : 'bg-pepe-pink text-white hover:scale-110'}`}
              >
                {copied ? <Check size={24} strokeWidth={3} /> : <Copy size={24} strokeWidth={3} />}
              </button>
            </div>
            {copied && <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 text-pepe-green font-black">{t('contract.copied')}</motion.p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-pepe-pink/5 border-4 border-pepe-black rounded-[2rem] p-6 text-center shadow-[8px_8px_0_0_rgba(10,10,10,1)] hover:-translate-y-1 transition-all">
              <Lock className="mx-auto mb-4 text-pepe-pink" size={40} strokeWidth={3} />
              <h5 className="text-lg font-black uppercase mb-1">{t('contract.locked_liquidity')}</h5>
              <p className="text-2xl font-black text-pepe-pink italic">{t('contract.duration')}</p>
            </div>
            <div className="bg-pepe-green/5 border-4 border-pepe-black rounded-[2rem] p-6 text-center shadow-[8px_8px_0_0_rgba(10,10,10,1)] hover:-translate-y-1 transition-all">
              <Shield className="mx-auto mb-4 text-pepe-green" size={40} strokeWidth={3} />
              <h5 className="text-lg font-black uppercase mb-1">{t('contract.locked_team')}</h5>
              <p className="text-2xl font-black text-pepe-green italic">{t('contract.duration')}</p>
            </div>
          </div>
        </div>
      </Modal>

      <Modal 
        isOpen={activeModal === 'audit'} 
        onClose={() => setActiveModal(null)}
        title={t('audit.title')}
      >
        <div className="text-center space-y-8">
          <div className="w-32 h-32 bg-pepe-green rounded-full border-4 border-pepe-black flex items-center justify-center mx-auto shadow-[8px_8px_0_0_rgba(10,10,10,1)]">
            <Shield size={60} strokeWidth={3} className="text-white" />
          </div>
          <div className="space-y-4">
            <span className="bg-pepe-green text-white px-6 py-2 rounded-full font-black uppercase text-sm border-2 border-pepe-black">
              {t('audit.status')}
            </span>
            <p className="text-xl font-bold text-gray-700 leading-relaxed">
              {t('audit.desc')}
            </p>
          </div>
          <Button variant="primary" className="w-full py-6 text-2xl group shadow-[8px_8px_0_0_rgba(10,10,10,1)]">
            {t('audit.button')}
            <ExternalLink className="ml-3 group-hover:rotate-12 transition-transform" size={24} strokeWidth={3} />
          </Button>
        </div>
      </Modal>

      <Modal 
        isOpen={activeModal === 'tokenomics'} 
        onClose={() => setActiveModal(null)}
        title={t('tokenomics.distribution_title' || 'Detailed Tokenomics')}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left rtl:text-right border-collapse">
            <thead>
              <tr className="bg-pepe-yellow/20">
                <th className="p-4 border-4 border-pepe-black font-black uppercase italic">{t('tokenomics.table_header_category' || 'Category')}</th>
                <th className="p-4 border-4 border-pepe-black font-black uppercase italic">{t('tokenomics.table_header_percentage' || 'Percentage')}</th>
                <th className="p-4 border-4 border-pepe-black font-black uppercase italic">{t('tokenomics.table_header_amount' || 'Amount')}</th>
              </tr>
            </thead>
            <tbody className="font-bold">
              {[
                { cat: 'Presale', pct: '40%', amt: '400,000,000' },
                { cat: 'Liquidity', pct: '30%', amt: '300,000,000' },
                { cat: 'Staking', pct: '15%', amt: '150,000,000' },
                { cat: 'Team', pct: '10%', amt: '100,000,000' },
                { cat: 'Marketing', pct: '5%', amt: '50,000,000' },
              ].map((row, i) => (
                <tr key={i} className="hover:bg-pepe-pink/5 transition-colors">
                  <td className="p-4 border-4 border-pepe-black uppercase">{row.cat}</td>
                  <td className="p-4 border-4 border-pepe-black text-pepe-pink">{row.pct}</td>
                  <td className="p-4 border-4 border-pepe-black">{row.amt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-8 text-gray-600 font-bold italic text-center">
          {t('tokenomics.total_supply' || 'Total Supply: 1,000,000,000 $PWIFE')}
        </p>
      </Modal>

      {/* MOBILE MENU */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: isRTL ? '-100%' : '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isRTL ? '-100%' : '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-[60] bg-pepe-yellow flex flex-col items-center justify-center space-y-8 md:hidden text-pepe-black"
          >
            <button onClick={() => setIsMobileMenuOpen(false)} className="absolute top-6 right-6 hover:rotate-90 transition-transform">
              <X size={40} strokeWidth={3} />
            </button>
            <nav className="flex flex-col items-center space-y-6">
              {['home', 'tokenomics', 'roadmap', 'faq', 'about'].map((item) => (
                <a key={item} href={`#${item === 'home' ? '' : item}`} className="text-3xl font-black uppercase hover:text-pepe-pink transition-colors" onClick={() => setIsMobileMenuOpen(false)}>
                  {t(`nav.${item}`)}
                </a>
              ))}
            </nav>
            <div className="flex space-x-4 space-x-reverse">
              {['en', 'ar', 'fr'].map((lang) => (
                <button 
                  key={lang}
                  onClick={() => changeLanguage(lang)}
                  className={`px-4 py-2 rounded-xl font-black uppercase border-2 border-pepe-black ${i18n.language === lang ? 'bg-pepe-pink text-white' : 'bg-white'}`}
                >
                  {lang}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main>
        <HeroSection t={t} />
        <BuyBoxSection t={t} openModal={setActiveModal} />
        <TokenomicsSection t={t} openModal={setActiveModal} />
        <WhyBuySection t={t} />
        <RiskWarningSection t={t} />
      </main>

      <Footer t={t} />
    </div>
  );
}

const Navbar = ({ isOpen, setIsOpen, changeLanguage, t, currentLng, openModal }) => {
  return (
    <nav className="fixed top-4 left-4 right-4 z-50 rounded-[2rem] border-4 border-pepe-black shadow-[0_8px_0_0_rgba(10,10,10,1)] overflow-hidden h-20">
      {/* Customizable Background */}
      <div className="absolute inset-0 z-0">
        {ASSETS.NAVBAR_BACKGROUND_IMAGE === '/assets/navbar-bg.png' ? (
          <div className="w-full h-full bg-white" />
        ) : (
          <img src={ASSETS.NAVBAR_BACKGROUND_IMAGE} alt="Nav BG" className="w-full h-full object-cover" />
        )}
      </div>

      <div className="relative z-10 h-full px-8 flex items-center justify-between">
        <div className="flex items-center space-x-3 space-x-reverse">
          <img src={ASSETS.HERO_CHARACTER_IMAGE} alt="PW" className="w-12 h-12 object-contain" />
          <span className="text-2xl font-black text-pepe-black uppercase hidden sm:block">Pepe Wife</span>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center space-x-6 space-x-reverse">
          {['home', 'tokenomics', 'faq', 'about'].map((item) => (
            <a key={item} href={`#${item === 'home' ? '' : item}`} className="text-pepe-black font-black uppercase tracking-tight hover:text-pepe-pink transition-all hover:-translate-y-1">
              {t(`nav.${item}`)}
            </a>
          ))}
          <button 
            onClick={() => openModal('contract')}
            className="text-pepe-black font-black uppercase tracking-tight hover:text-pepe-pink transition-all hover:-translate-y-1"
          >
            {t('nav.contract')}
          </button>
        </div>

        <div className="flex items-center space-x-4 space-x-reverse">
          {/* Language Switcher */}
          <div className="hidden sm:flex bg-pepe-black/10 p-1 rounded-xl border-2 border-pepe-black/20">
            {['en', 'ar', 'fr'].map((lang) => (
              <button 
                key={lang}
                onClick={() => changeLanguage(lang)}
                className={`px-3 py-1 rounded-lg text-xs font-black uppercase transition-all ${currentLng === lang ? 'bg-pepe-pink text-white shadow-md' : 'text-pepe-black/60 hover:text-pepe-black'}`}
              >
                {lang}
              </button>
            ))}
          </div>

          <Button 
            variant="primary" 
            className="py-2 px-6 text-sm hidden lg:flex"
            onClick={() => openModal('audit')}
          >
            {t('buybox.audit')}
          </Button>

          {/* Mobile Toggle */}
          <button className="md:hidden text-pepe-black hover:scale-110 transition-transform" onClick={() => setIsOpen(!isOpen)}>
            <Menu size={32} strokeWidth={3} />
          </button>
        </div>
      </div>
    </nav>
  );
};

const HeroSection = ({ t }) => {
  return (
    <section className="relative min-h-screen flex items-center pt-32 pb-20 overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-20">
        <img src={ASSETS.HERO_BACKGROUND_IMAGE} alt="Hero BG" className="w-full h-full object-cover" />
      </div>

      <div className="section-container relative z-10 w-full grid md:grid-cols-2 gap-16 items-center">
        <div className="order-2 md:order-2 flex justify-center items-center">
          <motion.div 
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="relative w-full max-w-lg aspect-square"
          >
            <img src={ASSETS.HERO_CHARACTER_IMAGE} alt="Pepe Wife" className="w-full h-full object-contain drop-shadow-[20px_20px_0px_rgba(10,10,10,0.5)]" />
          </motion.div>
        </div>

        <div className="order-1 md:order-1 flex flex-col items-center md:items-start text-center md:text-left space-y-8">
          <motion.div initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }}>
            <span className="btn-secondary py-2 px-6 text-sm mb-6 inline-block rotate-[-2deg]">{t('hero.badge')}</span>
            <h1 className="text-6xl md:text-9xl font-black tracking-tighter leading-[0.85] mb-8 text-pepe-black drop-shadow-[8px_8px_0px_rgba(255,255,255,0.5)] uppercase">
              {t('hero.title_meet')} <span className="text-pepe-green">{t('hero.title_pepe')}</span><br />
              <span className="text-pepe-pink">{t('hero.title_wife')}</span>
            </h1>
            <p className="text-xl md:text-2xl font-bold text-gray-600 max-w-xl leading-snug mb-10">
              {t('hero.desc')}
            </p>
            <div className="flex flex-col sm:flex-row gap-6">
              <Button variant="outline" className="group">
                <Download size={24} strokeWidth={3} className="mr-3 group-hover:bounce" />
                {t('hero.whitepaper')}
              </Button>
              <Button variant="primary" className="group">
                {t('hero.join_presale')}
                <ArrowRight size={24} strokeWidth={3} className="ml-3 group-hover:translate-x-2 transition-transform rtl:rotate-180 rtl:group-hover:-translate-x-2" />
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const BuyBoxSection = ({ t, openModal }) => {
  const [amount, setAmount] = useState('');
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="section-container">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ y: 50, opacity: 0 }} whileInView={{ y: 0, opacity: 1 }} className="cartoon-card relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-pepe-pink opacity-10 rounded-full -mr-20 -mt-20" />
            
            <div className="text-center mb-12">
              <h2 className="text-5xl font-black text-pepe-black mb-4 uppercase italic tracking-tight">{t('buybox.title')}</h2>
              <p className="text-gray-600 text-xl font-bold">{t('buybox.desc')}</p>
            </div>

            <div className="flex justify-center mb-12">
              <div className="bg-pepe-yellow/20 border-4 border-pepe-black px-10 py-6 rounded-[2rem] flex items-center space-x-6 space-x-reverse transform rotate-1">
                <div className="w-16 h-16 bg-pepe-yellow rounded-2xl border-4 border-pepe-black flex items-center justify-center text-pepe-black font-black text-3xl shadow-[4px_4px_0px_0px_rgba(10,10,10,1)]">
                  {ASSETS.COIN_ICON === '/assets/coin-icon.png' ? '$' : <img src={ASSETS.COIN_ICON} className="w-full h-full object-cover rounded-xl" />}
                </div>
                <div>
                  <div className="text-xs text-pepe-black font-black uppercase tracking-[0.2em]">{t('buybox.current_price')}</div>
                  <div className="text-3xl font-black text-pepe-black tracking-tight">1 $PWIFE = 0.00012 USDT</div>
                </div>
              </div>
            </div>

            <div className="space-y-8 max-w-2xl mx-auto">
              <div className="relative group">
                <input 
                  type="number" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={t('buybox.input_placeholder')}
                  className="w-full bg-white border-4 border-pepe-black rounded-[1.5rem] px-8 py-6 text-2xl font-black outline-none transition-all placeholder:text-gray-400 text-center shadow-[6px_6px_0px_0px_rgba(10,10,10,1)] focus:translate-x-[2px] focus:translate-y-[2px] focus:shadow-[4px_4px_0px_0px_rgba(10,10,10,1)]"
                />
              </div>

              <div className="flex flex-col space-y-6">
                <Button variant="primary" className="w-full py-6 text-3xl shadow-[8px_8px_0px_0px_rgba(10,10,10,1)]">
                  {t('buybox.buy_now')}
                </Button>
                
                <div className="grid grid-cols-2 gap-6">
                  <Button variant="secondary" className="py-5 text-xl">
                    {t('buybox.how_to_buy')}
                  </Button>
                  <Button variant="outline" className="py-5 text-xl" onClick={() => openModal('audit')}>
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
    { label: 'Presale', percentage: 40, color: 'bg-pepe-pink' },
    { label: 'Liquidity', percentage: 30, color: 'bg-pepe-green' },
    { label: 'Staking', percentage: 15, color: 'bg-pepe-yellow' },
    { label: 'Team', percentage: 10, color: 'bg-pepe-black' },
    { label: 'Marketing', percentage: 5, color: 'bg-white' },
  ];

  return (
    <section id="tokenomics" className="py-24 bg-pepe-yellow/5">
      <div className="section-container">
        <div className="text-center mb-16">
          <h2 className="text-7xl font-black uppercase italic drop-shadow-[6px_6px_0px_rgba(10,10,10,1)]">{t('tokenomics.title')}</h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div className="cartoon-card p-10">
              <h3 className="text-3xl font-black uppercase mb-8 italic">{t('tokenomics.distribution_title' || 'Token Distribution')}</h3>
              <div className="space-y-6">
                {distribution.map((item, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex justify-between font-black uppercase italic">
                      <span>{item.label}</span>
                      <span>{item.percentage}%</span>
                    </div>
                    <div className="h-6 w-full bg-gray-200 border-4 border-pepe-black rounded-full overflow-hidden shadow-[4px_4px_0_0_rgba(10,10,10,1)]">
                      <motion.div 
                        initial={{ width: 0 }}
                        whileInView={{ width: `${item.percentage}%` }}
                        transition={{ duration: 1, delay: idx * 0.1 }}
                        className={`h-full ${item.color}`}
                      />
                    </div>
                  </div>
                ))}
              </div>
              <Button 
                variant="primary" 
                className="w-full mt-10 py-4 text-xl shadow-[6px_6px_0_0_rgba(10,10,10,1)]"
                onClick={() => openModal('tokenomics')}
              >
                {t('tokenomics.details_button' || 'Detailed Tokenomics')}
              </Button>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute -inset-4 bg-pepe-pink opacity-10 blur-2xl group-hover:opacity-20 transition-opacity" />
            <div className="relative cartoon-card p-4 aspect-square flex items-center justify-center overflow-hidden">
              <img 
                src={ASSETS.HERO_CHARACTER_IMAGE} 
                alt="Tokenomics Illustration" 
                className="w-full h-full object-contain transform group-hover:scale-110 transition-transform duration-500"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

const WhyBuySection = ({ t }) => (
  <section id="about" className="relative py-32 overflow-hidden">
    <div className="absolute inset-0 z-0 opacity-10">
      <img src={ASSETS.WHY_BUY_BG} alt="Why Buy BG" className="w-full h-full object-cover" />
    </div>
    <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] z-[1]" />

    <div className="section-container relative z-10">
      <div className="grid lg:grid-cols-2 gap-20 items-center">
        <div className="space-y-8 text-center lg:text-left rtl:lg:text-right">
          <span className="btn-secondary py-2 px-6 rotate-[-3deg] inline-block">{t('whybuy.badge')}</span>
          <h2 className="text-7xl font-black uppercase italic leading-[0.9] drop-shadow-[8px_8px_0px_rgba(10,10,10,1)]">
            {t('whybuy.title_why')} <br /><span className="text-pepe-green">{t('whybuy.title_pepewife')}</span>
          </h2>
          <p className="text-2xl font-bold text-gray-700 leading-snug max-w-2xl mx-auto lg:mx-0">
            {t('whybuy.desc')}
          </p>
          <Button variant="primary" className="text-2xl py-6 shadow-[8px_8px_0_0_rgba(10,10,10,1)]">{t('whybuy.cta')}</Button>
        </div>

        <div className="grid gap-8">
          {[1, 2, 3].map(i => (
            <motion.div key={i} initial={{ x: 50, opacity: 0 }} whileInView={{ x: 0, opacity: 1 }} className="cartoon-card flex items-center p-8 space-x-8 space-x-reverse">
              <div className="w-20 h-20 bg-pepe-yellow rounded-[1.5rem] border-4 border-pepe-black flex items-center justify-center shrink-0 shadow-[4px_4px_0px_0px_rgba(10,10,10,1)]">
                {i === 1 ? <Rocket size={40} strokeWidth={3} /> : i === 2 ? <Globe size={40} strokeWidth={3} /> : <Shield size={40} strokeWidth={3} />}
              </div>
              <div className="text-right">
                <h3 className="text-2xl font-black uppercase italic mb-2">{t(`whybuy.reason${i}_title`)}</h3>
                <p className="text-gray-600 font-bold">{t(`whybuy.reason${i}_desc`)}</p>
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
    <div className="absolute inset-0 z-0 opacity-10">
      <img src={ASSETS.RISK_WARNING_BACKGROUND} alt="Risk" className="w-full h-full object-cover" />
    </div>

    <div className="section-container relative z-20">
      <div className="cartoon-card max-w-5xl mx-auto text-center transform rotate-1 bg-white">
        <Shield size={100} strokeWidth={3} className="text-pepe-pink mx-auto mb-8 animate-pulse" />
        <h2 className="text-6xl font-black uppercase italic mb-10 tracking-tight">{t('risk.title')}</h2>
        <div className="space-y-8 text-xl font-bold text-gray-700 leading-relaxed">
          <p>{t('risk.p1')}</p>
          <p>{t('risk.p2')}</p>
        </div>
      </div>
    </div>
  </section>
);

const Footer = ({ t }) => (
  <footer className="bg-white py-24 border-t-8 border-pepe-black">
    <div className="section-container">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-24 text-center md:text-left rtl:md:text-right">
        <div className="md:col-span-1 space-y-8">
          <div className="flex items-center justify-center md:justify-start space-x-3 space-x-reverse">
            <img src={ASSETS.HERO_CHARACTER_IMAGE} alt="PW" className="w-16 h-16 object-contain" />
            <span className="text-4xl font-black uppercase">Pepe Wife</span>
          </div>
          <p className="text-xl font-bold text-gray-500">{t('footer.desc')}</p>
        </div>

        {['links', 'community', 'legal'].map(cat => (
          <div key={cat}>
            <h4 className="text-2xl font-black uppercase italic text-pepe-pink mb-10 drop-shadow-[2px_2px_0px_rgba(10,10,10,1)]">{t(`footer.${cat}_title`)}</h4>
            <ul className="space-y-6 text-lg font-black uppercase text-gray-700">
              {cat === 'links' ? ['presale', 'tokenomics', 'roadmap', 'whitepaper'].map(l => <li key={l}><a href="#" className="hover:text-pepe-green transition-all">{t(`nav.${l}` === 'nav.presale' ? 'nav.home' : `nav.${l}`)}</a></li>) :
               cat === 'community' ? ['Twitter (X)', 'Telegram', 'Instagram', 'Discord'].map(l => <li key={l}><a href="#" className="hover:text-pepe-green transition-all">{l}</a></li>) :
               ['Terms', 'Privacy', 'Risk'].map(l => <li key={l}><a href="#" className="hover:text-pepe-green transition-all">{l}</a></li>)}
            </ul>
          </div>
        ))}
      </div>
      <div className="pt-16 border-t-4 border-pepe-black flex flex-col md:flex-row justify-between items-center gap-8 opacity-60">
        <p className="text-sm font-black uppercase tracking-[0.3em] text-pepe-black">{t('footer.rights')}</p>
        <p className="text-sm font-black uppercase tracking-[0.3em] text-pepe-black">{t('footer.built_with')}</p>
      </div>
    </div>
  </footer>
);

export default App;
