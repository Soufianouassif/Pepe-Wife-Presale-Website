import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWallet } from '../context/WalletContext'
import { formatAddress } from '../utils/format'
import { Menu, ArrowRight, Lock, Check, Flame, Users, Copy } from '../components/icons'
import LanguageSwitcher from '../components/LanguageSwitcher'

const FEATURES = [
  { id: 'liquidity', title: 'Liquidity Locked', subtitle: 'Funds are secured', icon: Lock },
  { id: 'verified', title: 'Contract Verified', subtitle: 'Audited safe contract', icon: Check },
  { id: 'early', title: 'Early Phase', subtitle: 'First buyers get best prices', icon: Flame },
  { id: 'community', title: 'Growing Community', subtitle: 'Join thousands of holders', icon: Users }
]

const TOKENOMICS = [
  { label: 'Presale', color: '#2f6a49' },
  { label: 'Liquidity', color: '#45795a' },
  { label: 'Marketing', color: '#b79332' },
  { label: 'CEX Listings', color: '#d5af42' }
]

const LandingPageMockup = () => {
  const navigate = useNavigate()
  const { isConnected, address } = useWallet()
  const [amount, setAmount] = useState('2.5')

  const pwifeAmount = useMemo(() => {
    const parsed = Number(amount)
    if (!Number.isFinite(parsed) || parsed <= 0) return '0'
    return Math.round(parsed * 96618).toLocaleString()
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
    <div className="mockup-page min-h-screen text-[#1f2f24]">
      <header className="mockup-navbar sticky top-0 z-40">
        <div className="mockup-shell h-[88px] flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/assets/hero-character.png" alt="PepeWife" className="w-12 h-12 rounded-full border border-[#b8aa7d] bg-[#ebe6d7]" />
            <div className="text-[42px] leading-none font-semibold tracking-tight">PepeWife</div>
          </div>
          <nav className="hidden lg:flex items-center gap-10 text-[28px] font-medium">
            <a href="#home">Home</a>
            <a href="#buy">Buy</a>
            <a href="#tokenomics">Tokenomics</a>
            <a href="#roadmap">Roadmap</a>
            <a href="#faq">FAQ</a>
          </nav>
          <div className="flex items-center gap-3">
            <button onClick={handleBuyNow} className="mockup-cta hidden md:inline-flex">
              BUY NOW
              <ArrowRight size={24} className="ml-2" />
            </button>
            <LanguageSwitcher />
            <button className="w-12 h-12 rounded-xl border border-[#b8aa7d] bg-[#f2ecda] flex items-center justify-center">
              <Menu size={24} />
            </button>
          </div>
        </div>
      </header>

      <section id="home" className="mockup-hero">
        <div className="mockup-shell py-16 md:py-24">
          <div className="mockup-hero-card">
            <div className="max-w-[920px] mx-auto text-center">
              <h1 className="text-[36px] sm:text-[56px] lg:text-[82px] leading-[1.02] font-semibold tracking-tight uppercase">BE EARLY.. OR CRY LATER</h1>
              <p className="text-[22px] sm:text-[34px] lg:text-[46px] mt-6">The most elegant memecoin presale</p>
              <button onClick={handleBuyNow} className="mockup-cta mt-10">
                BUY NOW
                <ArrowRight size={26} className="ml-2" />
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="mockup-section">
        <div className="mockup-shell py-14 md:py-20">
          <div className="max-w-[1020px] mx-auto text-center">
            <h2 className="text-[34px] sm:text-[56px] lg:text-[78px] leading-[1.04] font-semibold uppercase">BE EARLY.. OR CRY LATER</h2>
            <p className="text-[22px] sm:text-[32px] lg:text-[44px] mt-4">The most elegant memecoin presale</p>
            <button onClick={handleBuyNow} className="mockup-cta mt-10">
              BUY NOW
              <ArrowRight size={26} className="ml-2" />
            </button>
          </div>

          <div className="mockup-feature-strip mt-12">
            {FEATURES.map((item) => {
              const Icon = item.icon
              return (
                <div key={item.id} className="mockup-feature-item">
                  <div className="w-11 h-11 rounded-full bg-[#efe4b8] border border-[#b8aa7d] flex items-center justify-center shrink-0">
                    <Icon size={22} />
                  </div>
                  <div>
                    <div className="text-[28px] font-semibold leading-tight">{item.title}</div>
                    <div className="text-[18px] text-[#4f5f52]">{item.subtitle}</div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="grid lg:grid-cols-2 gap-6 mt-8">
            <article id="buy" className="mockup-card p-6 md:p-9">
              <h3 className="text-[52px] font-semibold leading-none">Buy PWIFE</h3>
              <div className="space-y-4 mt-6">
                <div className="mockup-input-row">
                  <span>Price 1 PWIFE</span>
                  <strong>$0.0103</strong>
                </div>
                <div className="mockup-input-row">
                  <span>Amount</span>
                  <div className="flex items-center gap-2">
                    <input
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="bg-transparent border-none outline-none text-right w-20"
                    />
                    <span>ETH</span>
                  </div>
                </div>
                <div className="mockup-input-row bg-[#dce4ce]">
                  <span>You receive</span>
                  <strong>{pwifeAmount} PWIFE</strong>
                </div>
              </div>

              <button onClick={handleBuyNow} className="mockup-cta w-full mt-5 justify-center">
                BUY NOW
                <ArrowRight size={24} className="ml-2" />
              </button>

              <div className="mt-6 space-y-3 text-[20px] md:text-[25px]">
                <p>🔥 23 people bought in last hour</p>
                <p>⏱️ 09 Days, 12 HRS 32</p>
                <p>✔️ Low price before launch</p>
                <p>✔️ No vesting, no lock</p>
                <p>✔️ High growth potential</p>
              </div>

              <div className="mt-6 flex items-center justify-between rounded-2xl border border-[#c2b58d] bg-[#f7f2e4] p-3">
                <span className="text-[16px]">{isConnected ? formatAddress(address) : 'Wallet not connected'}</span>
                <button onClick={handleCopyAddress} className="w-10 h-10 rounded-xl border border-[#b8aa7d] bg-[#e9f0dc] flex items-center justify-center">
                  <Copy size={18} />
                </button>
              </div>
            </article>

            <article id="tokenomics" className="mockup-card p-6 md:p-9 flex flex-col">
              <h3 className="text-[52px] font-semibold leading-none">Tokenomics</h3>
              <div className="mt-6 flex-1">
                <div className="text-[34px] mb-4">✔ 1,000,0000</div>
                <ul className="space-y-3">
                  {TOKENOMICS.map((item) => (
                    <li key={item.label} className="flex items-center gap-3 text-[38px] leading-none">
                      <span className="w-5 h-5 rounded-full inline-block" style={{ backgroundColor: item.color }} />
                      <span>{item.label}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-5 flex items-end justify-between gap-4">
                <img src="/assets/hero-character.png" alt="tokenomics" className="w-[160px] md:w-[220px] object-contain" />
                <button className="mockup-cta">
                  READ MORE
                  <ArrowRight size={24} className="ml-2" />
                </button>
              </div>
            </article>
          </div>
        </div>
      </section>
    </div>
  )
}

export default LandingPageMockup
