import React, { useMemo, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useWallet } from '../context/WalletContext'
import { formatAddress } from '../utils/format'
import LanguageSwitcher from '../components/LanguageSwitcher'
import { Send, Wallet, Menu, Rocket, CircleDollarSign, Copy as IconCopy, Sun, ShieldCheck, Sparkles, Users2, BadgeCheck, X, AlertTriangle, HelpCircle, BarChart3, Route, FileText, BookOpen } from 'lucide-react'
import { TOKENS_PER_USDT } from '../presaleConfig'
import { formatTinyPrice } from '../utils/numberFormatters'

const LandingPageNew = () => {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const { isConnected, address } = useWallet()
  const [amount, setAmount] = useState('2.5')
  const tinyPrice = formatTinyPrice(0.00000005)
  const [currency, setCurrency] = useState('SOL')
  const [error, setError] = useState('')
  const amountInputRef = useRef(null)
  const isRTL = i18n?.language?.startsWith('ar')
  const [activeModal, setActiveModal] = useState(null)
  const [menuOpen, setMenuOpen] = useState(false)
  const tt = (key, en, ar) => {
    const v = t(key)
    return v === key ? (isRTL ? ar : en) : v
  }
  const [openFaq, setOpenFaq] = useState(null)
  const toggleFaq = (idx) => setOpenFaq((prev) => (prev === idx ? null : idx))
  const pwifeAmount = useMemo(() => {
    const parsed = Number(amount)
    if (!Number.isFinite(parsed) || parsed <= 0) return '0'
    return Math.round(parsed * TOKENS_PER_USDT).toLocaleString()
  }, [amount])

  const handleBuyNow = () => {
    if (isConnected) {
      navigate('/dashboard')
      return
    }
    navigate('/connect')
  }
  const handleCopy = async () => {
    const v = isConnected && address ? address : '0x1234567890abcdef1234567890abcdef12345678'
    await navigator.clipboard.writeText(v)
  }

  const sanitizeNumeric = (raw) => {
    let v = (raw || '').replace(/[^\d.]/g, '')
    const firstDot = v.indexOf('.')
    if (firstDot !== -1) {
      v = v.slice(0, firstDot + 1) + v.slice(firstDot + 1).replace(/\./g, '')
    }
    return v
  }
  const sanitizeInteger = (raw) => (raw || '').replace(/[^\d]/g, '')
  const getBounds = (cur) => (cur === 'USDT' ? { min: 100, max: 10000 } : { min: 1, max: 50 })
  const getMinLabel = (cur) => {
    if (cur === 'USDT') {
      return isRTL ? 'الحد الأدنى 100 USDT' : 'Min 100 USDT'
    }
    return isRTL ? 'الحد الأدنى 1.0 SOL' : 'Min 1.0 SOL'
  }
  const validateAndClamp = (val, cur, doClamp) => {
    if (!val) { setError(''); return }
    const num = Number(val)
    const { min, max } = getBounds(cur)
    if (!Number.isFinite(num)) { setError(''); return }
    if (cur === 'USDT' && !Number.isInteger(num)) {
      const msg = 'USDT يقبل الأعداد الصحيحة فقط. الحد الأدنى 100 دولار'
      if (doClamp) {
        const clampedInt = Math.floor(num)
        const bounded = Math.min(Math.max(clampedInt, min), max)
        setAmount(String(bounded))
        setError('')
      } else {
        setError(msg); return
      }
    }
    if (num < min || num > max) {
      const msg = t?.('validation.amount_range') ? t('validation.amount_range', { min, max }) : `Amount must be between ${min} and ${max}`
      if (doClamp) {
        const clamped = Math.min(Math.max(num, min), max)
        setAmount(String(clamped))
        setError('')
      } else {
        setError(msg)
      }
    } else {
      setError('')
    }
  }
  const handleAmountInput = (raw) => {
    const v = currency === 'USDT' ? sanitizeInteger(raw) : sanitizeNumeric(raw)
    setAmount(v)
    if (currency === 'USDT' && raw?.includes('.')) {
      setError('USDT يقبل الأعداد الصحيحة فقط. الحد الأدنى 100 دولار')
    } else {
      validateAndClamp(v, currency, false)
    }
  }

  return (
    <div className="relative min-h-screen bg-[#E8E6D7] text-[#35503A]">
      <header className="w-full h-[86px] bg-[#FCEDE2] border-b border-[rgba(0,0,0,0.08)] shadow-[0_10px_20px_-12px_rgba(92,64,48,0.38)]">
        <div className="max-w-[1200px] mx-auto h-full px-3 lg:px-4 mt-3 flex items-center justify-between shadow-[0_16px_32px_-18px_rgba(53,80,58,0.45)] rounded-2xl">
          <div className="flex items-center gap-3 min-w-0">
            <img src="/assets/hero-character.png" alt="PepeWife" className="w-10 h-10 rounded-full object-cover border border-[#5d7049]" />
            <span className="text-[24px] leading-none font-bold tracking-tight truncate">
              Pepe<span className="text-[#ff4fa3]">Wife</span>
            </span>
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <button onClick={handleBuyNow} className="relative overflow-hidden hidden md:inline-flex items-center gap-2 h-10 w-[200px] px-4 rounded-full border border-[#2f5e3f] bg-gradient-to-b from-[#2f6b3e] to-[#285b38] text-white text-[12px] font-mono font-medium whitespace-nowrap">
              <Wallet size={16} />
              <span className="relative z-10">{isConnected ? formatAddress(address) : t('nav.wallet.connect')}</span>
              <span aria-hidden="true" className="absolute inset-0 bg-gradient-to-b from-white/10 to-transparent"></span>
            </button>
            <LanguageSwitcher className="hidden sm:flex" />
            <button
              onClick={() => setMenuOpen(v => !v)}
              aria-haspopup="menu"
              aria-expanded={menuOpen ? 'true' : 'false'}
              aria-label={menuOpen ? (isRTL ? 'أغلق القائمة' : 'Close menu') : (isRTL ? 'افتح القائمة' : 'Open menu')}
              className="w-10 h-10 rounded-xl border border-[#b7ae90] bg-[#FCEDE2] text-[20px] leading-none inline-flex items-center justify-center"
            >
              {menuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>
      </header>
      {menuOpen && (
        <div className="fixed inset-0 z-50" onClick={() => setMenuOpen(false)}>
          <div
            className={`absolute top-[86px] ${isRTL ? 'left-0' : 'right-0'} h-full w-[86%] sm:w-[340px] bg-[#FCEDE2] border border-[#d2cab1] shadow-[0_0_0_1px_rgba(120,86,68,0.06),0_10px_24px_-8px_rgba(120,86,68,0.22)] overflow-y-auto`}
            style={{ height: 'calc(100% - 86px)' }}
            onClick={(e) => e.stopPropagation()}
            role="menu"
            aria-label="Main menu"
          >
            <div className="px-4 py-4 flex items-center justify-center gap-2 bg-[#2f6b3e] border-b border-[#d2cab1]">
              <img src="/assets/hero-character.png" alt="PepeWife" className="w-7 h-7 rounded-full border border-white/40 object-cover" />
              <span className="text-[16px] font-bold text-white tracking-wide">
                Pepe<span className="text-[#ff4fa3]">Wife</span>
              </span>
            </div>
            <nav className="p-4 space-y-3">
              {[
                { href: '#home', label: t('nav.home'), klass: 'border-[#d2cab1] bg-white text-[#35503A] hover:bg-[#FCEDE2]' },
                { href: '#buy', label: tt('buy.title','Buy PWIFE','شراء PWIFE'), klass: 'border-[#2f5e3f] bg-[#2f6b3e] text-white hover:bg-[#2b613a]' },
                { href: '#tokenomics', label: t('nav.tokenomics'), klass: 'border-[#d2cab1] bg-white text-[#35503A] hover:bg-[#FCEDE2]' },
                { href: '#whybuy', label: t('whybuy.title_why'), klass: 'border-[#d2cab1] bg-white text-[#35503A] hover:bg-[#FCEDE2]', modal: 'whybuy' },
                { href: '#faq', label: t('nav.faq'), klass: 'border-[#d2cab1] bg-white text-[#35503A] hover:bg-[#FCEDE2]' },
              ].map((item, i) => (
                <a
                  key={i}
                  href={item.href}
                  onClick={(e) => {
                    if (item.modal) {
                      e.preventDefault()
                      setMenuOpen(false)
                      setActiveModal(item.modal)
                    } else {
                      setMenuOpen(false)
                    }
                  }}
                  className={`block px-4 py-3 rounded-[12px] border text-[13px] font-mono font-bold transition-colors ${item.klass}`}
                  role="menuitem"
                >
                  {item.label}
                </a>
              ))}
            </nav>
          </div>
        </div>
      )}

      <section id="home" className="relative w-full overflow-hidden border-y border-[#c6bd9f]">
        <img src="/assets/hero-section.svg" alt="Hero" className="w-full h-auto min-h-[320px] md:min-h-[520px] object-cover block" />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
          <h1 className="font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.45)] text-[28px] sm:text-[42px] lg:text-[64px] leading-[1.1] break-words max-w-[1100px]">
            BE EARLY.. OR CRY LATER
          </h1>
          <p className="mt-3 font-normal text-pepe-green drop-shadow-[0_1px_3px_rgba(0,0,0,0.45)] text-[14px] sm:text-[18px] lg:text-[28px] leading-[1.4] break-words max-w-[900px]">
            {t('hero.desc')}
          </p>
          <button onClick={handleBuyNow} className="mt-5 h-11 px-8 rounded-full border-2 border-[#2e5d3e] bg-[#2f6b3e] text-white text-[14px] sm:text-[16px] font-mono font-medium whitespace-nowrap inline-flex items-center gap-2">
            <Rocket size={16} />
            <span>{t('hero.join_presale')}</span>
          </button>
          <div className="mt-6 text-center">
            <p className="text-white/90 text-[14px] sm:text-[16px] font-bold tracking-wide">JOIN $PWIFE Community</p>
            <div className="mt-3 flex items-center gap-3">
              <a
                href="https://x.com"
                target="_blank"
                rel="noreferrer"
                className="h-10 px-4 rounded-full border border-white/60 bg-black text-white text-[13px] font-mono hover:bg-black/90"
              >
                <span className="inline-flex items-center gap-2">
                  <img src="/assets/twitter.png" alt="Twitter" className="h-4 w-4" />
                  X (Twitter)
                </span>
              </a>
              <a href="https://t.me" target="_blank" rel="noreferrer" className="h-10 px-4 rounded-full border border-white/60 bg-white/20 backdrop-blur-sm text-white text-[13px] font-mono hover:bg-white/30">
                <span className="inline-flex items-center gap-2">
                  <Send size={16} />
                  Telegram
                </span>
              </a>
            </div>
          </div>
        </div>
        {activeModal && (
          <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
            <div className="w-full max-w-3xl rounded-[18px] border border-[#d2cab1] bg-[#FCEDE2] shadow-[0_0_0_1px_rgba(120,86,68,0.06),0_10px_24px_-8px_rgba(120,86,68,0.22)] overflow-hidden">
              <div className="px-5 py-3 flex items-center justify-between bg-white border-b border-[#d2cab1]">
                <p className="text-[16px] font-bold text-[#35503A]">
                  {activeModal==='whybuy' && (
                    <span>
                      {t('whybuy.title_why')} Pepe<span className="text-[#ff4fa3]">Wife?</span>
                    </span>
                  )}
                  {activeModal==='audit' && t('audit.title')}
                  {activeModal==='featured' && t('featured.title')}
                  {activeModal==='partners' && t('partners.title')}
                </p>
                <button onClick={() => setActiveModal(null)} className="h-9 w-9 rounded-lg border border-[#d2cab1] bg-white text-[#35503A] flex items-center justify-center">
                  <X size={18} />
                </button>
              </div>
              <div className="p-5 bg-[#FCEDE2]">
                {activeModal==='whybuy' && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[
                      { title: t('whybuy.reason1_title'), desc: t('whybuy.reason1_desc'), Icon: BadgeCheck },
                      { title: t('whybuy.reason2_title'), desc: t('whybuy.reason2_desc'), Icon: Users2 },
                      { title: t('whybuy.reason3_title'), desc: t('whybuy.reason3_desc'), Icon: ShieldCheck },
                    ].map((r, i) => (
                      <article key={i} className="bg-white rounded-[16px] border border-[#d2cab1] p-4 shadow-[0_0_0_1px_rgba(120,86,68,0.06),0_10px_24px_-8px_rgba(120,86,68,0.18)]">
                        <div className="mb-2 h-8 w-8 rounded-full bg-[#e4ead4] text-[#2f6b3e] flex items-center justify-center">
                          <r.Icon size={16} />
                        </div>
                        <p className="text-[16px] font-bold text-[#35503A]">{r.title}</p>
                        <p className="text-[12px] text-[#5b6450] mt-1">{r.desc}</p>
                      </article>
                    ))}
                  </div>
                )}
                {activeModal==='audit' && (
                  <div className="bg-white rounded-[16px] border border-[#d2cab1] p-5 shadow-[0_0_0_1px_rgba(120,86,68,0.06),0_10px_24px_-8px_rgba(120,86,68,0.18)]">
                    <h4 className="text-[18px] font-bold text-[#35503A] mb-2">{t('audit.title')}</h4>
                    <p className="text-[13px] text-[#5b6450]">{t('audit.desc')}</p>
                    <div className="mt-4">
                      <button className="h-10 px-5 rounded-full border border-[#2f5e3f] bg-[#2f6b3e] text-white text-[12px] font-mono font-medium">
                        {t('audit.button')}
                      </button>
                    </div>
                  </div>
                )}
                {activeModal==='featured' && (
                  <div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {['CoinDesk','CoinTelegraph','Decrypt','The Block'].map((name,i)=>(
                        <div key={i} className="rounded-[12px] border border-[#d2cab1] bg-white h-[64px] flex items-center justify-center text-[#35503A] font-mono text-[12px] shadow-[0_0_0_1px_rgba(120,86,68,0.06)]">
                          {name}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {activeModal==='partners' && (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {Array.from({length: 8}).map((_,i)=>(
                      <div key={i} className="rounded-[12px] border border-[#d2cab1] bg-white h-[72px] flex items-center justify-center text-[#35503A] font-mono text-[12px] shadow-[0_0_0_1px_rgba(120,86,68,0.06)]">
                        Partner {i+1}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </section>

      <section id="buy" className="relative mt-4 w-full border-y border-[#c6bd9f] bg-[#FCEDE2]">
        <div className="w-full">
          <div
            className="dashboard-marquee-track whitespace-nowrap text-[#35503A] font-bold py-2"
            style={{ animationDuration: '32s' }}
          >
            {['CoinDesk','CoinTelegraph','Decrypt','The Block']
              .concat(['CoinDesk','CoinTelegraph','Decrypt','The Block'])
              .map((name, i) => (
                <span key={`feat-${i}`} className="inline-flex items-center gap-3 mr-10">
                  <span className="leading-none my-0">★</span>
                  <span>{name}</span>
                </span>
              ))}
          </div>
        </div>
        <div
          className="max-w-[1280px] mx-auto px-3 lg:px-4 py-6"
          style={{ backgroundImage: "url('/assets/bg.svg')", backgroundSize: 'cover', backgroundPosition: 'center' }}
        >
          <div className="grid lg:grid-cols-2 gap-5">
            <article className="bg-[#FCEDE2] rounded-[18px] border border-[#d2cab1] shadow-[0_0_0_1px_rgba(120,86,68,0.06),0_10px_24px_-8px_rgba(120,86,68,0.22)] p-4 sm:p-5 min-w-0">
              <h3 className="text-[28px] sm:text-[34px] leading-[1.1] font-bold break-words">{tt('buy.title', 'Buy PWIFE', 'شراء PWIFE')}</h3>
              <div className="space-y-3 mt-4">
                <div className="rounded-[12px] border border-[#d2cab1] bg-[#FCEDE2] px-3 py-3 flex items-center justify-between gap-2 min-w-0">
                  <span className="text-[14px] font-normal">{tt('buy.price_label', 'Price 1 PWIFE', 'سعر 1 PWIFE')}</span>
                  <span className="text-[18px] sm:text-[20px] font-mono font-medium whitespace-nowrap">
                    {tinyPrice.isTiny ? (
                      <span>
                        0.0
                        <sup className="text-[10px]">{tinyPrice.zeroCount}</sup>
                        {tinyPrice.significant}
                      </span>
                    ) : (
                      tinyPrice.normal
                    )}
                  </span>
                </div>
                <p className="text-[14px] font-normal mb-1">{tt('buy.amount', 'Amount', 'المبلغ')}</p>
                <div
                  dir="ltr"
                  className="rounded-[12px] border border-[#d2cab1] bg-[#FCEDE2] px-3 py-3 flex items-center justify-between gap-3 min-w-0 cursor-text"
                  role="group"
                  aria-label="Amount input group"
                >
                  <p
                    className="text-[13px] font-bold text-[#5b6450] cursor-pointer select-none"
                    onClick={(e) => {
                      e.stopPropagation()
                      const { min } = getBounds(currency)
                      const minValue = currency === 'SOL' ? '1.0' : String(min)
                      setAmount(minValue)
                      setError('')
                    }}
                    title={isRTL ? 'اضغط للحد الأدنى' : 'Click to set minimum'}
                  >
                    {getMinLabel(currency)}
                  </p>
                  <input
                    ref={amountInputRef}
                    value={amount}
                    onChange={(e) => handleAmountInput(e.target.value)}
                    onBlur={() => validateAndClamp(amount, currency, true)}
                    inputMode="decimal"
                    pattern={currency === 'USDT' ? '[0-9]*' : '[0-9.]*'}
                    placeholder={currency === 'USDT' ? '100 - 10000' : '1 - 50'}
                    dir="ltr"
                    className="w-[140px] text-left bg-transparent outline-none text-[16px] sm:text-[18px] font-mono font-medium"
                  />
                </div>
                {error && (
                  <div className="rounded-[10px] border border-[#e9bebe] bg-[#fff1f1] text-[#7a2e2e] px-3 py-2 text-[12px]">
                    {error}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => { setCurrency('SOL'); setError(''); validateAndClamp(amount, 'SOL', true) }}
                    className="inline-flex items-center justify-center gap-2 h-10 w-[200px] px-4 rounded-full border border-[#4b2c89] bg-gradient-to-r from-[#00FFA3] to-[#DC1FFF] text-white text-[12px] font-mono hover:opacity-90"
                  >
                    <Sun size={14} />
                    <span className="text-[11px]">SOL (Solana)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => { setCurrency('USDT'); setError('USDT يعمل على Ethereum. تأكد من اختيار شبكة Ethereum قبل الدفع.'); validateAndClamp(amount, 'USDT', true) }}
                    className="inline-flex items-center justify-center gap-2 h-10 w-[200px] px-4 rounded-full border border-[#1e7f63] bg-gradient-to-r from-[#26A17B] to-[#13AA52] text-white text-[12px] font-mono hover:opacity-90"
                  >
                    <CircleDollarSign size={14} />
                    <span className="text-[11px]">USDT (Ethereum)</span>
                  </button>
                </div>
                <div className="mt-2 rounded-[10px] border border-[#f0b4b4] bg-[#fff1f1] text-[#7a2e2e] px-3 py-2 text-[12px] inline-flex items-start gap-2">
                  <AlertTriangle size={14} className="mt-0.5" />
                  <span>{tt('buy_notices.usdt_eth', 'USDT works on Ethereum. Make sure you are on Ethereum network before paying.', 'USDT يعمل على Ethereum. تأكد من اختيار شبكة Ethereum قبل إجراء المعاملة.')}</span>
                </div>
                <div className="mt-2 rounded-[10px] border border-[#f0b4b4] bg-[#fff1f1] text-[#7a2e2e] px-3 py-2 text-[12px] inline-flex items-start gap-2">
                  <AlertTriangle size={14} className="mt-0.5" />
                  <span>{tt('buy_notices.network_check', 'Verify the correct network and wallet address before proceeding.', 'تحقق من صحة الشبكة وعنوان المحفظة قبل المتابعة.')}</span>
                </div>
                <div className="rounded-[12px] border border-[#c6bfab] bg-[#FCEDE2] px-3 py-3 flex items-center justify-between gap-2 min-w-0">
                  <span className="text-[14px] font-normal">{tt('buy.you_receive','You receive','ستحصل على')}</span>
                  <span className="text-[18px] sm:text-[20px] font-mono font-medium min-w-0 truncate">{pwifeAmount} PWIFE</span>
                </div>
              </div>
            <button onClick={handleBuyNow} className="mt-4 w-full h-11 rounded-full border-2 border-[#2e5d3e] bg-[#2f6b3e] text-white text-[14px] sm:text-[16px] font-mono font-medium inline-flex items-center justify-center gap-2">
                <Rocket size={16} />
                <span>{tt('hero.join_presale','Join Presale','انضم للبيع المسبق')}</span>
              </button>
              <div className="mt-4 flex items-center gap-2">
                <button className="h-9 px-4 rounded-full border border-[#d2cab1] bg-white text-[#35503A] text-[12px] font-mono font-medium whitespace-nowrap inline-flex items-center gap-1">
                  <FileText size={14} />
                  <span>Whitepaper</span>
                </button>
                <button className="h-9 px-4 rounded-full border border-[#2f5e3f] bg-[#2f6b3e] text-white text-[12px] font-mono font-medium whitespace-nowrap inline-flex items-center gap-1">
                  <BookOpen size={14} />
                  <span>How to Buy PepeWife</span>
                </button>
              </div>
            </article>
            <article id="tokenomics" className="bg-[#FCEDE2] rounded-[18px] border border-[#d2cab1] shadow-[0_0_0_1px_rgba(120,86,68,0.06),0_10px_24px_-8px_rgba(120,86,68,0.22)] p-4 sm:p-5 min-w-0">
              <h3 className="text-[28px] sm:text-[34px] leading-[1.1] font-bold break-words inline-flex items-center gap-2">
                <BarChart3 size={18} />
                {tt('tokenomics.title','Tokenomics','توكنوميكس')}
              </h3>
              <div className="mt-3 rounded-[12px] border border-dashed border-[#cabf9f] bg-[#FCEDE2] h-[240px] sm:h-[280px] flex items-center justify-center">
                <span className="font-mono text-[16px] sm:text-[18px] text-[#6d745f]">{tt('tokenomics.image_placeholder','IMAGE HERE','صورة هنا')}</span>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* TICKER (MOCKUP STYLE) */}
      <section className="py-3 border-y border-[#c6bd9f] bg-white">
        <div className="overflow-hidden">
          <div className="dashboard-marquee-track whitespace-nowrap text-[#35503A] font-bold">
             {['Presale Live Now','Secure Multi-Wallet Access','Real-Time Analytics','Roadmap In Progress','Community Rewards','Token Utility Expansion']
              .concat(['Presale Live Now','Secure Multi-Wallet Access','Real-Time Analytics','Roadmap In Progress','Community Rewards','Token Utility Expansion'])
              .map((msg, i) => (
              <span key={i} className="inline-flex items-center gap-3 mr-10">
                 <span className="leading-none my-0">★</span>
                <span>{msg}</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* WHY BUY removed by request */}

      {/* AUDIT CALLOUT */}
      <section id="audit" className="relative w-full border-y border-[#c6bd9f] bg-[#FCEDE2]">
        <div className="max-w-[1200px] mx-auto px-3 lg:px-4 py-8">
          <div className="rounded-[18px] border border-[#d2cab1] bg-white p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-[0_0_0_1px_rgba(120,86,68,0.06),0_10px_24px_-8px_rgba(120,86,68,0.2)]">
            <div className="min-w-0">
              <h4 className="text-[22px] sm:text-[26px] font-bold text-[#35503A] inline-flex items-center gap-2">
                <ShieldCheck size={16} className="text-[#2f6b3e]" />
                {t('audit.title')}
              </h4>
              <p className="text-[13px] text-[#5b6450] mt-1 max-w-[720px]">{t('audit.desc')}</p>
            </div>
            <button className="h-10 px-5 rounded-full border border-[#2f5e3f] bg-[#2f6b3e] text-white text-[13px] font-mono font-medium whitespace-nowrap">
              {t('audit.button')}
            </button>
          </div>
        </div>
      </section>

      {/* FEATURED IN removed by request */}

      {/* PARTNERS removed by request */}

      {/* ROADMAP + TOKEN CONTRACT */}
      <section id="roadmap" className="relative w-full border-y border-[#c6bd9f] bg-[#FCEDE2]">
        <div className="max-w-[1280px] mx-auto px-3 lg:px-4 py-8">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Roadmap */}
            <article className="bg-[#FCEDE2] rounded-[18px] border border-[#d2cab1] shadow-[0_0_0_1px_rgba(120,86,68,0.06),0_10px_24px_-8px_rgba(120,86,68,0.22)] p-5">
              <h3 className="text-[26px] sm:text-[32px] font-bold break-words inline-flex items-center gap-2">
                <Route size={18} />
                {t('roadmap.title_roadmap')}
              </h3>
              <div className="mt-4 space-y-4">
                {[
                  { id: '01', title: t('roadmap.phase1_title'), desc: t('roadmap.phase1_item1') },
                  { id: '02', title: t('roadmap.phase2_title'), desc: t('roadmap.phase2_item1') },
                  { id: '03', title: t('roadmap.phase3_title'), desc: t('roadmap.phase3_item1') },
                  { id: '04', title: t('roadmap.phase4_title'), desc: t('roadmap.phase4_item1') },
                ].map(p => (
                  <div key={p.id} className="rounded-[12px] border border-[#d2cab1] bg-[#FCEDE2] p-4 flex gap-3 items-start">
                    <span className="w-10 h-10 rounded-xl bg-[#e9d6d9] text-[#35503A] border border-[#c8b8ba] flex items-center justify-center font-bold">{p.id}</span>
                    <div className="min-w-0">
                      <p className="text-[16px] font-bold break-words">{p.title}</p>
                      <p className="text-[13px] text-[#5b6450] break-words">{p.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </article>
            {/* Token Contract */}
            <article className="bg-[#FCEDE2] rounded-[18px] border border-[#d2cab1] shadow-[0_0_0_1px_rgba(120,86,68,0.06),0_10px_24px_-8px_rgba(120,86,68,0.22)] p-5">
              <h3 className="text-[26px] sm:text-[32px] font-bold break-words inline-flex items-center gap-2">
                <FileText size={18} />
                {t('nav.contract')}
              </h3>
              <div className="mt-4 space-y-4">
                <div className="rounded-[12px] border border-[#d2cab1] bg-white px-3 py-3">
                  <p className="text-[12px] text-[#6d745f] font-bold uppercase">Token</p>
                  <p className="text-[18px] font-bold">PWIFE</p>
                </div>
                <div className="rounded-[12px] border border-[#d2cab1] bg-white px-3 py-3">
                  <p className="text-[12px] text-[#6d745f] font-bold uppercase">Network</p>
                  <p className="text-[16px] font-bold">Solana · Mainnet</p>
                </div>
                <div
                  onClick={handleCopy}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleCopy() } }}
                  title={isRTL ? 'انسخ' : 'Click to copy'}
                  className="rounded-[12px] border border-[#d2cab1] bg-white px-3 py-3 cursor-pointer hover:bg-[#FCEDE2]"
                >
                  <p className="text-[12px] text-[#6d745f] font-bold uppercase">Contract Address</p>
                  <p className="text-[12px] font-mono text-[#35503A]/80 break-all">{(import.meta && import.meta.env && import.meta.env.VITE_PWIFE_TOKEN_CONTRACT) || 'YOUR_TOKEN_MINT_ADDRESS_HERE'}</p>
                  <button onClick={(e) => { e.stopPropagation(); handleCopy() }} className="mt-3 h-9 px-4 rounded-full border border-[#2f5e3f] bg-[#2f6b3e] text-white text-[12px] font-mono inline-flex items-center gap-1">
                    <IconCopy size={14} />
                    <span>Copy</span>
                  </button>
                </div>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* FAQ + RISK */}
      <section id="faq" className="relative w-full border-y border-[#c6bd9f] bg-[#FCEDE2]">
        <div className="max-w-[1280px] mx-auto px-3 lg:px-4 py-8">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <article className="bg-[#FCEDE2] rounded-[18px] border border-[#d2cab1] shadow-[0_0_0_1px_rgba(120,86,68,0.06),0_10px_24px_-8px_rgba(120,86,68,0.22)] p-5">
              <h3 className="text-[26px] sm:text-[32px] font-bold break-words inline-flex items-center gap-2">
                <HelpCircle size={18} className="text-[#35503A]" />
                {t('faq.title')}
              </h3>
              <div className="mt-4 space-y-3">
                {[t('faq.q1'), t('faq.q2'), t('faq.q3'), t('faq.q4')].map((q, i) => (
                  <div key={i} className="rounded-[14px] p-[1px] bg-gradient-to-r from-[#e9dfc8] to-[#d2cab1]">
                    <div className="rounded-[12px] bg-white">
                      <button
                        type="button"
                        onClick={() => toggleFaq(i)}
                        className="w-full flex items-center justify-between px-3 sm:px-4 py-3 hover:bg-[#FCEDE2]/60 transition-colors"
                      >
                        <p className="text-[14px] font-bold text-[#35503A]">{q}</p>
                        <span
                          className={`ml-3 h-6 w-6 rounded-full border border-[#d2cab1] bg-[#FCEDE2] text-[#35503A] flex items-center justify-center transition-transform ${openFaq===i ? 'rotate-45' : ''}`}
                          aria-hidden="true"
                        >
                          +
                        </span>
                      </button>
                      <div className={`${openFaq===i ? 'block' : 'hidden'} px-3 sm:px-4 pb-4`}>
                        <div className="text-[13px] text-[#5b6450] mt-1 leading-relaxed">
                          {t(['faq.a1','faq.a2','faq.a3','faq.a4'][i])}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </article>
            <article id="risk" className="bg-[#FFF6F7] rounded-[18px] border border-[#e3c7cd] shadow-[0_0_0_1px_rgba(120,86,68,0.06),0_10px_24px_-8px_rgba(120,86,68,0.22)] p-5">
              <h3 className="text-[26px] sm:text-[32px] font-bold break-words text-[#8d3a4d] inline-flex items-center gap-2">
                <AlertTriangle size={18} className="text-[#8d3a4d]" />
                {t('risk.title')}
              </h3>
              <ul className="mt-4 space-y-3 text-[13px] text-[#6b4d52]">
                <li>• {t('risk.p1')}</li>
                <li>• {t('risk.p2')}</li>
                <li>• Only invest funds you can afford to lose and always use your own research.</li>
              </ul>
            </article>
          </div>
        </div>
      </section>

      <footer className="bg-[#E8E6D7] border-t border-[#c6bd9f] py-12">
        <div className="max-w-[1200px] mx-auto px-3 lg:px-4">
          <p className="text-center text-[12px] sm:text-[13px] font-bold text-[#35503A]/70 tracking-[0.2em]">© PEPE WIFE</p>
        </div>
      </footer>
    </div>
  )
}

export default LandingPageNew
