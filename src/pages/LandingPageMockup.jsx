import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWallet } from '../context/WalletContext'
import { formatAddress } from '../utils/format'
import { Menu, ArrowRight, Lock, Check, Flame, Users, Copy } from '../components/icons'
import LanguageSwitcher from '../components/LanguageSwitcher'
import { PRESALE_CONFIG, TOKENS_PER_USDT, TOTAL_PRESALE_SUPPLY } from '../presaleConfig'
import { formatCompactNumber, formatFullNumber, formatTinyPrice } from '../utils/numberFormatters'

const FEATURES = [
  { id: 'liquidity', title: 'Liquidity Locked', subtitle: 'Funds are secured', icon: Lock },
  { id: 'verified', title: 'Contract Verified', subtitle: 'Audited safe contract', icon: Check },
  { id: 'early', title: 'Early Phase', subtitle: 'First buyers get best prices', icon: Flame },
  { id: 'community', title: 'Growing Community', subtitle: 'Join thousands of holders', icon: Users }
]

const TOKENOMICS = [
  { label: 'Presale', color: '#3A7A4A' },
  { label: 'Liquidity', color: '#2F6B3E' },
  { label: 'Marketing', color: '#6D7564' },
  { label: 'CEX Listings', color: '#4E5D49' }
]

const Placeholder = ({ className = '' }) => (
  <div className={`min-w-0 rounded-2xl border border-dashed border-[rgba(60,83,52,0.28)] bg-[#d9ddd0] flex items-center justify-center text-[#4E5D49] text-[14px] font-medium tracking-wide ${className}`}>
    IMAGE HERE
  </div>
)

const TinyPrice = ({ value }) => {
  const tiny = formatTinyPrice(value)
  if (!tiny.isTiny) {
    return <span className="font-mono">{tiny.normal}</span>
  }
  return (
    <span className="font-mono">
      0.0
      <sup className="text-[0.72em] align-super">{tiny.zeroCount}</sup>
      {tiny.significant}
    </span>
  )
}

const LandingPageMockup = () => {
  const navigate = useNavigate()
  const { isConnected, address } = useWallet()
  const [amount, setAmount] = useState('2.5')

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

  const handleCopyAddress = async () => {
    const value = isConnected && address ? address : '0x1234567890abcdef1234567890abcdef12345678'
    await navigator.clipboard.writeText(value)
  }

  return (
    <div className="min-h-screen bg-[#E8E6D7] text-[#35503A] font-sans [letter-spacing:-0.01em] overflow-x-hidden">
      <header className="sticky top-0 z-50 h-[84px] bg-[rgba(234,223,201,0.9)] backdrop-blur-sm border-b border-[rgba(60,83,52,0.10)]">
        <div className="max-w-[1200px] h-full mx-auto px-6 flex items-center justify-between gap-4 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-[#DDE2D0] border border-[rgba(60,83,52,0.10)] flex items-center justify-center text-[11px] font-medium text-[#4E5D49] shrink-0">LOGO</div>
            <span className="text-[22px] leading-[1.2] font-bold truncate">PepeWife</span>
          </div>
          <nav className="hidden lg:flex items-center gap-8 text-[15px] text-[#4E5D49] font-medium min-w-0">
            <a href="#home">Home</a>
            <a href="#buy">Buy</a>
            <a href="#tokenomics">Tokenomics</a>
            <a href="#roadmap">Roadmap</a>
            <a href="#faq">FAQ</a>
          </nav>
          <div className="flex items-center gap-2 md:gap-3 shrink-0">
            <LanguageSwitcher className="hidden sm:flex" />
            <button onClick={handleBuyNow} className="hidden md:inline-flex items-center h-11 px-5 rounded-full border border-[rgba(60,83,52,0.2)] bg-[#E6EDDC] text-[#35503A] text-[15px] font-medium">
              Connect Wallet
            </button>
            <button onClick={handleBuyNow} className="inline-flex items-center h-11 px-5 rounded-full bg-[#3A7A4A] hover:bg-[#2F6B3E] text-white text-[15px] font-semibold transition-colors">
              Buy Now
            </button>
            <button className="lg:hidden w-11 h-11 rounded-full border border-[rgba(60,83,52,0.2)] bg-[#E6EDDC] flex items-center justify-center">
              <Menu size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="pb-[60px]">
        <section id="home" className="py-[60px]">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="rounded-[22px] border border-[rgba(60,83,52,0.10)] bg-[linear-gradient(120deg,#F4EEDB,#E6EDDC)] p-6 md:p-10">
              <div className="grid lg:grid-cols-[250px_minmax(0,1fr)_250px] gap-8 items-center min-w-0">
                <Placeholder className="h-[360px] hidden lg:flex" />
                <div className="min-w-0 text-center">
                  <h1 className="text-[34px] sm:text-[40px] lg:text-[60px] leading-[1.2] font-bold uppercase break-words">BE EARLY... OR CRY LATER</h1>
                  <p className="mt-4 text-[#4E5D49] text-[15px] sm:text-[16px] lg:text-[22px] leading-[1.5] break-words">The most elegant memecoin presale with a premium Moroccan-inspired experience.</p>
                  <div className="mt-7 flex justify-center gap-3">
                    <button onClick={handleBuyNow} className="inline-flex items-center h-12 px-6 rounded-full bg-[#3A7A4A] hover:bg-[#2F6B3E] text-white text-[16px] font-semibold transition-colors">
                      BUY NOW
                      <ArrowRight size={18} className="ml-2" />
                    </button>
                  </div>
                </div>
                <Placeholder className="h-[360px] hidden lg:flex" />
              </div>
            </div>
          </div>
        </section>

        <section className="pb-[60px]">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
              {FEATURES.map((item) => {
                const Icon = item.icon
                return (
                  <article key={item.id} className="h-[140px] rounded-[18px] bg-[#F4EEDB] border border-[rgba(60,83,52,0.10)] px-5 py-4 flex gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-[#E6EDDC] border border-[rgba(60,83,52,0.10)] flex items-center justify-center shrink-0">
                      <Icon size={18} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-[18px] lg:text-[22px] leading-[1.2] font-semibold break-words">{item.title}</h3>
                      <p className="mt-1 text-[13px] text-[#6D7564] leading-[1.5] break-words">{item.subtitle}</p>
                    </div>
                  </article>
                )
              })}
            </div>
          </div>
        </section>

        <section className="pb-[60px]">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="grid lg:grid-cols-[48%_52%] gap-6 min-w-0">
              <article id="buy" className="rounded-[22px] bg-[#F4EEDB] border border-[rgba(60,83,52,0.10)] p-7 min-w-0">
                <div className="pb-4 mb-5 border-b border-[rgba(60,83,52,0.10)]">
                  <h2 className="text-[18px] sm:text-[22px] leading-[1.2] font-semibold">Buy PWIFE</h2>
                </div>
                <div className="space-y-4">
                  <div className="rounded-[18px] border border-[rgba(60,83,52,0.10)] bg-[#E8E6D7] p-4">
                    <p className="text-[13px] text-[#6D7564] leading-[1.5]">Price 1 PWIFE</p>
                    <p className="mt-1 text-[24px] lg:text-[28px] font-bold leading-[1.2] text-[#35503A]">
                      $<TinyPrice value={PRESALE_CONFIG.currentPhase.priceUsd} />
                    </p>
                  </div>
                  <div className="rounded-[18px] border border-[rgba(60,83,52,0.10)] bg-[#E8E6D7] p-4">
                    <label className="block text-[13px] text-[#6D7564] leading-[1.5]">Amount</label>
                    <div className="mt-2 flex items-center gap-3 min-w-0">
                      <input
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="h-11 flex-1 min-w-0 rounded-xl border border-[rgba(60,83,52,0.10)] bg-[#F4EEDB] px-3 text-[16px] font-mono text-[#35503A] outline-none"
                      />
                      <select className="h-11 w-[90px] rounded-xl border border-[rgba(60,83,52,0.10)] bg-[#F4EEDB] px-2 text-[14px] text-[#35503A]" defaultValue="ETH">
                        <option value="ETH">ETH</option>
                      </select>
                    </div>
                  </div>
                  <div className="rounded-[18px] border border-[rgba(60,83,52,0.10)] bg-[#DDE2D0] p-4">
                    <p className="text-[13px] text-[#4E5D49] leading-[1.5]">You receive</p>
                    <p className="mt-1 text-[24px] lg:text-[28px] font-bold leading-[1.2] text-[#35503A] font-mono break-words">{pwifeAmount} PWIFE</p>
                  </div>
                  <button onClick={handleBuyNow} className="w-full h-12 rounded-full bg-[#3A7A4A] hover:bg-[#2F6B3E] text-white text-[16px] font-semibold inline-flex items-center justify-center transition-colors">
                    BUY NOW
                    <ArrowRight size={18} className="ml-2" />
                  </button>
                </div>

                <div className="mt-5 flex items-start justify-between gap-4 min-w-0">
                  <div className="space-y-2 text-[14px] sm:text-[15px] text-[#4E5D49] leading-[1.5] min-w-0">
                    <p className="break-words">🔥 23 people bought in last hour</p>
                    <p className="font-mono break-words">⏳ 09 Days, 12 HRS 32</p>
                    <p className="break-words">✔ Low price before launch</p>
                    <p className="break-words">✔ No vesting, no lock</p>
                    <p className="break-words">✔ High growth potential</p>
                  </div>
                  <div className="w-24 h-24 rounded-2xl border border-dashed border-[rgba(60,83,52,0.28)] bg-[#DDE2D0] text-[12px] text-[#4E5D49] flex items-center justify-center shrink-0">QR</div>
                </div>

                <div className="mt-5 flex items-center justify-between rounded-[16px] border border-[rgba(60,83,52,0.10)] bg-[#E8E6D7] p-3 min-w-0">
                  <span className="text-[13px] sm:text-[14px] text-[#4E5D49] min-w-0 truncate">{isConnected ? formatAddress(address) : 'Wallet not connected'}</span>
                  <button onClick={handleCopyAddress} className="w-9 h-9 rounded-xl border border-[rgba(60,83,52,0.10)] bg-[#F4EEDB] flex items-center justify-center shrink-0">
                    <Copy size={16} />
                  </button>
                </div>
              </article>

              <article id="tokenomics" className="rounded-[22px] bg-[#F4EEDB] border border-[rgba(60,83,52,0.10)] p-7 min-w-0 flex flex-col">
                <div className="pb-4 mb-5 border-b border-[rgba(60,83,52,0.10)]">
                  <h2 className="text-[18px] sm:text-[22px] leading-[1.2] font-semibold">Tokenomics</h2>
                </div>
                <div className="grid md:grid-cols-[1fr_210px] gap-5 min-w-0">
                  <div className="min-w-0">
                    <div className="rounded-[18px] border border-[rgba(60,83,52,0.10)] bg-[#E8E6D7] p-4">
                      <p className="text-[13px] text-[#6D7564]">Current Phase Supply</p>
                      <p className="mt-1 text-[26px] sm:text-[30px] leading-[1.2] font-bold font-mono" title={formatFullNumber(PRESALE_CONFIG.currentPhase.supply)}>
                        {formatCompactNumber(PRESALE_CONFIG.currentPhase.supply)}
                      </p>
                    </div>
                    <div className="mt-4 rounded-[18px] border border-[rgba(60,83,52,0.10)] bg-[#E8E6D7] p-4">
                      <p className="text-[13px] text-[#6D7564]">Total Presale Supply</p>
                      <p className="mt-1 text-[26px] sm:text-[30px] leading-[1.2] font-bold font-mono" title={formatFullNumber(TOTAL_PRESALE_SUPPLY)}>
                        {formatCompactNumber(TOTAL_PRESALE_SUPPLY)}
                      </p>
                    </div>
                    <ul className="mt-5 space-y-3">
                      {TOKENOMICS.map((item) => (
                        <li key={item.label} className="flex items-center gap-3 text-[15px] sm:text-[16px] leading-[1.5] text-[#35503A]">
                          <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                          <span className="break-words">{item.label}</span>
                        </li>
                      ))}
                    </ul>
                    <button className="mt-6 h-12 px-6 rounded-full border border-[rgba(60,83,52,0.2)] bg-[#E6EDDC] text-[#35503A] text-[15px] font-medium inline-flex items-center">
                      READ MORE
                      <ArrowRight size={16} className="ml-2" />
                    </button>
                  </div>
                  <Placeholder className="h-[260px] md:h-auto" />
                </div>
              </article>
            </div>
          </div>
        </section>

        <section id="roadmap" className="pb-[60px]">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="rounded-[22px] bg-[#DDE2D0] border border-[rgba(60,83,52,0.10)] p-7">
              <h2 className="text-[22px] sm:text-[28px] leading-[1.2] font-bold">Roadmap</h2>
              <p className="mt-2 text-[15px] text-[#4E5D49] leading-[1.5]">Strategic milestones and releases will be visualized here.</p>
            </div>
          </div>
        </section>

        <section id="faq" className="pb-[60px]">
          <div className="max-w-[1200px] mx-auto px-6">
            <div className="rounded-[22px] bg-[#E6EDDC] border border-[rgba(60,83,52,0.10)] p-7">
              <h2 className="text-[22px] sm:text-[28px] leading-[1.2] font-bold">FAQ</h2>
              <p className="mt-2 text-[15px] text-[#4E5D49] leading-[1.5]">Common questions will be displayed in this section.</p>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}

export default LandingPageMockup
