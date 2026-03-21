import React, { useState, useEffect } from 'react';
import { Menu, X, Rocket, Info, Shield, Map, HelpCircle, ArrowRight, Download, Globe } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from 'react-i18next';

// ASSET PLACEHOLDERS
const ASSETS = {
  HERO_BACKGROUND_IMAGE: '/assets/hero-bg.png',
  HERO_CHARACTER_IMAGE: '/assets/hero-character.png',
  TOKENOMICS_FULL_IMAGE: '/assets/tokenomics.png',
  RISK_WARNING_BACKGROUND: '/assets/risk-bg.png',
  NAVBAR_BACKGROUND_IMAGE: '/assets/navbar-bg.png', // New customizable background
  CUSTOM_BUTTON_IMAGE_PRIMARY: '/assets/btn-primary.png',
  CUSTOM_BUTTON_IMAGE_SECONDARY: '/assets/btn-secondary.png',
  COIN_ICON: '/assets/coin-icon.png',
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
  const isRTL = i18n.language === 'ar';

  useEffect(() => {
    document.body.dir = isRTL ? 'rtl' : 'ltr';
    localStorage.setItem('i18nextLng', i18n.language);
  }, [i18n.language, isRTL]);

  const changeLanguage = (lng) => {
    i18n.changeLanguage(lng);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className={`min-h-screen bg-pepe-black text-white selection:bg-pepe-pink selection:text-white`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* 1. NAVBAR */}
      <Navbar isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} changeLanguage={changeLanguage} t={t} currentLng={i18n.language} />

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
        <BuyBoxSection t={t} />
        <TokenomicsSection t={t} />
        <RoadmapSection />
        <WhyBuySection t={t} />
        <RiskWarningSection t={t} />
      </main>

      <Footer t={t} />
    </div>
  );
}

const Navbar = ({ isOpen, setIsOpen, changeLanguage, t, currentLng }) => {
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
          <div className="w-12 h-12 bg-pepe-green rounded-2xl border-4 border-pepe-black flex items-center justify-center text-pepe-black font-black text-2xl transform -rotate-3">PW</div>
          <span className="text-2xl font-black text-pepe-black uppercase hidden sm:block">Pepe Wife</span>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center space-x-8 space-x-reverse">
          {['home', 'tokenomics', 'roadmap', 'faq', 'about'].map((item) => (
            <a key={item} href={`#${item === 'home' ? '' : item}`} className="text-pepe-black font-black uppercase tracking-tight hover:text-pepe-pink transition-all hover:-translate-y-1">
              {t(`nav.${item}`)}
            </a>
          ))}
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

          <Button variant="primary" className="py-2 px-6 text-sm hidden lg:flex">
            {t('hero.join_presale')}
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
      <div className="absolute inset-0 z-0 opacity-40">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-pepe-black/20 to-pepe-black z-10" />
        <img src={ASSETS.HERO_BACKGROUND_IMAGE} alt="Hero BG" className="w-full h-full object-cover" />
      </div>

      <div className="section-container relative z-10 w-full grid md:grid-cols-2 gap-16 items-center">
        <div className="order-2 md:order-2 flex justify-center items-center">
          <motion.div 
            animate={{ y: [0, -20, 0] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="relative w-full max-w-lg aspect-square"
          >
            {ASSETS.HERO_CHARACTER_IMAGE === '/assets/hero-character.png' ? (
              <div className="cartoon-card w-full h-full flex flex-col items-center justify-center text-pepe-black/40 text-center">
                <Rocket size={100} strokeWidth={3} className="mb-6" />
                <span className="text-2xl font-black uppercase tracking-widest">HERO_CHARACTER</span>
              </div>
            ) : (
              <img src={ASSETS.HERO_CHARACTER_IMAGE} alt="Pepe Wife" className="w-full h-full object-contain drop-shadow-[20px_20px_0px_rgba(10,10,10,0.5)]" />
            )}
          </motion.div>
        </div>

        <div className="order-1 md:order-1 flex flex-col items-center md:items-start text-center md:text-left space-y-8">
          <motion.div initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }}>
            <span className="btn-secondary py-2 px-6 text-sm mb-6 inline-block rotate-[-2deg]">{t('hero.badge')}</span>
            <h1 className="text-6xl md:text-9xl font-black tracking-tighter leading-[0.85] mb-8 text-white drop-shadow-[8px_8px_0px_rgba(10,10,10,1)] uppercase">
              {t('hero.title_meet')} <span className="text-pepe-green">{t('hero.title_pepe')}</span><br />
              <span className="text-pepe-pink">{t('hero.title_wife')}</span>
            </h1>
            <p className="text-xl md:text-2xl font-bold text-gray-200 max-w-xl leading-snug mb-10">
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

const BuyBoxSection = ({ t }) => {
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
                  <Button variant="outline" className="py-5 text-xl">
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

const TokenomicsSection = ({ t }) => (
  <section id="tokenomics" className="py-24">
    <div className="section-container text-center mb-12">
      <h2 className="text-7xl font-black uppercase italic drop-shadow-[6px_6px_0px_rgba(10,10,10,1)]">{t('tokenomics.title')}</h2>
    </div>
    <div className="w-full bg-pepe-black border-y-8 border-pepe-black">
      <div className="max-w-[1920px] mx-auto overflow-hidden">
        {ASSETS.TOKENOMICS_FULL_IMAGE === '/assets/tokenomics.png' ? (
          <div className="w-full aspect-[21/9] bg-pepe-pink flex flex-col items-center justify-center p-20 border-x-8 border-pepe-black">
             <Rocket size={120} strokeWidth={3} className="text-white mb-8" />
             <p className="text-2xl font-black text-white text-center max-w-2xl uppercase tracking-widest">{t('tokenomics.desc')}</p>
          </div>
        ) : (
          <img src={ASSETS.TOKENOMICS_FULL_IMAGE} alt="Tokenomics" className="w-full h-auto block" />
        )}
      </div>
    </div>
  </section>
);

const RoadmapSection = () => {
  const { t, i18n } = useTranslation();
  const phases = ['phase1', 'phase2', 'phase3', 'phase4'];
  return (
    <section id="roadmap" className="py-32">
      <div className="section-container">
        <div className="text-center mb-24">
          <span className="btn-secondary py-2 px-6 mb-4 inline-block transform -rotate-2">{t('roadmap.badge')}</span>
          <h2 className="text-7xl font-black uppercase italic tracking-tighter mt-4 drop-shadow-[8px_8px_0px_rgba(10,10,10,1)]">
            {t('roadmap.title_project')} <span className="text-pepe-green">{t('roadmap.title_roadmap')}</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {phases.map((phase, idx) => (
            <motion.div key={phase} initial={{ opacity: 0, scale: 0.9 }} whileInView={{ opacity: 1, scale: 1 }} transition={{ delay: idx * 0.1 }} className="cartoon-card group">
              <div className="text-6xl font-black text-pepe-yellow mb-8 italic drop-shadow-[4px_4px_0px_rgba(10,10,10,1)] group-hover:scale-110 transition-transform">{(idx + 1).toLocaleString(i18n.language === 'ar' ? 'ar-EG' : 'en-US')}</div>
              <h3 className="text-2xl font-black mb-8 uppercase italic leading-tight text-pepe-black group-hover:text-pepe-pink transition-colors">{t(`roadmap.${phase}_title`)}</h3>
              <ul className="space-y-4">
                {[1, 2, 3, 4].map(i => (
                  <li key={i} className="flex items-start text-gray-700 font-bold">
                    <div className="w-4 h-4 rounded-full bg-pepe-green border-2 border-pepe-black mt-1.5 mr-3 shrink-0 rtl:mr-0 rtl:ml-3 shadow-[2px_2px_0px_0px_rgba(10,10,10,1)]" />
                    {t(`roadmap.${phase}_item${i}`)}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const WhyBuySection = ({ t }) => (
  <section id="about" className="py-32 bg-pepe-yellow/10">
    <div className="section-container">
      <div className="grid lg:grid-cols-2 gap-20 items-center">
        <div className="space-y-8 text-center lg:text-left rtl:lg:text-right">
          <span className="btn-secondary py-2 px-6 rotate-[-3deg] inline-block">{t('whybuy.badge')}</span>
          <h2 className="text-7xl font-black uppercase italic leading-[0.9] drop-shadow-[8px_8px_0px_rgba(10,10,10,1)]">
            {t('whybuy.title_why')} <br /><span className="text-pepe-green">{t('whybuy.title_pepewife')}</span>
          </h2>
          <p className="text-2xl font-bold text-gray-200 leading-snug max-w-2xl mx-auto lg:mx-0">
            {t('whybuy.desc')}
          </p>
          <Button variant="primary" className="text-2xl py-6">{t('whybuy.cta')}</Button>
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
  <section className="relative py-32 overflow-hidden border-y-8 border-pepe-black">
    <div className="absolute inset-0 z-0">
      <div className="absolute inset-0 bg-pepe-black/80 z-10" />
      <img src={ASSETS.RISK_WARNING_BACKGROUND} alt="Risk" className="w-full h-full object-cover" />
    </div>

    <div className="section-container relative z-20">
      <div className="cartoon-card max-w-5xl mx-auto text-center transform rotate-1">
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
  <footer className="bg-pepe-black py-24 border-t-8 border-pepe-black">
    <div className="section-container">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-24 text-center md:text-left rtl:md:text-right">
        <div className="md:col-span-1 space-y-8">
          <div className="flex items-center justify-center md:justify-start space-x-3 space-x-reverse">
            <div className="w-16 h-16 bg-pepe-green rounded-2xl border-4 border-pepe-black flex items-center justify-center text-pepe-black font-black text-3xl rotate-[-5deg] shadow-[4px_4px_0px_0px_rgba(10,10,10,1)]">PW</div>
            <span className="text-4xl font-black uppercase">Pepe Wife</span>
          </div>
          <p className="text-xl font-bold text-gray-400">{t('footer.desc')}</p>
        </div>

        {['links', 'community', 'legal'].map(cat => (
          <div key={cat}>
            <h4 className="text-2xl font-black uppercase italic text-pepe-pink mb-10 drop-shadow-[2px_2px_0px_rgba(10,10,10,1)]">{t(`footer.${cat}_title`)}</h4>
            <ul className="space-y-6 text-lg font-black uppercase text-gray-300">
              {cat === 'links' ? ['presale', 'tokenomics', 'roadmap', 'whitepaper'].map(l => <li key={l}><a href="#" className="hover:text-pepe-green transition-all">{t(`nav.${l}` === 'nav.presale' ? 'nav.home' : `nav.${l}`)}</a></li>) :
               cat === 'community' ? ['Twitter (X)', 'Telegram', 'Instagram', 'Discord'].map(l => <li key={l}><a href="#" className="hover:text-pepe-green transition-all">{l}</a></li>) :
               ['Terms', 'Privacy', 'Risk'].map(l => <li key={l}><a href="#" className="hover:text-pepe-green transition-all">{l}</a></li>)}
            </ul>
          </div>
        ))}
      </div>
      <div className="pt-16 border-t-4 border-pepe-black flex flex-col md:flex-row justify-between items-center gap-8 opacity-60">
        <p className="text-sm font-black uppercase tracking-[0.3em]">{t('footer.rights')}</p>
        <p className="text-sm font-black uppercase tracking-[0.3em]">{t('footer.built_with')}</p>
      </div>
    </div>
  </footer>
);

export default App;
