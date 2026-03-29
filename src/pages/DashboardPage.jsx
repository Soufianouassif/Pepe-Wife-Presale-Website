import React, { useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { ethers } from 'ethers'
import { Connection, PublicKey } from '@solana/web3.js'
import { useWallet } from '../context/WalletContext'
import { formatAddress } from '../utils/format'
import { calculateProfit } from '../utils/calculator'
import { getDashboardStats, submitPresaleIntent } from '../services/dashboardApi'
import { isValidEvmAddress, isValidSolAddress } from '../wallet/adapters'
import LanguageSwitcher from '../components/LanguageSwitcher'
import { PRESALE_CONFIG, CURRENT_TOKEN_PRICE_USD, TOTAL_PRESALE_SUPPLY, CURRENT_PHASE_SUPPLY } from '../presaleConfig'
import {
  LayoutDashboard, ShoppingCart, Users, HandCoins, Lock, LifeBuoy, Wallet, LogOut,
  Menu, X, Copy, ExternalLink, Sun, Moon, CheckCircle2, AlertTriangle, Loader2
} from 'lucide-react'

const USDT_MAINNET = '0xdAC17F958D2ee523a2206206994597C13D831ec7'
const ERC20_ABI = ['function balanceOf(address owner) view returns (uint256)']

const navLinks = [
  { href: '/#tokenomics', labelKey: 'nav.tokenomics' },
  { href: '/#roadmap', labelKey: 'nav.roadmap' },
  { href: '/#faq', labelKey: 'nav.faq' },
  { href: '/#about', labelKey: 'nav.about' }
]

const sidebarItems = [
  { id: 'overview', labelKey: 'dashboard_pro.sidebar.overview', icon: LayoutDashboard, enabled: true },
  { id: 'buy', labelKey: 'dashboard_pro.sidebar.buy', icon: ShoppingCart, enabled: true },
  { id: 'referral', labelKey: 'dashboard_pro.sidebar.referral', icon: Users, enabled: false },
  { id: 'claim', labelKey: 'dashboard_pro.sidebar.claim', icon: HandCoins, enabled: false },
  { id: 'staking', labelKey: 'dashboard_pro.sidebar.staking', icon: Lock, enabled: false },
  { id: 'support', labelKey: 'dashboard_pro.sidebar.support', icon: LifeBuoy, enabled: true },
  { id: 'wallet', labelKey: 'dashboard_pro.sidebar.wallet', icon: Wallet, enabled: true }
]

const DashboardPage = () => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const {
    isConnected,
    address,
    walletType,
    disconnect,
    signMessage
  } = useWallet()
  const isRTL = i18n.language === 'ar'
  const brandParts = t('brand.name').split(' ')

  const [activeSection, setActiveSection] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [theme, setTheme] = useState(() => localStorage.getItem('dashboard-theme') || 'light')
  const [stats, setStats] = useState({
    tokenPriceUsd: CURRENT_TOKEN_PRICE_USD,
    totalSupply: TOTAL_PRESALE_SUPPLY,
    presaleAvailable: CURRENT_PHASE_SUPPLY,
    marketCapUsd: CURRENT_TOKEN_PRICE_USD * TOTAL_PRESALE_SUPPLY,
    liquidityUsd: 2_450_000,
    holders: 12489,
    solUsd: 185,
    usdtUsd: 1,
    currentPhase: PRESALE_CONFIG.currentPhase.id,
    totalPhases: PRESALE_CONFIG.totalPhases
  })
  const [statsLoading, setStatsLoading] = useState(true)
  const [notification, setNotification] = useState(null)
  const [copied, setCopied] = useState(false)
  const [walletBalances, setWalletBalances] = useState({ sol: null, usdt: null })
  const [walletBalancesLoading, setWalletBalancesLoading] = useState(false)

  const [roiInvestment, setRoiInvestment] = useState('1000')
  const [roiTargetPrice, setRoiTargetPrice] = useState('0.0003')

  const [buyCurrency, setBuyCurrency] = useState('SOL')
  const [buyTokenAmount, setBuyTokenAmount] = useState('')
  const [txProcessing, setTxProcessing] = useState(false)

  const supportUrl = import.meta?.env?.VITE_SUPPORT_URL || 'mailto:support@pepewife.io'
  const explorerUrl = useMemo(() => {
    if (!address) return '#'
    if (isValidSolAddress(address)) return `https://explorer.solana.com/address/${address}`
    if (isValidEvmAddress(address)) return `https://etherscan.io/address/${address}`
    return '#'
  }, [address])

  useEffect(() => {
    if (!isConnected) navigate('/connect')
  }, [isConnected, navigate])

  useEffect(() => {
    localStorage.setItem('dashboard-theme', theme)
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  useEffect(() => {
    let mounted = true
    const loadStats = async () => {
      try {
        setStatsLoading(true)
        const data = await getDashboardStats()
        if (mounted) setStats(data)
      } finally {
        if (mounted) setStatsLoading(false)
      }
    }
    loadStats()
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    let mounted = true
    const loadBalances = async () => {
      if (!address) return
      try {
        setWalletBalancesLoading(true)
        const next = { sol: null, usdt: null }
        if (isValidSolAddress(address)) {
          const connection = new Connection('https://api.mainnet-beta.solana.com', 'confirmed')
          const lamports = await connection.getBalance(new PublicKey(address))
          next.sol = lamports / 1_000_000_000
        }
        if (isValidEvmAddress(address) && typeof window !== 'undefined' && window.ethereum) {
          const provider = new ethers.BrowserProvider(window.ethereum)
          const usdtContract = new ethers.Contract(USDT_MAINNET, ERC20_ABI, provider)
          const usdtRaw = await usdtContract.balanceOf(address)
          next.usdt = Number(ethers.formatUnits(usdtRaw, 6))
        }
        if (mounted) setWalletBalances(next)
      } catch {
        if (mounted) setWalletBalances({ sol: null, usdt: null })
      } finally {
        if (mounted) setWalletBalancesLoading(false)
      }
    }
    loadBalances()
    return () => {
      mounted = false
    }
  }, [address, walletType, isConnected])

  const notify = (type, message) => {
    setNotification({ type, message, id: Date.now() })
    setTimeout(() => setNotification(null), 3800)
  }

  const handleLogout = async () => {
    await disconnect()
    navigate('/')
  }

  const handleCopy = async () => {
    if (!address) return
    await navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 1800)
  }

  const roiResult = useMemo(() => {
    return calculateProfit(roiInvestment, stats.tokenPriceUsd, roiTargetPrice, 0)
  }, [roiInvestment, roiTargetPrice, stats.tokenPriceUsd])

  const buyTotalCost = useMemo(() => {
    const qty = Number(buyTokenAmount || 0)
    if (!qty || qty <= 0) return 0
    return qty * stats.tokenPriceUsd
  }, [buyTokenAmount, stats.tokenPriceUsd])

  const buyCostInSelectedCurrency = useMemo(() => {
    if (!buyTotalCost) return 0
    if (buyCurrency === 'SOL') return buyTotalCost / Math.max(stats.solUsd, 1)
    return buyTotalCost / Math.max(stats.usdtUsd, 1)
  }, [buyTotalCost, buyCurrency, stats.solUsd, stats.usdtUsd])

  const handleBuy = async () => {
    const qty = Number(buyTokenAmount || 0)
    if (!address || qty <= 0) {
      notify('error', t('dashboard_pro.notifications.invalid_amount'))
      return
    }
    if (buyCurrency === 'SOL' && !isValidSolAddress(address)) {
      notify('error', t('dashboard_pro.notifications.require_solana'))
      return
    }
    if (buyCurrency === 'USDT' && !isValidEvmAddress(address)) {
      notify('error', t('dashboard_pro.notifications.require_evm'))
      return
    }
    try {
      setTxProcessing(true)
      const nonce = Date.now()
      const payload = `PWIFE_PRESALE_BUY|address=${address}|token=${qty}|currency=${buyCurrency}|nonce=${nonce}`
      const signature = await signMessage(payload)
      if (!signature) {
        notify('error', t('dashboard_pro.notifications.signature_failed'))
        return
      }
      await submitPresaleIntent({
        address,
        tokenAmount: qty,
        paymentCurrency: buyCurrency,
        quoteUsd: buyTotalCost,
        signature
      })
      notify('success', t('dashboard_pro.notifications.buy_success'))
      setBuyTokenAmount('')
    } catch (error) {
      notify('error', error?.userMessage || error?.message || t('dashboard_pro.notifications.buy_failed'))
    } finally {
      setTxProcessing(false)
    }
  }

  const cardBase = theme === 'dark'
    ? 'bg-[#0f172a] border-gray-700 text-white'
    : 'bg-white border-pepe-black text-pepe-black'

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#020617] text-white' : 'bg-[#F8FAFC] text-pepe-black'} ${isRTL ? 'rtl' : 'ltr'}`}>
      <header className={`sticky top-0 z-40 border-b-2 ${theme === 'dark' ? 'bg-[#0b1224]/90 border-gray-800' : 'bg-white/95 border-gray-100'} backdrop-blur`}>
        <div className="px-4 lg:px-8 h-20 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen((v) => !v)} className={`lg:hidden p-2 rounded-xl border-2 ${theme === 'dark' ? 'border-gray-700' : 'border-pepe-black'}`}>
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <button onClick={() => navigate('/')} className="font-black italic text-2xl">
              {brandParts[0] || 'PEPE'}<span className="text-pepe-pink">{brandParts[1] || 'WIFE'}</span>
            </button>
          </div>
          <nav className="hidden lg:flex items-center gap-6">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className={`font-black text-sm ${theme === 'dark' ? 'text-gray-200 hover:text-pepe-yellow' : 'text-gray-700 hover:text-pepe-pink'}`}>
                {t(link.labelKey)}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <LanguageSwitcher className="hidden md:flex" />
            <button onClick={() => setTheme((v) => (v === 'dark' ? 'light' : 'dark'))} className={`w-11 h-11 rounded-xl border-2 flex items-center justify-center ${theme === 'dark' ? 'border-gray-700' : 'border-pepe-black'}`}>
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <div className={`hidden sm:flex items-center px-4 h-11 rounded-xl border-2 ${theme === 'dark' ? 'border-gray-700' : 'border-pepe-black'}`}>
              <span className="font-black text-xs">{formatAddress(address)}</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className={`${sidebarOpen ? 'translate-x-0' : (isRTL ? 'translate-x-full' : '-translate-x-full')} lg:translate-x-0 fixed lg:static inset-y-0 top-20 ${isRTL ? 'right-0' : 'left-0'} z-30 w-72 p-4 transition-transform duration-300`}>
          <div className={`h-full rounded-3xl border-4 p-4 ${cardBase}`}>
            <div className="space-y-2">
              {sidebarItems.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveSection(item.id)
                      setSidebarOpen(false)
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all ${
                      activeSection === item.id
                        ? 'bg-pepe-black text-white border-pepe-black'
                        : `${theme === 'dark' ? 'border-gray-700 text-gray-200' : 'border-pepe-black/20 text-pepe-black'}`
                    } ${!item.enabled ? 'opacity-60' : ''}`}
                  >
                    <span className="flex items-center gap-3">
                      <Icon size={18} />
                      <span className="font-black text-sm">{t(item.labelKey)}</span>
                    </span>
                    {!item.enabled && <span className="text-[10px] font-black">{t('dashboard_pro.soon')}</span>}
                  </button>
                )
              })}
            </div>
            <button
              onClick={handleLogout}
              className={`mt-4 w-full flex items-center justify-center gap-2 p-3 rounded-xl border-2 font-black ${theme === 'dark' ? 'border-red-500/40 text-red-300' : 'border-red-500/30 text-red-600'}`}
            >
              <LogOut size={16} />
              {t('dashboard_pro.logout')}
            </button>
          </div>
        </aside>

        <main className="flex-1 p-4 lg:p-8">
          <AnimatePresence>
            {notification && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`mb-5 p-4 rounded-2xl border-2 flex items-center gap-3 ${
                  notification.type === 'success'
                    ? 'bg-green-50 border-green-300 text-green-700'
                    : 'bg-red-50 border-red-300 text-red-700'
                }`}
              >
                {notification.type === 'success' ? <CheckCircle2 size={18} /> : <AlertTriangle size={18} />}
                <span className="font-black text-sm">{notification.message}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {activeSection === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className={`rounded-3xl border-4 p-6 ${cardBase}`}>
                  <p className="text-xs font-black opacity-60">{t('dashboard_pro.overview.total_supply')}</p>
                  <p className="text-3xl font-black mt-2">{stats.totalSupply.toLocaleString()} PWIFE</p>
                </div>
                <div className={`rounded-3xl border-4 p-6 ${cardBase}`}>
                  <p className="text-xs font-black opacity-60">{t('dashboard_pro.overview.presale_available')}</p>
                  <p className="text-3xl font-black mt-2">{stats.presaleAvailable.toLocaleString()} PWIFE</p>
                </div>
                <div className={`rounded-3xl border-4 p-6 ${cardBase}`}>
                  <p className="text-xs font-black opacity-60">{t('dashboard_pro.overview.token_price')}</p>
                  <p className="text-3xl font-black mt-2">${stats.tokenPriceUsd.toFixed(8)}</p>
                  <p className="text-xs font-black opacity-60 mt-2">{t('dashboard_pro.overview.phase_status', { current: stats.currentPhase || PRESALE_CONFIG.currentPhase.id, total: stats.totalPhases || PRESALE_CONFIG.totalPhases })}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <div className={`rounded-3xl border-4 p-6 ${cardBase}`}>
                  <h3 className="text-xl font-black mb-4">{t('dashboard_pro.overview.roi_calculator')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <input value={roiInvestment} onChange={(e) => setRoiInvestment(e.target.value)} type="number" placeholder={t('dashboard_pro.overview.investment_placeholder')} className={`p-3 rounded-xl border-2 font-bold ${theme === 'dark' ? 'bg-[#111827] border-gray-700' : 'bg-white border-pepe-black/20'}`} />
                    <input value={roiTargetPrice} onChange={(e) => setRoiTargetPrice(e.target.value)} type="number" placeholder={t('dashboard_pro.overview.target_placeholder')} className={`p-3 rounded-xl border-2 font-bold ${theme === 'dark' ? 'bg-[#111827] border-gray-700' : 'bg-white border-pepe-black/20'}`} />
                  </div>
                  {'error' in roiResult ? (
                    <p className="text-sm font-black text-red-500 mt-4">{t('dashboard_pro.overview.invalid_roi')}</p>
                  ) : (
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <div className={`p-4 rounded-xl border-2 ${theme === 'dark' ? 'border-gray-700' : 'border-pepe-black/10'}`}>
                        <p className="text-xs font-black opacity-60">{t('dashboard_pro.overview.profit')}</p>
                        <p className="text-xl font-black mt-1">${Number(roiResult.profit).toLocaleString()}</p>
                      </div>
                      <div className={`p-4 rounded-xl border-2 ${theme === 'dark' ? 'border-gray-700' : 'border-pepe-black/10'}`}>
                        <p className="text-xs font-black opacity-60">{t('dashboard_pro.overview.roi')}</p>
                        <p className="text-xl font-black mt-1">{roiResult.roi}%</p>
                      </div>
                    </div>
                  )}
                </div>

                <div className={`rounded-3xl border-4 p-6 ${cardBase}`}>
                  <h3 className="text-xl font-black mb-4">{t('dashboard_pro.overview.stats_title')}</h3>
                  {statsLoading ? (
                    <div className="h-40 flex items-center justify-center">
                      <Loader2 className="animate-spin" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className={`p-4 rounded-xl border-2 ${theme === 'dark' ? 'border-gray-700' : 'border-pepe-black/10'}`}>
                        <p className="text-xs font-black opacity-60">{t('dashboard_pro.overview.market_cap')}</p>
                        <p className="text-xl font-black mt-1">${Math.round(stats.marketCapUsd).toLocaleString()}</p>
                      </div>
                      <div className={`p-4 rounded-xl border-2 ${theme === 'dark' ? 'border-gray-700' : 'border-pepe-black/10'}`}>
                        <p className="text-xs font-black opacity-60">{t('dashboard_pro.overview.total_liquidity')}</p>
                        <p className="text-xl font-black mt-1">${Math.round(stats.liquidityUsd).toLocaleString()}</p>
                      </div>
                      <div className={`p-4 rounded-xl border-2 ${theme === 'dark' ? 'border-gray-700' : 'border-pepe-black/10'}`}>
                        <p className="text-xs font-black opacity-60">{t('dashboard_pro.overview.holders')}</p>
                        <p className="text-xl font-black mt-1">{stats.holders.toLocaleString()}</p>
                      </div>
                      <div className={`p-4 rounded-xl border-2 ${theme === 'dark' ? 'border-gray-700' : 'border-pepe-black/10'}`}>
                        <p className="text-xs font-black opacity-60">{t('dashboard_pro.overview.pairs')}</p>
                        <p className="text-xl font-black mt-1">${stats.solUsd.toFixed(2)} / ${stats.usdtUsd.toFixed(2)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeSection === 'buy' && (
            <div className={`rounded-3xl border-4 p-6 space-y-6 ${cardBase}`}>
              <h3 className="text-2xl font-black">{t('dashboard_pro.buy.title')}</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className={`p-4 rounded-xl border-2 ${theme === 'dark' ? 'border-gray-700' : 'border-pepe-black/10'}`}>
                    <p className="text-xs font-black opacity-60">{t('dashboard_pro.buy.current_price')}</p>
                    <p className="text-2xl font-black mt-1">${stats.tokenPriceUsd.toFixed(8)}</p>
                    <p className="text-[11px] font-black opacity-60 mt-1">{t('dashboard_pro.buy.phase_supply', { supply: Number(stats.presaleAvailable || 0).toLocaleString() })}</p>
                  </div>
                  <label className="text-sm font-black">{t('dashboard_pro.buy.payment_currency')}</label>
                  <div className="grid grid-cols-2 gap-3">
                    {['SOL', 'USDT'].map((currency) => (
                      <button key={currency} onClick={() => setBuyCurrency(currency)} className={`p-3 rounded-xl border-2 font-black ${buyCurrency === currency ? 'bg-pepe-black text-white border-pepe-black' : (theme === 'dark' ? 'border-gray-700' : 'border-pepe-black/20')}`}>
                        {currency}
                      </button>
                    ))}
                  </div>
                  <label className="text-sm font-black">{t('dashboard_pro.buy.token_amount')}</label>
                  <input value={buyTokenAmount} onChange={(e) => setBuyTokenAmount(e.target.value)} type="number" placeholder={t('dashboard_pro.buy.token_amount_placeholder')} className={`w-full p-3 rounded-xl border-2 font-bold ${theme === 'dark' ? 'bg-[#111827] border-gray-700' : 'bg-white border-pepe-black/20'}`} />
                  <div className={`p-4 rounded-xl border-2 ${theme === 'dark' ? 'border-gray-700' : 'border-pepe-black/10'}`}>
                    <p className="text-xs font-black opacity-60">{t('dashboard_pro.buy.total_cost')}</p>
                    <p className="text-xl font-black mt-1">${buyTotalCost.toFixed(2)} ≈ {buyCostInSelectedCurrency.toFixed(4)} {buyCurrency}</p>
                  </div>
                </div>
                <div className={`rounded-2xl border-2 p-5 ${theme === 'dark' ? 'border-gray-700 bg-[#111827]' : 'border-pepe-black/10 bg-gray-50'}`}>
                  <h4 className="font-black text-lg mb-3">{t('dashboard_pro.buy.security_title')}</h4>
                  <ul className="space-y-2 text-sm font-bold">
                    <li>{t('dashboard_pro.buy.security_1')}</li>
                    <li>{t('dashboard_pro.buy.security_2')}</li>
                    <li>{t('dashboard_pro.buy.security_3')}</li>
                  </ul>
                  <button
                    onClick={handleBuy}
                    disabled={txProcessing || !buyTokenAmount || Number(buyTokenAmount) <= 0}
                    className="mt-5 w-full p-4 rounded-xl border-2 border-pepe-black bg-pepe-pink text-white font-black disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {txProcessing && <Loader2 className="animate-spin" size={18} />}
                    {txProcessing ? t('dashboard_pro.buy.processing') : t('dashboard_pro.buy.confirm')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {['referral', 'claim', 'staking'].includes(activeSection) && (
            <div className={`rounded-3xl border-4 p-8 text-center ${cardBase}`}>
              <p className="text-3xl font-black">{t('dashboard_pro.soon')}</p>
              <p className="text-sm font-bold opacity-70 mt-2">{t('dashboard_pro.soon_desc')}</p>
            </div>
          )}

          {activeSection === 'support' && (
            <div className={`rounded-3xl border-4 p-8 ${cardBase}`}>
              <h3 className="text-2xl font-black mb-3">{t('dashboard_pro.support.title')}</h3>
              <p className="text-sm font-bold opacity-80 mb-6">{t('dashboard_pro.support.desc')}</p>
              <a href={supportUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-pepe-black bg-pepe-yellow font-black">
                {t('dashboard_pro.support.open')}
                <ExternalLink size={16} />
              </a>
            </div>
          )}

          {activeSection === 'wallet' && (
            <div className={`rounded-3xl border-4 p-6 space-y-6 ${cardBase}`}>
              <h3 className="text-2xl font-black">{t('dashboard_pro.wallet.title')}</h3>
              <div className={`rounded-2xl border-2 p-4 ${theme === 'dark' ? 'border-gray-700' : 'border-pepe-black/10'}`}>
                <p className="text-xs font-black opacity-60">{t('dashboard_pro.wallet.connected_address')}</p>
                <p className="font-black break-all mt-1">{address || '---'}</p>
                <div className="flex flex-wrap gap-3 mt-4">
                  <button onClick={handleCopy} className="px-4 py-2 rounded-xl border-2 border-pepe-black font-black flex items-center gap-2">
                    <Copy size={14} />
                    {copied ? t('dashboard_pro.wallet.copied') : t('dashboard_pro.wallet.copy')}
                  </button>
                  <a href={explorerUrl} target="_blank" rel="noreferrer" className="px-4 py-2 rounded-xl border-2 border-pepe-black font-black flex items-center gap-2">
                    {t('dashboard_pro.wallet.explorer')}
                    <ExternalLink size={14} />
                  </a>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className={`rounded-2xl border-2 p-4 ${theme === 'dark' ? 'border-gray-700' : 'border-pepe-black/10'}`}>
                  <p className="text-xs font-black opacity-60">{t('dashboard_pro.wallet.sol_balance')}</p>
                  <p className="text-2xl font-black mt-1">{walletBalancesLoading ? '...' : (walletBalances.sol === null ? '--' : walletBalances.sol.toFixed(4))}</p>
                </div>
                <div className={`rounded-2xl border-2 p-4 ${theme === 'dark' ? 'border-gray-700' : 'border-pepe-black/10'}`}>
                  <p className="text-xs font-black opacity-60">{t('dashboard_pro.wallet.usdt_balance')}</p>
                  <p className="text-2xl font-black mt-1">{walletBalancesLoading ? '...' : (walletBalances.usdt === null ? '--' : walletBalances.usdt.toFixed(2))}</p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/40 lg:hidden z-20"
          />
        )}
      </AnimatePresence>
    </div>
  )
}

export default DashboardPage
