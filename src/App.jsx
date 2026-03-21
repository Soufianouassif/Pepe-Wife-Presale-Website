import React, { useState, useEffect } from 'react';
import { Menu, X, Rocket, Info, Shield, Map, HelpCircle, ArrowRight, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ASSET PLACEHOLDERS
const ASSETS = {
  HERO_BACKGROUND_IMAGE: '/assets/hero-bg.png',
  HERO_CHARACTER_IMAGE: '/assets/hero-character.png',
  TOKENOMICS_FULL_IMAGE: '/assets/tokenomics.png',
  RISK_WARNING_BACKGROUND: '/assets/risk-bg.png',
  OPTIONAL_SECTION_BACKGROUND_1: '/assets/section-bg-1.png',
  OPTIONAL_SECTION_BACKGROUND_2: '/assets/section-bg-2.png',
  CUSTOM_BUTTON_IMAGE_PRIMARY: '/assets/btn-primary.png',
  CUSTOM_BUTTON_IMAGE_SECONDARY: '/assets/btn-secondary.png',
  COIN_ICON: '/assets/coin-icon.png',
};

const Button = ({ variant = 'primary', children, className = '', ...props }) => {
  const isCustom = variant === 'primary' 
    ? ASSETS.CUSTOM_BUTTON_IMAGE_PRIMARY !== '[PUT_IMAGE_NAME_HERE]'
    : ASSETS.CUSTOM_BUTTON_IMAGE_SECONDARY !== '[PUT_IMAGE_NAME_HERE]';
    
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-pepe-black text-white font-sans selection:bg-pepe-pink selection:text-white" dir="rtl" lang="ar">
      {/* 1. NAVBAR */}
      <Navbar isOpen={isMobileMenuOpen} setIsOpen={setIsMobileMenuOpen} />

      {/* MOBILE MENU */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: '100%' }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-40 bg-pepe-black flex flex-col items-center justify-center space-y-8 md:hidden"
          >
            <button onClick={() => setIsMobileMenuOpen(false)} className="absolute top-6 right-6 text-pepe-green hover:text-pepe-pink transition-colors">
              <X size={32} />
            </button>
            <a href="#" className="text-2xl font-bold hover:text-pepe-green transition-colors" onClick={() => setIsMobileMenuOpen(false)}>الرئيسية</a>
            <a href="#tokenomics" className="text-2xl font-bold hover:text-pepe-green transition-colors" onClick={() => setIsMobileMenuOpen(false)}>التوكنز</a>
            <a href="#roadmap" className="text-2xl font-bold hover:text-pepe-green transition-colors" onClick={() => setIsMobileMenuOpen(false)}>خارطة الطريق</a>
            <div className="flex flex-col space-y-4 w-full px-12">
              <Button variant="secondary" className="w-full">الورقة البيضاء</Button>
              <Button variant="primary" className="w-full">انضم للبيع المسبق</Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main>
        {/* 2. HERO SECTION */}
        <HeroSection />

        {/* 3. TOKEN SALE / BUY BOX SECTION */}
        <BuyBoxSection />

        {/* 4. TOKENOMICS SECTION */}
        <TokenomicsSection />

        {/* 5. ROADMAP SECTION */}
        <RoadmapSection />

        {/* 6. WHY BUY PEPE WIFE SECTION */}
        <WhyBuySection />

        {/* 7. RISK WARNING SECTION */}
        <RiskWarningSection />
      </main>

      {/* 8. FOOTER */}
      <Footer />
    </div>
  );
}

const Navbar = ({ isOpen, setIsOpen }) => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-pepe-black/80 backdrop-blur-md border-b border-pepe-green/20">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <div className="flex items-center space-x-2 space-x-reverse">
          <div className="w-10 h-10 bg-pepe-green rounded-full flex items-center justify-center text-pepe-black font-black italic">PW</div>
          <span className="text-xl font-black tracking-tighter text-pepe-green uppercase">Pepe Wife</span>
        </div>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center space-x-8 space-x-reverse">
          <button className="text-sm font-bold uppercase tracking-widest hover:text-pepe-pink transition-colors">الورقة البيضاء</button>
          <Button variant="primary" className="py-2 px-6 text-sm">انضم للبيع المسبق</Button>
        </div>

        {/* Mobile Toggle */}
        <button className="md:hidden text-pepe-green hover:text-pepe-pink transition-colors" onClick={() => setIsOpen(!isOpen)}>
          <Menu size={28} />
        </button>
      </div>
    </nav>
  );
};

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background Placeholder */}
      <div className="absolute inset-0 z-0 opacity-40">
        <div className="absolute inset-0 bg-gradient-to-l from-pepe-black via-pepe-black/60 to-transparent z-10" />
        {ASSETS.HERO_BACKGROUND_IMAGE === '[PUT_IMAGE_NAME_HERE]' ? (
          <div className="w-full h-full bg-pepe-dark-gray flex items-center justify-center">
            <span className="text-pepe-green/20 text-4xl font-bold uppercase tracking-tighter">صورة_الخلفية_للبطل</span>
          </div>
        ) : (
          <img src={ASSETS.HERO_BACKGROUND_IMAGE} alt="Hero BG" className="w-full h-full object-cover" />
        )}
      </div>

      <div className="section-container relative z-10 w-full grid md:grid-cols-2 gap-12 items-center">
        {/* Left Side: Character/Visual (Now Right in RTL) */}
        <div className="order-2 md:order-2 flex justify-center items-center">
          <motion.div 
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="relative w-full max-w-lg aspect-square"
          >
            {ASSETS.HERO_CHARACTER_IMAGE === '[PUT_IMAGE_NAME_HERE]' ? (
              <div className="w-full h-full bg-pepe-green/10 rounded-3xl border-4 border-dashed border-pepe-green/30 flex flex-col items-center justify-center text-pepe-green/40 p-12 text-center">
                <Rocket size={80} className="mb-6 animate-bounce" />
                <span className="text-xl font-bold">صورة_الشخصية</span>
                <p className="text-sm mt-2">استبدلها بصورة شخصية Pepe Wife المتميزة</p>
              </div>
            ) : (
              <img src={ASSETS.HERO_CHARACTER_IMAGE} alt="Pepe Wife Character" className="w-full h-full object-contain drop-shadow-[0_20px_50px_rgba(74,222,128,0.3)]" />
            )}
          </motion.div>
        </div>

        {/* Right Side: Content (Now Left in RTL) */}
        <div className="order-1 md:order-1 flex flex-col items-center md:items-start text-center md:text-right space-y-6">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="md:text-right"
          >
            <span className="px-4 py-1.5 bg-pepe-pink/20 text-pepe-pink text-xs font-black uppercase tracking-[0.2em] rounded-full border border-pepe-pink/30 mb-4 inline-block">ملكة الميمز</span>
            <h1 className="text-5xl md:text-7xl font-black italic tracking-tighter leading-none mb-6">
              قابل <span className="text-pepe-green">PEPE</span><br />
              <span className="text-pepe-pink">WIFE</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-300 max-w-md mr-auto leading-relaxed">
              أكثر بيع مسبق لعملة ميم أناقة وقوة وحداثة في المجرة. انضم للعائلة واركب موجة الملكة المطلقة.
            </p>
            <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-4 mt-8 space-x-reverse">
              <Button variant="secondary" className="group">
                <Download size={18} className="ml-2 group-hover:animate-bounce" />
                الورقة البيضاء
              </Button>
              <Button variant="primary" className="group">
                انضم للبيع المسبق
                <ArrowRight size={18} className="mr-2 rotate-180 group-hover:-translate-x-1 transition-transform" />
              </Button>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const BuyBoxSection = () => {
  const [amount, setAmount] = useState('');
  
  return (
    <section className="bg-pepe-dark-gray/50 py-24 relative overflow-hidden">
      <div className="section-container">
        <div className="max-w-3xl mx-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="bg-pepe-black border-2 border-pepe-green/30 rounded-[2.5rem] p-8 md:p-12 shadow-[0_0_50px_rgba(74,222,128,0.1)] relative overflow-hidden"
          >
            {/* Decorative background element */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-pepe-pink/5 blur-[100px] -z-10" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-pepe-green/5 blur-[100px] -z-10" />

            <div className="text-center mb-10">
              <h2 className="text-3xl font-black italic text-pepe-green mb-2 uppercase tracking-tight">البيع المسبق متاح الآن!</h2>
              <p className="text-gray-400">احصل على توكنات $PWIFE بأقل سعر</p>
            </div>

            {/* Token Price Box */}
            <div className="flex justify-center mb-10">
              <div className="bg-pepe-dark-gray border border-pepe-yellow/30 px-8 py-4 rounded-2xl flex items-center space-x-4 space-x-reverse shadow-inner">
                <div className="w-10 h-10 bg-pepe-yellow rounded-full flex items-center justify-center text-pepe-black font-black overflow-hidden">
                  {ASSETS.COIN_ICON === '[PUT_IMAGE_NAME_HERE]' ? (
                    '$'
                  ) : (
                    <img src={ASSETS.COIN_ICON} alt="Coin" className="w-full h-full object-cover" />
                  )}
                </div>
                <div>
                  <div className="text-[10px] text-pepe-yellow font-black uppercase tracking-widest">السعر الحالي</div>
                  <div className="text-xl font-bold">1 $PWIFE = 0.00012 USDT</div>
                </div>
              </div>
            </div>

            {/* Purchase Input Area */}
            <div className="space-y-6">
              <div className="relative group">
                <input 
                  type="number" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="أدخل كمية USDT"
                  className="w-full bg-pepe-dark-gray border-2 border-pepe-green/20 focus:border-pepe-green rounded-2xl px-6 py-5 text-xl font-bold outline-none transition-all placeholder:text-gray-600 text-center"
                />
                <div className="absolute left-6 top-1/2 -translate-y-1/2 text-pepe-green font-black">USDT</div>
              </div>

              <div className="flex flex-col space-y-4">
                <Button variant="primary" className="w-full py-5 text-xl uppercase italic tracking-tighter group">
                  اشتري $PWIFE الآن
                  <Rocket size={20} className="inline-block mr-3 group-hover:-translate-y-1 group-hover:-translate-x-1 transition-transform" />
                </Button>
                
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="secondary" className="py-4 border-pepe-pink/30 text-pepe-pink hover:bg-pepe-pink/10 flex items-center justify-center space-x-2 space-x-reverse">
                    <HelpCircle size={18} />
                    <span>كيفية الشراء</span>
                  </Button>
                  <button className="py-4 bg-transparent border-2 border-pepe-yellow/30 text-pepe-yellow font-bold rounded-full hover:bg-pepe-yellow/10 transition-all flex items-center justify-center space-x-2 space-x-reverse">
                    <Shield size={18} />
                    <span>التدقيق</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

const TokenomicsSection = () => {
  return (
    <section id="tokenomics" className="py-0 overflow-hidden">
      <div className="w-full bg-pepe-black">
        <div className="max-w-[1920px] mx-auto">
          {ASSETS.TOKENOMICS_FULL_IMAGE === '[PUT_IMAGE_NAME_HERE]' ? (
            <div className="w-full aspect-[21/9] bg-pepe-dark-gray flex flex-col items-center justify-center text-pepe-pink/20 border-y border-pepe-pink/10 p-20">
              <h2 className="text-6xl md:text-8xl font-black italic uppercase mb-4 opacity-30">التوكنز</h2>
              <p className="text-xl font-bold tracking-[0.5em] uppercase">TOKENOMICS_FULL_IMAGE</p>
              <p className="mt-8 text-gray-500 max-w-lg text-center font-medium">هذا هو حاوية الصور كاملة العرض. ستملأ رسم التوكنز المخصص هذه المنطقة تمامًا بدون هوامش.</p>
            </div>
          ) : (
            <img src={ASSETS.TOKENOMICS_FULL_IMAGE} alt="Tokenomics" className="w-full h-auto block" />
          )}
        </div>
      </div>
    </section>
  );
};

const RoadmapSection = () => {
  const phases = [
    { 
      id: '٠١', 
      title: 'وصول الملكة', 
      items: ['تدقيق العقد الذكي', 'إطلاق البيع المسبق', 'الموقع الإلكتروني V1', 'بناء المجتمع'] 
    },
    { 
      id: '٠٢', 
      title: 'توسيع القصر', 
      items: ['الإدراج في المنصات اللامركزية', 'تقديم طلب CMC & CG', 'حملة تسويقية', 'أول إدراج في منصة مركزية'] 
    },
    { 
      id: '٠٣', 
      title: 'السيادة العالمية', 
      items: ['إطلاق التخزين (Staking)', 'الشراكات', 'تسويق المشاهير', 'إدراج في منصات الفئة الأولى'] 
    },
    { 
      id: '٠٤', 
      title: 'إرث الملكة', 
      items: ['مجموعة NFT', 'Pepe Wife DAO', 'متجر البضائع', 'النظام البيئي المستقبلي'] 
    }
  ];

  return (
    <section id="roadmap" className="py-32 bg-pepe-black">
      <div className="section-container">
        <div className="text-center mb-20">
          <span className="text-pepe-yellow font-black tracking-widest uppercase text-xs">رحلتنا</span>
          <h2 className="text-5xl md:text-6xl font-black italic mt-4 uppercase tracking-tighter">خارطة <span className="text-pepe-green">الطريق</span></h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {phases.map((phase, idx) => (
            <motion.div 
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-pepe-dark-gray/50 border border-pepe-green/20 rounded-[2rem] p-8 hover:border-pepe-pink/50 transition-all group text-right"
            >
              <div className="text-4xl font-black text-pepe-green/20 group-hover:text-pepe-pink/40 transition-colors mb-6 italic">{phase.id}</div>
              <h3 className="text-2xl font-black mb-6 uppercase tracking-tight italic group-hover:text-pepe-green transition-colors">{phase.title}</h3>
              <ul className="space-y-4">
                {phase.items.map((item, i) => (
                  <li key={i} className="flex items-start text-gray-400 text-sm font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-pepe-green mt-1.5 ml-3 shrink-0" />
                    {item}
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

const WhyBuySection = () => {
  const reasons = [
    {
      title: 'علامة تجارية متميزة',
      desc: 'تصميم أنيق واحترافي يبرز بين عملات الميم المعتادة.',
      icon: <Rocket className="text-pepe-pink" size={32} />
    },
    {
      title: 'مجتمع قوي',
      desc: 'تركيز على النمو طويل الأمد وبيئة داعمة لحاملي العملة.',
      icon: <Info className="text-pepe-green" size={32} />
    },
    {
      title: 'أمان مثبت',
      desc: 'عقد ذكي مدقق بالكامل مع سيولة مقفلة لراحة بال تامة.',
      icon: <Shield className="text-pepe-yellow" size={32} />
    }
  ];

  return (
    <section className="py-32 bg-pepe-dark-gray/30">
      <div className="section-container">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="text-right">
            <span className="text-pepe-pink font-black tracking-widest uppercase text-xs">قوة الإقناع</span>
            <h2 className="text-5xl md:text-6xl font-black italic mt-4 mb-8 uppercase tracking-tighter leading-none">لماذا تشتري <br /><span className="text-pepe-green">Pepe Wife؟</span></h2>
            <p className="text-gray-400 text-lg mb-10 leading-relaxed max-w-lg mr-0 ml-auto">
              Pepe Wife ليست مجرد عملة ميم أخرى. إنها تعبير عن الأناقة والقوة وتطور نظام Pepe البيئي. لقد بنينا أساسًا مصممًا للنجاح وثروة المجتمع.
            </p>
            <Button variant="primary">تعرف على المزيد عن الملكة</Button>
          </div>

          <div className="grid gap-6">
            {reasons.map((reason, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="bg-pepe-black/50 border border-white/5 p-6 rounded-3xl flex items-start space-x-6 space-x-reverse hover:bg-pepe-black transition-all text-right"
              >
                <div className="bg-pepe-dark-gray p-4 rounded-2xl shadow-lg shrink-0">
                  {reason.icon}
                </div>
                <div>
                  <h3 className="text-xl font-black italic uppercase tracking-tight mb-2">{reason.title}</h3>
                  <p className="text-gray-500 text-sm font-medium">{reason.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const RiskWarningSection = () => {
  return (
    <section className="relative py-32 overflow-hidden">
      {/* Background Placeholder */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-pepe-black/80 z-10" />
        {ASSETS.RISK_WARNING_BACKGROUND === '[PUT_IMAGE_NAME_HERE]' ? (
          <div className="w-full h-full bg-pepe-dark-gray flex items-center justify-center">
            <span className="text-pepe-pink/10 text-4xl font-bold uppercase tracking-widest">خلفية_تحذير_المخاطر</span>
          </div>
        ) : (
          <img src={ASSETS.RISK_WARNING_BACKGROUND} alt="Risk Warning BG" className="w-full h-full object-cover" />
        )}
      </div>

      <div className="section-container relative z-20">
        <div className="max-w-4xl mx-auto bg-pepe-black/40 backdrop-blur-xl border border-white/10 p-10 md:p-16 rounded-[3rem] text-center shadow-2xl">
          <Shield size={64} className="text-pepe-yellow mx-auto mb-8 animate-pulse" />
          <h2 className="text-4xl font-black italic text-white mb-8 uppercase tracking-tighter">تحذير المخاطر</h2>
          <div className="space-y-6 text-gray-300 font-medium leading-relaxed text-sm md:text-base">
            <p>
              تنطوي الاستثمارات في العملات الرقمية على مخاطر عالية. مشروع Pepe Wife ($PWIFE) هو مشروع عملة ميم تم إنشاؤه لأغراض الترفيه والمجتمع. لا يوجد ضمان للربح، ويجب ألا تستثمر أبدًا أموالاً لا يمكنك تحمل خسارتها.
            </p>
            <p>
              يرجى إجراء بحثك الشامل قبل المشاركة في البيع المسبق. سوق عملات الميم شديد التقلب. من خلال المشاركة، فإنك تقر بالمخاطر المعنية وتوافق على أن فريق المشروع غير مسؤول عن أي خسائر مالية.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};

const Footer = () => {
  return (
    <footer className="bg-pepe-black border-t border-pepe-green/10 pt-24 pb-12">
      <div className="section-container">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20 text-right">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center space-x-2 space-x-reverse mb-8">
              <div className="w-10 h-10 bg-pepe-green rounded-full flex items-center justify-center text-pepe-black font-black italic">PW</div>
              <span className="text-2xl font-black tracking-tighter text-pepe-green uppercase">Pepe Wife</span>
            </div>
            <p className="text-gray-500 text-sm font-medium leading-relaxed mb-8">
              الملكة الأكثر أناقة في عالم الكريبتو. انضم إلى التطور وكن جزءًا من العائلة الملكية.
            </p>
          </div>

          <div>
            <h4 className="text-pepe-pink font-black uppercase tracking-widest text-xs mb-8">روابط سريعة</h4>
            <ul className="space-y-4 text-sm font-bold uppercase tracking-tight text-gray-400">
              <li><a href="#" className="hover:text-pepe-green transition-colors">البيع المسبق</a></li>
              <li><a href="#tokenomics" className="hover:text-pepe-green transition-colors">التوكنز</a></li>
              <li><a href="#roadmap" className="hover:text-pepe-green transition-colors">خارطة الطريق</a></li>
              <li><a href="#" className="hover:text-pepe-green transition-colors">الورقة البيضاء</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-pepe-yellow font-black uppercase tracking-widest text-xs mb-8">المجتمع</h4>
            <ul className="space-y-4 text-sm font-bold uppercase tracking-tight text-gray-400">
              <li><a href="#" className="hover:text-pepe-green transition-colors">تويتر (X)</a></li>
              <li><a href="#" className="hover:text-pepe-green transition-colors">تليجرام</a></li>
              <li><a href="#" className="hover:text-pepe-green transition-colors">إنستغرام</a></li>
              <li><a href="#" className="hover:text-pepe-green transition-colors">ديسكورد</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-pepe-green font-black uppercase tracking-widest text-xs mb-8">قانوني</h4>
            <ul className="space-y-4 text-sm font-bold uppercase tracking-tight text-gray-400">
              <li><a href="#" className="hover:text-pepe-pink transition-colors">شروط الخدمة</a></li>
              <li><a href="#" className="hover:text-pepe-pink transition-colors">سياسة الخصوصية</a></li>
              <li><a href="#" className="hover:text-pepe-pink transition-colors">إخلاء مسؤولية المخاطر</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-center md:text-right space-y-4 md:space-y-0">
          <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest">
            © ٢٠٢٦ مشروع PEPE WIFE. جميع الحقوق محفوظة.
          </p>
          <p className="text-gray-600 text-[10px] font-black uppercase tracking-widest">
            صنع بكل حب لملكة الكريبتو.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default App;
