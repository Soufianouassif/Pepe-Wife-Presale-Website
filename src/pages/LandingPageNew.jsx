import React, { useMemo, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useWallet } from '../context/WalletContext'
import { formatAddress } from '../utils/format'
import LanguageSwitcher from '../components/LanguageSwitcher'
import { Twitter as IconBrandX, Telegram as IconBrandTelegram } from '../components/icons'
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
  const tt = (key, en, ar) => {
    const v = t(key)
    return v === key ? (isRTL ? ar : en) : v
  }
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
        <div className="max-w-[1200px] mx-auto h-full px-3 lg:px-4 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <img src="/assets/hero-character.png" alt="PepeWife" className="w-10 h-10 rounded-full object-cover border border-[#5d7049]" />
            <span className="text-[24px] leading-none font-bold tracking-tight truncate">PepeWife</span>
          </div>
          <div className="flex items-center gap-2 min-w-0">
            <button onClick={handleBuyNow} className="hidden md:inline-flex items-center h-10 px-4 rounded-full border border-[#335f43] bg-[#e4ead4] text-[13px] font-mono font-medium whitespace-nowrap">
              {isConnected ? formatAddress(address) : t('nav.wallet.connect')}
            </button>
            <button onClick={handleBuyNow} className="inline-flex items-center h-10 px-5 rounded-full border border-[#2f5e3f] bg-[#2f6b3e] text-white text-[13px] font-mono font-medium whitespace-nowrap">
              {t('hero.join_presale')}
            </button>
            <LanguageSwitcher className="hidden sm:flex" />
            <button className="w-10 h-10 rounded-xl border border-[#b7ae90] bg-[#FCEDE2] text-[20px] leading-none">☰</button>
          </div>
        </div>
      </header>

      <section id="home" className="relative w-full overflow-hidden border-y border-[#c6bd9f]">
        <img src="/assets/hero-section.svg" alt="Hero" className="w-full h-auto min-h-[320px] md:min-h-[520px] object-cover block" />
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
          <h1 className="font-bold text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.45)] text-[28px] sm:text-[42px] lg:text-[64px] leading-[1.1] break-words max-w-[1100px]">
            BE EARLY.. OR CRY LATER
          </h1>
          <p className="mt-3 font-normal text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.45)] text-[14px] sm:text-[18px] lg:text-[28px] leading-[1.4] break-words max-w-[900px]">
            {t('hero.desc')}
          </p>
          <button onClick={handleBuyNow} className="mt-5 h-11 px-8 rounded-full border-2 border-[#2e5d3e] bg-[#2f6b3e] text-white text-[14px] sm:text-[16px] font-mono font-medium whitespace-nowrap">
            {t('hero.join_presale')}
          </button>
          <div className="mt-6 text-center">
            <p className="text-white/90 text-[14px] sm:text-[16px] font-bold tracking-wide">JOIN $PWIFE Community</p>
            <div className="mt-3 flex items-center gap-3">
              <a href="https://x.com" target="_blank" rel="noreferrer" className="h-10 px-4 rounded-full border border-white/60 bg-white/20 backdrop-blur-sm text-white text-[13px] font-mono hover:bg-white/30">
                <span className="inline-flex items-center gap-2">
                  <IconBrandX size={16} />
                  X (Twitter)
                </span>
              </a>
              <a href="https://t.me" target="_blank" rel="noreferrer" className="h-10 px-4 rounded-full border border-white/60 bg-white/20 backdrop-blur-sm text-white text-[13px] font-mono hover:bg-white/30">
                <span className="inline-flex items-center gap-2">
                  <IconBrandTelegram size={16} />
                  Telegram
                </span>
              </a>
            </div>
          </div>
        </div>
      </section>

      <section id="buy" className="relative mt-4 w-full border-y border-[#c6bd9f] bg-[#FCEDE2]">
        <div className="max-w-[1280px] mx-auto px-3 lg:px-4 py-6">
          <div className="grid lg:grid-cols-2 gap-5">
            <article className="bg-[#FCEDE2] rounded-[18px] border border-[#d2cab1] shadow-[0_0_0_1px_rgba(120,86,68,0.06),0_10px_24px_-8px_rgba(120,86,68,0.22)] p-4 sm:p-5 min-w-0">
              <h3 className="text-[28px] sm:text-[34px] leading-[1.1] font-bold break-words">{t('buy.title')}</h3>
              <div className="space-y-3 mt-4">
                <div className="rounded-[12px] border border-[#d2cab1] bg-[#FCEDE2] px-3 py-3 flex items-center justify-between gap-2 min-w-0">
                  <span className="text-[14px] font-normal">{t('buy.price_label')}</span>
                  <span className="text-[18px] sm:text-[20px] font-mono font-medium whitespace-nowrap">
                    {tinyPrice.isTiny ? <>0.0<sup className="text-[10px]">{tinyPrice.zeroCount}</sup>{tinyPrice.significant}</> : tinyPrice.normal}
                  </span>
                </div>
                <p className="text-[14px] font-normal mb-1">{tt('buy.amount', 'Amount', 'المبلغ')}</p>
                <div
                  className="rounded-[12px] border border-[#d2cab1] bg-[#FCEDE2] px-3 py-3 flex items-center justify-between gap-3 min-w-0 cursor-text"
                  onClick={() => amountInputRef.current?.focus()}
                  role="group"
                  aria-label="Amount input group"
                >
                  <p
                    className="text-[13px] font-bold text-[#5b6450] cursor-pointer select-none"
                    onClick={(e) => {
                      e.stopPropagation()
                      const { min } = getBounds(currency)
                      setAmount(String(min))
                      setError('')
                      amountInputRef.current?.focus()
                    }}
                    title={isRTL ? 'اضغط للحد الأدنى' : 'Click to set minimum'}
                  >
                    {isRTL ? 'الحد الأدنى' : 'Min'}
                  </p>
                  <input
                    ref={amountInputRef}
                    value={amount}
                    onChange={(e) => handleAmountInput(e.target.value)}
                    onBlur={() => validateAndClamp(amount, currency, true)}
                    inputMode="decimal"
                    pattern={currency === 'USDT' ? '[0-9]*' : '[0-9.]*'}
                    placeholder={currency === 'USDT' ? '100 - 10000 (عدد صحيح)' : '1 - 50'}
                    dir={isRTL ? 'rtl' : 'ltr'}
                    className={`w-[140px] ${isRTL ? 'text-right' : 'text-left'} bg-transparent outline-none text-[16px] sm:text-[18px] font-mono font-medium`}
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
                    className="h-10 px-4 rounded-full border border-[#335f43] bg-[#e4ead4] text-[#35503A] text-[12px] font-mono hover:bg-[#dfe9cd]"
                  >
                    Use SOL
                  </button>
                  <button
                    type="button"
                    onClick={() => { setCurrency('USDT'); setError('USDT يعمل على Ethereum. تأكد من اختيار شبكة Ethereum قبل الدفع.'); validateAndClamp(amount, 'USDT', true) }}
                    className="h-10 px-4 rounded-full border border-[#2f5e3f] bg-[#2f6b3e] text-white text-[12px] font-mono hover:bg-[#2b613a]"
                  >
                    Use USDT (Ethereum)
                  </button>
                </div>
                {currency === 'USDT' && (
                  <div className="mt-2 rounded-[10px] border border-[#d9e7d9] bg-[#f0fff0] text-[#2d5a2d] px-3 py-2 text-[12px]">
                    USDT يعمل على Ethereum. تأكد من اختيار شبكة Ethereum قبل إجراء المعاملة.
                  </div>
                )}
                <div className="rounded-[12px] border border-[#c6bfab] bg-[#FCEDE2] px-3 py-3 flex items-center justify-between gap-2 min-w-0">
                  <span className="text-[14px] font-normal">You receive</span>
                  <span className="text-[18px] sm:text-[20px] font-mono font-medium min-w-0 truncate">{pwifeAmount} PWIFE</span>
                </div>
              </div>
              <button onClick={handleBuyNow} className="mt-4 w-full h-11 rounded-full border-2 border-[#2e5d3e] bg-[#2f6b3e] text-white text-[14px] sm:text-[16px] font-mono font-medium">
                {t('hero.join_presale')}
              </button>
              <div className="mt-4 rounded-[10px] border border-[#d2cab1] bg-[#FCEDE2] px-3 py-2 flex items-center justify-between gap-2 min-w-0">
                <span className="text-[13px] sm:text-[14px] font-normal min-w-0 truncate">
                  {isConnected ? formatAddress(address) : t('buy.wallet_not_connected')}
                </span>
                <button onClick={handleCopy} className="h-8 px-3 rounded border border-[#c8bf9f] text-[12px] font-mono font-medium whitespace-nowrap">Copy</button>
              </div>
            </article>
            <article id="tokenomics" className="bg-[#FCEDE2] rounded-[18px] border border-[#d2cab1] shadow-[0_0_0_1px_rgba(120,86,68,0.06),0_10px_24px_-8px_rgba(120,86,68,0.22)] p-4 sm:p-5 min-w-0">
              <h3 className="text-[28px] sm:text-[34px] leading-[1.1] font-bold break-words">{t('tokenomics.title')}</h3>
              <div className="mt-3 rounded-[12px] border border-dashed border-[#cabf9f] bg-[#FCEDE2] h-[240px] sm:h-[280px] flex items-center justify-center">
                <span className="font-mono text-[16px] sm:text-[18px] text-[#6d745f]">{t('tokenomics.image_placeholder')}</span>
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
                <span>★</span>
                <span>{msg}</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ROADMAP + TOKEN CONTRACT */}
      <section id="roadmap" className="relative w-full border-y border-[#c6bd9f] bg-[#FCEDE2]">
        <div className="max-w-[1280px] mx-auto px-3 lg:px-4 py-8">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {/* Roadmap */}
            <article className="bg-[#FCEDE2] rounded-[18px] border border-[#d2cab1] shadow-[0_0_0_1px_rgba(120,86,68,0.06),0_10px_24px_-8px_rgba(120,86,68,0.22)] p-5">
              <h3 className="text-[26px] sm:text-[32px] font-bold break-words">{t('roadmap.title_roadmap')}</h3>
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
            <article id="contract" className="bg-[#E8E6D7] rounded-[18px] border border-[#d2cab1] shadow-[0_0_0_1px_rgba(120,86,68,0.06),0_10px_24px_-8px_rgba(120,86,68,0.22)] p-5">
              <h3 className="text-[26px] sm:text-[32px] font-bold break-words">{t('nav.contract')}</h3>
              <div className="mt-4 space-y-4">
                <div className="rounded-[12px] border border-[#d2cab1] bg-white px-3 py-3">
                  <p className="text-[12px] text-[#6d745f] font-bold uppercase">Token</p>
                  <p className="text-[18px] font-bold">PWIFE</p>
                </div>
                <div className="rounded-[12px] border border-[#d2cab1] bg-white px-3 py-3">
                  <p className="text-[12px] text-[#6d745f] font-bold uppercase">Network</p>
                  <p className="text-[16px] font-bold">Solana · Mainnet</p>
                </div>
                <div className="rounded-[12px] border border-[#d2cab1] bg-white px-3 py-3">
                  <p className="text-[12px] text-[#6d745f] font-bold uppercase">Contract Address</p>
                  <p className="text-[12px] font-mono text-[#35503A]/80 break-all">{import.meta?.env?.VITE_PWIFE_TOKEN_CONTRACT || 'YOUR_TOKEN_MINT_ADDRESS_HERE'}</p>
                  <button onClick={handleCopy} className="mt-3 h-9 px-4 rounded-full border border-[#2f5e3f] bg-[#2f6b3e] text-white text-[12px] font-mono">Copy</button>
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
              <h3 className="text-[26px] sm:text-[32px] font-bold break-words">{t('faq.title')}</h3>
              <div className="mt-4 space-y-3">
                {[t('faq.q1'), t('faq.q2'), t('faq.q3'), t('faq.q4')].map((q, i) => (
                  <div key={i} className="rounded-[12px] border border-[#d2cab1] bg-white px-3 py-3">
                    <p className="text-[14px] font-bold text-[#35503A]">{q}</p>
                    <p className="text-[13px] text-[#5b6450] mt-1">{t(`faq.a${i+1}`)}</p>
                  </div>
                ))}
              </div>
            </article>
            <article id="risk" className="bg-[#FFF6F7] rounded-[18px] border border-[#e3c7cd] shadow-[0_0_0_1px_rgba(120,86,68,0.06),0_10px_24px_-8px_rgba(120,86,68,0.22)] p-5">
              <h3 className="text-[26px] sm:text-[32px] font-bold break-words text-[#8d3a4d]">{t('risk.title')}</h3>
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
