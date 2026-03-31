import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWallet } from '../context/WalletContext'
import { formatAddress } from '../utils/format'
import LanguageSwitcher from '../components/LanguageSwitcher'
import { TOKENS_PER_USDT } from '../presaleConfig'
import { formatTinyPrice } from '../utils/numberFormatters'

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

  const tinyPrice = formatTinyPrice(0.00000005)

  return (
    <div className="relative min-h-screen bg-[#E8E6D7] text-[#35503A] font-sans overflow-x-hidden">
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('/assets/risk-bg.svg')] bg-cover bg-center" />
      <div className="relative pt-[10px]">
        <header className="w-full h-[86px] bg-[#EADFC9] border-b border-[rgba(0,0,0,0.08)]">
          <div className="max-w-[1200px] mx-auto h-full px-3 lg:px-4 flex items-center justify-between">
            <div className="flex items-center gap-3 min-w-0">
              <img src="/assets/hero-character.png" alt="PepeWife" className="w-10 h-10 rounded-full object-cover border border-[#5d7049]" />
              <span className="text-[24px] leading-none font-bold tracking-tight truncate">PepeWife</span>
            </div>
            <nav className="hidden lg:flex items-center gap-8 text-[15px] leading-none font-normal min-w-0">
              <a href="#home">Home</a>
              <a href="#buy">Buy</a>
              <a href="#tokenomics">Tokenomics</a>
              <a href="#roadmap">Roadmap</a>
              <a href="#faq">FAQ</a>
            </nav>
            <div className="flex items-center gap-2 min-w-0">
              <button onClick={handleBuyNow} className="hidden md:inline-flex items-center h-10 px-4 rounded-full border border-[#335f43] bg-[#e4ead4] text-[13px] font-mono font-medium whitespace-nowrap">Connect Wallet</button>
              <button onClick={handleBuyNow} className="inline-flex items-center h-10 px-5 rounded-full border border-[#2f5e3f] bg-[#2f6b3e] text-white text-[13px] font-mono font-medium whitespace-nowrap">BUY NOW</button>
              <LanguageSwitcher className="hidden sm:flex" />
              <button className="w-10 h-10 rounded-xl border border-[#b7ae90] bg-[#EADFC9] text-[20px] leading-none">☰</button>
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
              The most elegant memecoin presale
            </p>
            <button onClick={handleBuyNow} className="mt-5 h-11 px-8 rounded-full border-2 border-[#2e5d3e] bg-[#2f6b3e] text-white text-[14px] sm:text-[16px] font-mono font-medium whitespace-nowrap">
              BUY NOW
            </button>
            <button onClick={handleBuyNow} className="mt-3 h-11 px-8 rounded-full border-2 border-white/70 bg-white/15 backdrop-blur-sm text-white text-[14px] sm:text-[16px] font-mono font-medium whitespace-nowrap">
              JOIN COMMUNITY
            </button>
          </div>
        </section>

        <div className="max-w-[1280px] mx-auto px-3 lg:px-4">
          <section className="relative mt-4 rounded-[12px] overflow-hidden border border-[#c6bd9f]">
            <img src="/assets/risk-bg.svg" alt="Texture" className="absolute inset-0 w-full h-full object-cover opacity-60" />
            <div className="relative p-4 sm:p-6 lg:p-8">
              <h2 className="text-center text-[24px] sm:text-[36px] lg:text-[56px] leading-[1.15] font-bold break-words">BE EARLY.. OR CRY LATER</h2>
              <p className="text-center text-[14px] sm:text-[18px] lg:text-[30px] mt-2 font-normal break-words">The most elegant memecoin presale</p>
              <div className="flex justify-center mt-4">
                <button onClick={handleBuyNow} className="h-11 px-8 rounded-full border-2 border-[#2e5d3e] bg-[#2f6b3e] text-white text-[14px] sm:text-[16px] font-mono font-medium whitespace-nowrap">BUY NOW</button>
              </div>

              <div className="mt-6 bg-[#F4EEDB] rounded-[16px] border border-[#d2cab1] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[#d2cab1]">
                <div className="p-4 flex items-center gap-3 min-w-0"><span className="text-[26px] shrink-0">🔒</span><div className="min-w-0"><p className="text-[20px] leading-[1.2] font-bold break-words">Liquidity Locked</p><p className="text-[13px] font-normal break-words">Funds are secured</p></div></div>
                <div className="p-4 flex items-center gap-3 min-w-0"><span className="text-[26px] shrink-0">✅</span><div className="min-w-0"><p className="text-[20px] leading-[1.2] font-bold break-words">Contract Verified</p><p className="text-[13px] font-normal break-words">Audited safe contract</p></div></div>
                <div className="p-4 flex items-center gap-3 min-w-0"><span className="text-[26px] shrink-0">🔥</span><div className="min-w-0"><p className="text-[20px] leading-[1.2] font-bold break-words">Early Phase</p><p className="text-[13px] font-normal break-words">First buyers get best prices</p></div></div>
                <div className="p-4 flex items-center gap-3 min-w-0"><span className="text-[26px] shrink-0">👥</span><div className="min-w-0"><p className="text-[20px] leading-[1.2] font-bold break-words">Growing Community</p><p className="text-[13px] font-normal break-words">Join thousands of holders</p></div></div>
              </div>

              <div className="mt-5 grid lg:grid-cols-2 gap-5 min-w-0">
                <article id="buy" className="bg-[#F4EEDB] rounded-[18px] border border-[#d2cab1] p-4 sm:p-5 min-w-0">
                  <h3 className="text-[28px] sm:text-[34px] leading-[1.1] font-bold break-words">Buy PWIFE</h3>
                  <div className="space-y-3 mt-4">
                    <div className="rounded-[12px] border border-[#d2cab1] bg-[#fffdfa] px-3 py-3 flex items-center justify-between gap-2 min-w-0">
                      <span className="text-[14px] font-normal min-w-0 break-words">Price 1 PWIFE</span>
                      <span className="text-[18px] sm:text-[20px] font-mono font-medium whitespace-nowrap">
                        ${tinyPrice.isTiny ? <>0.0<sup className="text-[10px]">{tinyPrice.zeroCount}</sup>{tinyPrice.significant}</> : tinyPrice.normal}
                      </span>
                    </div>
                    <div className="rounded-[12px] border border-[#d2cab1] bg-[#fffdfa] px-3 py-3 flex items-center justify-between gap-2 min-w-0">
                      <span className="text-[14px] font-normal">Amount</span>
                      <div className="flex items-center gap-2 min-w-0">
                        <input value={amount} onChange={(e) => setAmount(e.target.value)} className="w-[110px] sm:w-[130px] text-right bg-transparent outline-none text-[16px] sm:text-[18px] font-mono font-medium min-w-0" />
                        <span className="text-[14px] sm:text-[16px] font-normal whitespace-nowrap">ETH ▾</span>
                      </div>
                    </div>
                    <div className="rounded-[12px] border border-[#c6bfab] bg-[#dce4ce] px-3 py-3 flex items-center justify-between gap-2 min-w-0">
                      <span className="text-[14px] font-normal">You receive</span>
                      <span className="text-[18px] sm:text-[20px] font-mono font-medium min-w-0 truncate">{pwifeAmount} PWIFE</span>
                    </div>
                  </div>
                  <button onClick={handleBuyNow} className="mt-4 w-full h-11 rounded-full border-2 border-[#2e5d3e] bg-[#2f6b3e] text-white text-[14px] sm:text-[16px] font-mono font-medium">BUY NOW</button>
                  <div className="mt-4 flex items-start justify-between gap-3 min-w-0">
                    <div className="space-y-2 text-[13px] sm:text-[14px] leading-[1.4] font-normal min-w-0 break-words">
                      <p>🔥 23 people bought in last hour</p>
                      <p className="font-mono">⏱ 09 Days, 12 HRS 32</p>
                      <p>✔ Low price before launch</p>
                      <p>✔ No vesting, no lock</p>
                      <p>✔ High growth potential</p>
                    </div>
                    <div className="w-20 h-20 rounded-[8px] bg-[#f0ead9] border border-[#cabf9f] flex items-center justify-center text-[16px] shrink-0 font-mono">QR</div>
                  </div>
                  <div className="mt-4 rounded-[10px] border border-[#d2cab1] bg-[#fffdfa] px-3 py-2 flex items-center justify-between gap-2 min-w-0">
                    <span className="text-[13px] sm:text-[14px] font-normal min-w-0 truncate">{isConnected ? formatAddress(address) : 'Wallet not connected'}</span>
                    <button onClick={handleCopyAddress} className="h-8 px-3 rounded border border-[#c8bf9f] text-[12px] font-mono font-medium whitespace-nowrap">Copy</button>
                  </div>
                </article>

                <article id="tokenomics" className="bg-[#F4EEDB] rounded-[18px] border border-[#d2cab1] p-4 sm:p-5 flex flex-col min-w-0">
                  <h3 className="text-[28px] sm:text-[34px] leading-[1.1] font-bold break-words">Tokenomics</h3>
                  <div className="mt-3 min-w-0">
                    <div className="rounded-[12px] border border-dashed border-[#cabf9f] bg-[#efe9d8] h-[240px] sm:h-[280px] flex items-center justify-center">
                      <span className="font-mono text-[16px] sm:text-[18px] text-[#6d745f]">IMAGE HERE</span>
                    </div>
                    <div className="mt-4 text-center">
                      <p className="text-[14px] sm:text-[16px] font-bold">Phase 1 ends in</p>
                      <div className="mt-2 flex items-center justify-center gap-2 sm:gap-3">
                        <div className="min-w-[64px] sm:min-w-[76px] rounded-[10px] border border-[#d2cab1] bg-[#fffdfa] py-2 px-3">
                          <p className="font-mono text-[20px] sm:text-[24px] leading-none">09</p>
                          <p className="text-[11px] sm:text-[12px] mt-1">Days</p>
                        </div>
                        <div className="min-w-[64px] sm:min-w-[76px] rounded-[10px] border border-[#d2cab1] bg-[#fffdfa] py-2 px-3">
                          <p className="font-mono text-[20px] sm:text-[24px] leading-none">12</p>
                          <p className="text-[11px] sm:text-[12px] mt-1">Hours</p>
                        </div>
                        <div className="min-w-[64px] sm:min-w-[76px] rounded-[10px] border border-[#d2cab1] bg-[#fffdfa] py-2 px-3">
                          <p className="font-mono text-[20px] sm:text-[24px] leading-none">32</p>
                          <p className="text-[11px] sm:text-[12px] mt-1">Minutes</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default LandingPageMockup
