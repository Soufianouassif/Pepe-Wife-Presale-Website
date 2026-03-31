import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWallet } from '../context/WalletContext'
import { formatAddress } from '../utils/format'
import LanguageSwitcher from '../components/LanguageSwitcher'
import { TOKENS_PER_USDT } from '../presaleConfig'

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
    <div className="min-h-screen bg-[#e9e4d4] text-[#1e3429]">
      <div className="max-w-[1280px] mx-auto px-3 lg:px-4 py-3">
        <header className="h-[86px] bg-[#f4efde] rounded-[14px] border border-[#b7ae90] flex items-center justify-between px-4 lg:px-6 shadow-[0_2px_0_#d4c8a8]">
          <div className="flex items-center gap-3 min-w-0">
            <img src="/assets/hero-character.png" alt="PepeWife" className="w-10 h-10 rounded-full object-cover border border-[#5d7049]" />
            <span className="text-[40px] leading-none font-semibold tracking-tight">PepeWife</span>
          </div>
          <nav className="hidden lg:flex items-center gap-10 text-[36px] leading-none">
            <a href="#home">Home</a>
            <a href="#buy">Buy</a>
            <a href="#tokenomics">Tokenomics</a>
            <a href="#roadmap">Roadmap</a>
            <a href="#faq">FAQ</a>
          </nav>
          <div className="flex items-center gap-2">
            <button onClick={handleBuyNow} className="hidden md:inline-flex items-center h-12 px-5 rounded-full border border-[#335f43] bg-[#e4ead4] text-[16px] font-semibold">Connect Wallet</button>
            <button onClick={handleBuyNow} className="inline-flex items-center h-12 px-6 rounded-full border border-[#2f5e3f] bg-[#2f6b3e] text-white text-[18px] font-semibold">BUY NOW</button>
            <LanguageSwitcher className="hidden sm:flex" />
            <button className="w-11 h-11 rounded-xl border border-[#b7ae90] bg-[#f4efde] text-[24px] leading-none">☰</button>
          </div>
        </header>

        <section id="home" className="relative mt-4 rounded-[12px] overflow-hidden border border-[#c6bd9f]">
          <img src="/assets/hero-section.svg" alt="Hero" className="w-full h-auto block" />
          <button onClick={handleBuyNow} className="absolute left-1/2 -translate-x-1/2 top-[49%] w-[25%] min-w-[170px] h-[12%] rounded-full opacity-0">buy</button>
        </section>

        <section className="relative mt-4 rounded-[12px] overflow-hidden border border-[#c6bd9f]">
          <img src="/assets/risk-bg.svg" alt="Texture" className="absolute inset-0 w-full h-full object-cover" />
          <div className="relative p-8 lg:p-10">
            <h2 className="text-center text-[74px] leading-[1.05] font-semibold">BE EARLY.. OR CRY LATER</h2>
            <p className="text-center text-[50px] mt-2">The most elegant memecoin presale</p>
            <div className="flex justify-center mt-6">
              <button onClick={handleBuyNow} className="h-16 px-10 rounded-full border-2 border-[#2e5d3e] bg-[#2f6b3e] text-white text-[34px] leading-none font-semibold">BUY NOW</button>
            </div>

            <div className="mt-7 bg-[#f7f2e3] rounded-[16px] border border-[#d2cab1] grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-[#d2cab1]">
              <div className="p-5 flex items-center gap-3"><span className="text-[34px]">🔒</span><div><p className="text-[44px] leading-none font-semibold">Liquidity Locked</p><p className="text-[28px]">Funds are secured</p></div></div>
              <div className="p-5 flex items-center gap-3"><span className="text-[34px]">✅</span><div><p className="text-[44px] leading-none font-semibold">Contract Verified</p><p className="text-[28px]">Audited safe contract</p></div></div>
              <div className="p-5 flex items-center gap-3"><span className="text-[34px]">🔥</span><div><p className="text-[44px] leading-none font-semibold">Early Phase</p><p className="text-[28px]">First buyers get best prices</p></div></div>
              <div className="p-5 flex items-center gap-3"><span className="text-[34px]">👥</span><div><p className="text-[44px] leading-none font-semibold">Growing Community</p><p className="text-[28px]">Join thousands of holders</p></div></div>
            </div>

            <div className="mt-6 grid lg:grid-cols-2 gap-5">
              <article id="buy" className="bg-[#f7f2e3] rounded-[18px] border border-[#d2cab1] p-6">
                <h3 className="text-[66px] leading-none font-semibold">Buy PWIFE</h3>
                <div className="space-y-3 mt-5">
                  <div className="rounded-[12px] border border-[#d2cab1] bg-[#fffdfa] px-4 py-3 flex items-center justify-between">
                    <span className="text-[40px]">Price 1 PWIFE</span>
                    <span className="text-[50px] font-semibold">$0.0103</span>
                  </div>
                  <div className="rounded-[12px] border border-[#d2cab1] bg-[#fffdfa] px-4 py-3 flex items-center justify-between">
                    <span className="text-[40px]">Amount</span>
                    <div className="flex items-center gap-2">
                      <input value={amount} onChange={(e) => setAmount(e.target.value)} className="w-[140px] text-right bg-transparent outline-none text-[42px] font-medium" />
                      <span className="text-[40px]">ETH ▾</span>
                    </div>
                  </div>
                  <div className="rounded-[12px] border border-[#c6bfab] bg-[#dce4ce] px-4 py-3 flex items-center justify-between">
                    <span className="text-[40px]">You receive</span>
                    <span className="text-[52px] font-semibold">{pwifeAmount} PWIFE</span>
                  </div>
                </div>
                <button onClick={handleBuyNow} className="mt-4 w-full h-16 rounded-full border-2 border-[#2e5d3e] bg-[#2f6b3e] text-white text-[40px] font-semibold leading-none">BUY NOW</button>
                <div className="mt-4 flex items-start justify-between gap-4">
                  <div className="space-y-2 text-[42px] leading-none">
                    <p>🔥 23 people bought in last hour</p>
                    <p>⏱ 09 Days, 12 HRS 32</p>
                    <p>✔ Low price before launch</p>
                    <p>✔ No vesting, no lock</p>
                    <p>✔ High growth potential</p>
                  </div>
                  <div className="w-24 h-24 rounded-[8px] bg-[#f0ead9] border border-[#cabf9f] flex items-center justify-center text-[22px]">QR</div>
                </div>
                <div className="mt-4 rounded-[10px] border border-[#d2cab1] bg-[#fffdfa] px-3 py-2 flex items-center justify-between">
                  <span className="text-[20px]">{isConnected ? formatAddress(address) : 'Wallet not connected'}</span>
                  <button onClick={handleCopyAddress} className="h-8 px-3 rounded border border-[#c8bf9f]">Copy</button>
                </div>
              </article>

              <article id="tokenomics" className="bg-[#f7f2e3] rounded-[18px] border border-[#d2cab1] p-6 flex flex-col">
                <h3 className="text-[66px] leading-none font-semibold">Tokenomics</h3>
                <div className="mt-3 flex-1 flex flex-col justify-between">
                  <div>
                    <p className="text-[50px]">✔ 1,0000000</p>
                    <ul className="mt-2 space-y-2 text-[58px] leading-none">
                      <li className="flex items-center gap-3"><span className="w-4 h-4 rounded-full bg-[#2f6b3e] inline-block" />Presale</li>
                      <li className="flex items-center gap-3"><span className="w-4 h-4 rounded-full bg-[#3b7f50] inline-block" />Liquidity</li>
                      <li className="flex items-center gap-3"><span className="w-4 h-4 rounded-full bg-[#b59a38] inline-block" />Marketing</li>
                      <li className="flex items-center gap-3"><span className="w-4 h-4 rounded-full bg-[#d8bf52] inline-block" />CEX Listings</li>
                    </ul>
                  </div>
                  <div className="mt-4 rounded-[12px] overflow-hidden border border-[#cabf9f]">
                    <img src="/assets/ChatGPT Image 31 mars 2026, 16_26_18.png" alt="Pepe" className="w-full h-auto block" />
                  </div>
                  <button className="mt-4 h-16 px-10 self-start rounded-full border-2 border-[#2e5d3e] bg-[#2f6b3e] text-white text-[38px] font-semibold">READ MORE</button>
                </div>
              </article>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default LandingPageMockup
