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
import BrandLogo from '../components/BrandLogo'
import { PRESALE_CONFIG, CURRENT_TOKEN_PRICE_USD, TOTAL_PRESALE_SUPPLY, CURRENT_PHASE_SUPPLY } from '../presaleConfig'
import EthereumUsdtNotice from '../components/EthereumUsdtNotice'
import AppIcon from '../components/AppIcon'
import { PROJECT_CURRENCY_NAME } from '../constants/projectConstants'
import { getPaymentRange, validatePaymentAmount, clampPaymentAmount } from '../utils/amountValidation'
import {
  AppShell,
  PageContainer,
  Navbar as DsNavbar,
  Sidebar as DsSidebar,
  SidebarItem,
  ContentSection,
  SectionHeader,
  Card,
  GlassCard,
  StatsCard,
  PrimaryButton,
  SecondaryButton,
  Input,
  CopyInput,
  ProgressCard,
  TableCard,
  EmptyState,
  Badge,
  StatusPill
} from '../components/dashboard/DesignSystem'

const USDT_MAINNET = '0xdAC17F958D2ee523a2206206994597C13D831ec7'
const ERC20_ABI = ['function balanceOf(address owner) view returns (uint256)']

const navLinks = [
  { href: '/#tokenomics', labelKey: 'nav.tokenomics' },
  { href: '/#roadmap', labelKey: 'nav.roadmap' },
  { href: '/#faq', labelKey: 'nav.faq' },
  { href: '/#about', labelKey: 'nav.about' }
]

const sidebarItems = [
  { id: 'overview', labelKey: 'dashboard_pro.sidebar.overview', icon: 'dashboard', enabled: true },
  { id: 'buy', labelKey: 'dashboard_pro.sidebar.buy', icon: 'shopping_cart', enabled: true },
  { id: 'transactions', labelKey: 'dashboard_pro.sidebar.transactions', icon: 'calendar_month', enabled: true },
  { id: 'performance', labelKey: 'dashboard_pro.sidebar.performance', icon: 'monitoring', enabled: true },
  { id: 'tokens', labelKey: 'dashboard_pro.sidebar.tokens', icon: 'token', enabled: true },
  { id: 'referral', labelKey: 'dashboard_pro.sidebar.referral', icon: 'groups', enabled: true },
  { id: 'claim', labelKey: 'dashboard_pro.sidebar.claim', icon: 'redeem', enabled: false },
  { id: 'staking', labelKey: 'dashboard_pro.sidebar.staking', icon: 'lock', enabled: false },
  { id: 'support', labelKey: 'dashboard_pro.sidebar.support', icon: 'support_agent', enabled: true },
  { id: 'wallet', labelKey: 'dashboard_pro.sidebar.wallet', icon: 'account_balance_wallet', enabled: true }
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

  const [activeSection, setActiveSection] = useState('buy')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [theme] = useState('light')
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
  const [copied, setCopied] = useState('')
  const [walletBalances, setWalletBalances] = useState({ sol: null, usdt: null })
  const [walletBalancesLoading, setWalletBalancesLoading] = useState(false)
  const [txTypeFilter, setTxTypeFilter] = useState('all')
  const [txRangeFilter, setTxRangeFilter] = useState('30d')
  const [performanceRange, setPerformanceRange] = useState('30d')

  const [roiInvestment, setRoiInvestment] = useState('1000')
  const [roiTargetPrice, setRoiTargetPrice] = useState('0.0003')

  const [buyCurrency, setBuyCurrency] = useState('SOL')
  const [buyPaymentAmount, setBuyPaymentAmount] = useState('')
  const [buyAmountError, setBuyAmountError] = useState('')
  const [txProcessing, setTxProcessing] = useState(false)
  const [transactions, setTransactions] = useState([
    { id: 'tx-1001', date: '2026-03-26T09:10:00Z', type: 'buy', currency: 'USDT', tokenAmount: 600000, usdAmount: 30, status: 'confirmed' },
    { id: 'tx-1002', date: '2026-03-25T15:40:00Z', type: 'referral', currency: 'USDT', tokenAmount: 100000, usdAmount: 5, status: 'confirmed' },
    { id: 'tx-1003', date: '2026-03-23T12:30:00Z', type: 'buy', currency: 'SOL', tokenAmount: 1400000, usdAmount: 70, status: 'confirmed' },
    { id: 'tx-1004', date: '2026-03-20T07:20:00Z', type: 'claim', currency: 'PWIFE', tokenAmount: 250000, usdAmount: 0, status: 'confirmed' }
  ])

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
    document.documentElement.classList.remove('dark')
  }, [])

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

  const handleCopy = async (text, type) => {
    if (!text) return
    await navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(''), 1800)
  }

  const roiResult = useMemo(() => {
    return calculateProfit(roiInvestment, stats.tokenPriceUsd, roiTargetPrice, 0)
  }, [roiInvestment, roiTargetPrice, stats.tokenPriceUsd])

  const buyRange = useMemo(() => getPaymentRange(buyCurrency), [buyCurrency])

  const buyCostInSelectedCurrency = useMemo(() => {
    const pay = Number(buyPaymentAmount || 0)
    if (!pay || pay <= 0) return 0
    return pay
  }, [buyPaymentAmount])

  const buyTotalCost = useMemo(() => {
    if (!buyCostInSelectedCurrency) return 0
    if (buyCurrency === 'SOL') return buyCostInSelectedCurrency * Math.max(stats.solUsd, 1)
    return buyCostInSelectedCurrency * Math.max(stats.usdtUsd, 1)
  }, [buyCostInSelectedCurrency, buyCurrency, stats.solUsd, stats.usdtUsd])

  const buyTokenAmount = useMemo(() => {
    if (!buyTotalCost || !stats.tokenPriceUsd) return 0
    return Math.floor(buyTotalCost / stats.tokenPriceUsd)
  }, [buyTotalCost, stats.tokenPriceUsd])

  const handleBuyAmountChange = (raw) => {
    setBuyPaymentAmount(raw)
    if (raw === '') {
      setBuyAmountError('')
      return
    }
    const validation = validatePaymentAmount(raw, buyCurrency)
    if (!validation.valid) {
      setBuyAmountError(t('validation.amount_range', { min: validation.min, max: validation.max }))
      return
    }
    setBuyAmountError('')
  }

  const handleBuyAmountBlur = () => {
    if (buyPaymentAmount === '') return
    const validation = validatePaymentAmount(buyPaymentAmount, buyCurrency)
    if (!validation.valid) {
      setBuyPaymentAmount(clampPaymentAmount(buyPaymentAmount, buyCurrency))
    }
  }

  const totalWalletUsd = useMemo(() => {
    const solUsd = walletBalances.sol === null ? 0 : walletBalances.sol * stats.solUsd
    const usdtUsd = walletBalances.usdt === null ? 0 : walletBalances.usdt
    return solUsd + usdtUsd
  }, [walletBalances.sol, walletBalances.usdt, stats.solUsd])

  const filteredTransactions = useMemo(() => {
    const now = Date.now()
    const daysMap = { '7d': 7, '30d': 30, '90d': 90, all: 9999 }
    const maxDays = daysMap[txRangeFilter] || 30
    return transactions.filter((tx) => {
      const byType = txTypeFilter === 'all' ? true : tx.type === txTypeFilter
      const diffDays = (now - new Date(tx.date).getTime()) / 86_400_000
      const byRange = txRangeFilter === 'all' ? true : diffDays <= maxDays
      return byType && byRange
    })
  }, [transactions, txTypeFilter, txRangeFilter])

  const buyTransactions = useMemo(() => transactions.filter((tx) => tx.type === 'buy'), [transactions])
  const totalBoughtTokens = useMemo(() => buyTransactions.reduce((sum, tx) => sum + tx.tokenAmount, 0), [buyTransactions])

  const performanceSeries = useMemo(() => {
    const pointsMap = { '7d': 7, '30d': 12, '90d': 20 }
    const points = pointsMap[performanceRange] || 12
    return Array.from({ length: points }).map((_, i) => {
      const base = stats.tokenPriceUsd
      const wave = Math.sin(i / 2.4) * (base * 0.16)
      const trend = i * (base * 0.02)
      const value = Number((base + wave + trend).toFixed(10))
      return { label: `${i + 1}`, value }
    })
  }, [performanceRange, stats.tokenPriceUsd])

  const chartPath = useMemo(() => {
    if (!performanceSeries.length) return ''
    const values = performanceSeries.map((d) => d.value)
    const min = Math.min(...values)
    const max = Math.max(...values)
    const spread = Math.max(max - min, 0.000000001)
    return performanceSeries.map((d, i) => {
      const x = (i / Math.max(performanceSeries.length - 1, 1)) * 100
      const y = 100 - ((d.value - min) / spread) * 100
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
    }).join(' ')
  }, [performanceSeries])

  const referralCode = useMemo(() => (address ? `${address.slice(0, 6)}${address.slice(-4)}` : 'guest0000'), [address])
  const referralLink = useMemo(() => {
    if (typeof window === 'undefined') return `https://pepewife.io/?ref=${referralCode}`
    return `${window.location.origin}/?ref=${referralCode}`
  }, [referralCode])
  const referralStats = useMemo(() => ({
    invitedFriends: 18,
    activeReferrals: 9,
    earnedUsd: 386.4,
    nextRewardUsd: 500
  }), [])
  const referralProgress = Math.min(100, Math.round((referralStats.earnedUsd / referralStats.nextRewardUsd) * 100))

  const handleBuy = async () => {
    const qty = Number(buyTokenAmount || 0)
    const validation = validatePaymentAmount(buyPaymentAmount, buyCurrency)
    if (!validation.valid) {
      notify('error', t('validation.amount_range', { min: validation.min, max: validation.max }))
      return
    }
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
      setTransactions((prev) => [
        {
          id: `tx-${Date.now()}`,
          date: new Date().toISOString(),
          type: 'buy',
          currency: buyCurrency,
          tokenAmount: qty,
          usdAmount: buyTotalCost,
          status: 'confirmed'
        },
        ...prev
      ])
      notify('success', t('dashboard_pro.notifications.buy_success'))
      setBuyPaymentAmount('')
      setBuyAmountError('')
    } catch (error) {
      notify('error', error?.userMessage || error?.message || t('dashboard_pro.notifications.buy_failed'))
    } finally {
      setTxProcessing(false)
    }
  }

  const cardBase = 'bg-white/90 border-[#d6e8dc] text-[#123126] shadow-[0_8px_22px_rgba(15,122,77,0.06)]'

  return (
    <AppShell>
      <div className={`${isRTL ? 'rtl' : 'ltr'}`}>
      <DsNavbar>
        <PageContainer className="h-20 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={() => setSidebarOpen((v) => !v)} className="lg:hidden p-2 rounded-xl border border-[#d7e7dd] bg-white/80">
              {sidebarOpen ? <AppIcon name="close" fallback="close menu" className="text-lg" /> : <AppIcon name="menu" fallback="open menu" className="text-lg" />}
            </button>
            <button onClick={() => navigate('/')} className="min-w-0">
              <BrandLogo size="md" />
            </button>
          </div>
          <nav className="hidden lg:flex items-center gap-6 min-w-0">
            {navLinks.map((link) => (
              <a key={link.href} href={link.href} className="font-semibold text-sm whitespace-nowrap text-[#28493b] hover:text-[#0f7a4d]">
                {t(link.labelKey)}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <LanguageSwitcher className="hidden md:flex" />
            <PrimaryButton className="hidden md:flex h-11 px-5 items-center gap-2">
              <AppIcon name="rocket_launch" fallback="buy now" className="text-sm" />
              {t('hero.join_presale')}
            </PrimaryButton>
            <GlassCard className="hidden sm:flex items-center px-4 h-11 max-w-[240px] py-0">
              <span className="font-black text-xs truncate">{formatAddress(address)}</span>
            </GlassCard>
            <SecondaryButton onClick={() => handleCopy(address, 'navbar')} className="h-11 px-3 text-xs flex items-center gap-2">
              <AppIcon name="content_copy" fallback="copy address" className={`text-sm ${copied === 'navbar' ? 'text-pepe-pink' : ''}`} />
              {copied === 'navbar' ? t('dashboard_pro.wallet.copied') : t('dashboard_pro.wallet.copy_nav')}
            </SecondaryButton>
          </div>
        </PageContainer>
      </DsNavbar>

      <div className="flex">
        <aside className={`${sidebarOpen ? 'translate-x-0' : (isRTL ? 'translate-x-full' : '-translate-x-full')} lg:translate-x-0 fixed lg:static inset-y-0 top-20 ${isRTL ? 'right-0' : 'left-0'} z-30 w-72 p-4 transition-transform duration-300`}>
          <DsSidebar>
            <div className="space-y-2">
              {sidebarItems.map((item) => {
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveSection(item.id)
                      setSidebarOpen(false)
                    }}
                    className="w-full"
                  >
                    <SidebarItem
                      active={activeSection === item.id}
                      disabled={!item.enabled}
                      right={item.id === 'tokens' ? <Badge>NEW</Badge> : (!item.enabled ? <span className="text-[10px] font-black">{t('dashboard_pro.soon')}</span> : null)}
                    >
                      <span className="flex items-center gap-3 min-w-0">
                        <AppIcon name={item.icon} fallback={t(item.labelKey)} className="text-lg" />
                        <span className="font-black text-sm truncate">{t(item.labelKey)}</span>
                      </span>
                    </SidebarItem>
                  </button>
                )
              })}
            </div>
            <button onClick={handleLogout} className="mt-4 w-full flex items-center justify-center gap-2 p-3 rounded-xl border font-black border-red-500/30 text-red-600 bg-white">
              <AppIcon name="logout" fallback="logout" className="text-base" />
              {t('dashboard_pro.logout')}
            </button>
          </DsSidebar>
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
                {notification.type === 'success' ? <AppIcon name="check_circle" fallback="success" className="text-lg" /> : <AppIcon name="warning" fallback="warning" className="text-lg" />}
                <span className="font-black text-sm">{notification.message}</span>
              </motion.div>
            )}
          </AnimatePresence>

          {activeSection === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <ContentSection className="p-6">
                  <p className="text-xs font-black opacity-60">{t('dashboard_pro.overview.total_supply')}</p>
                  <p className="text-3xl font-black mt-2">{stats.totalSupply.toLocaleString()} {PROJECT_CURRENCY_NAME}</p>
                </ContentSection>
                <ContentSection className="p-6">
                  <p className="text-xs font-black opacity-60">{t('dashboard_pro.overview.presale_available')}</p>
                  <p className="text-3xl font-black mt-2">{stats.presaleAvailable.toLocaleString()} {PROJECT_CURRENCY_NAME}</p>
                </ContentSection>
                <ContentSection className="p-6">
                  <p className="text-xs font-black opacity-60">{t('dashboard_pro.overview.token_price')}</p>
                  <p className="text-3xl font-black mt-2">${stats.tokenPriceUsd.toFixed(8)}</p>
                  <p className="text-xs font-black opacity-60 mt-2">{t('dashboard_pro.overview.phase_status', { current: stats.currentPhase || PRESALE_CONFIG.currentPhase.id, total: stats.totalPhases || PRESALE_CONFIG.totalPhases })}</p>
                </ContentSection>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                <ContentSection className="p-6">
                  <h3 className="text-xl font-black mb-4">{t('dashboard_pro.overview.roi_calculator')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-black">{t('dashboard_pro.overview.investment_label')}</label>
                      <Input value={roiInvestment} onChange={(e) => setRoiInvestment(e.target.value)} type="number" placeholder={t('dashboard_pro.overview.investment_placeholder')} className="h-12" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-black">{t('dashboard_pro.overview.target_label')}</label>
                      <Input value={roiTargetPrice} onChange={(e) => setRoiTargetPrice(e.target.value)} type="number" placeholder={t('dashboard_pro.overview.target_placeholder')} className="h-12" />
                    </div>
                  </div>
                  {'error' in roiResult ? (
                    <p className="text-sm font-black text-red-500 mt-4">{t('dashboard_pro.overview.invalid_roi')}</p>
                  ) : (
                    <div className="mt-4 grid grid-cols-2 gap-4">
                      <Card className="p-4">
                        <p className="text-xs font-black opacity-60">{t('dashboard_pro.overview.profit')}</p>
                        <p className="text-xl font-black mt-1">${Number(roiResult.profit).toLocaleString()}</p>
                      </Card>
                      <Card className="p-4">
                        <p className="text-xs font-black opacity-60">{t('dashboard_pro.overview.roi')}</p>
                        <p className="text-xl font-black mt-1">{roiResult.roi}%</p>
                      </Card>
                    </div>
                  )}
                </ContentSection>

                <ContentSection className="p-6">
                  <h3 className="text-xl font-black mb-4">{t('dashboard_pro.overview.stats_title')}</h3>
                  {statsLoading ? (
                    <div className="h-40 flex items-center justify-center">
                      <AppIcon name="progress_activity" fallback="loading" className="text-2xl animate-spin" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Card className="p-4">
                        <p className="text-xs font-black opacity-60">{t('dashboard_pro.overview.market_cap')}</p>
                        <p className="text-xl font-black mt-1">${Math.round(stats.marketCapUsd).toLocaleString()}</p>
                      </Card>
                      <Card className="p-4">
                        <p className="text-xs font-black opacity-60">{t('dashboard_pro.overview.total_liquidity')}</p>
                        <p className="text-xl font-black mt-1">${Math.round(stats.liquidityUsd).toLocaleString()}</p>
                      </Card>
                      <Card className="p-4">
                        <p className="text-xs font-black opacity-60">{t('dashboard_pro.overview.holders')}</p>
                        <p className="text-xl font-black mt-1">{stats.holders.toLocaleString()}</p>
                      </Card>
                      <Card className="p-4">
                        <p className="text-xs font-black opacity-60">{t('dashboard_pro.overview.pairs')}</p>
                        <p className="text-xl font-black mt-1">${stats.solUsd.toFixed(2)} / ${stats.usdtUsd.toFixed(2)}</p>
                      </Card>
                    </div>
                  )}
                </ContentSection>
              </div>

              <ContentSection className="p-6">
                <h3 className="text-xl font-black mb-4">{t('dashboard_pro.wallet_overview.title')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="p-4 min-w-0">
                    <p className="text-xs font-black opacity-60">{t('dashboard_pro.wallet_overview.total_value')}</p>
                    <p className="text-2xl font-black mt-1 truncate">${totalWalletUsd.toFixed(2)}</p>
                  </Card>
                  <Card className="p-4 min-w-0">
                    <p className="text-xs font-black opacity-60">{t('dashboard_pro.wallet.sol_balance')}</p>
                    <p className="text-2xl font-black mt-1 truncate">{walletBalancesLoading ? '...' : (walletBalances.sol === null ? '--' : walletBalances.sol.toFixed(4))}</p>
                  </Card>
                  <Card className="p-4 min-w-0">
                    <p className="text-xs font-black opacity-60">{t('dashboard_pro.wallet.usdt_balance')}</p>
                    <p className="text-2xl font-black mt-1 truncate">{walletBalancesLoading ? '...' : (walletBalances.usdt === null ? '--' : walletBalances.usdt.toFixed(2))}</p>
                  </Card>
                </div>
              </ContentSection>
            </div>
          )}

          {activeSection === 'buy' && (
            <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
              <div className={`xl:col-span-8 rounded-3xl border p-5 md:p-6 ${cardBase}`}>
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-xl">🔥</span>
                  <h3 className="text-3xl font-black tracking-tight">{t('dashboard_pro.buy.title')}</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                  <div className="rounded-2xl border border-[#d7e7dd] bg-white p-3">
                    <p className="text-xs font-semibold text-[#6c8177]">Wallet Balance</p>
                    <p className="text-3xl font-bold text-[#0f7a4d]">$1,240</p>
                  </div>
                  <div className="rounded-2xl border border-[#d7e7dd] bg-white p-3">
                    <p className="text-xs font-semibold text-[#6c8177]">Total Invested</p>
                    <p className="text-3xl font-bold">$800</p>
                  </div>
                  <div className="rounded-2xl border border-[#d7e7dd] bg-white p-3">
                    <p className="text-xs font-semibold text-[#6c8177]">PWIFE Owned</p>
                    <p className="text-3xl font-bold text-[#0f7a4d]">120,000,000</p>
                  </div>
                </div>

                <div className="rounded-3xl border border-[#d7e7dd] bg-white p-4 md:p-5 space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-[#6c8177]">Buy PWIFE</p>
                    <p className="text-4xl font-bold text-[#0f7a4d]">$0.00000005 <span className="text-xl text-[#4b6b5c]">PWIFE</span></p>
                    <p className="text-sm font-semibold text-[#6c8177]">Phase Balance: 1,900,000,000 PWIFE</p>
                  </div>

                  <div className="grid grid-cols-3 gap-3 rounded-2xl p-1 border border-[#d7e7dd] bg-[#f6fbf8]">
                    {['SOL', 'USDT'].map((currency) => (
                      <button
                        key={currency}
                        onClick={() => {
                          setBuyCurrency(currency)
                          if (buyPaymentAmount) {
                            const v = validatePaymentAmount(buyPaymentAmount, currency)
                            setBuyAmountError(v.valid ? '' : t('validation.amount_range', { min: v.min, max: v.max }))
                          }
                        }}
                        className={`h-12 rounded-xl font-black transition-all ${buyCurrency === currency ? 'bg-[#1f2d3a] text-white' : 'text-[#2e4a3c]'}`}
                      >
                        {currency}
                      </button>
                    ))}
                    <button className="h-12 rounded-xl font-semibold text-[#6c8177] bg-white border border-[#d7e7dd]">MAX</button>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-black">{t('dashboard_pro.buy.payment_amount', { currency: buyCurrency })}</label>
                    <input value={buyPaymentAmount} onChange={(e) => handleBuyAmountChange(e.target.value)} onBlur={handleBuyAmountBlur} min={buyRange.min} max={buyRange.max} type="number" placeholder={t('dashboard_pro.buy.payment_placeholder', { min: buyRange.min, max: buyRange.max })} className="w-full h-14 rounded-2xl border border-[#d7e7dd] bg-white px-4 text-2xl font-black text-[#123126]" />
                    <p className="text-[11px] font-bold opacity-70">{t('dashboard_pro.buy.range_hint', { min: buyRange.min, max: buyRange.max })}</p>
                    {buyAmountError && <p className="text-xs font-black text-red-500">{buyAmountError}</p>}
                    {buyCurrency === 'USDT' && <EthereumUsdtNotice />}
                  </div>

                  <div className="rounded-2xl border border-[#d7e7dd] bg-[#f6fbf8] p-3">
                    <p className="text-xs font-semibold text-[#6c8177]">You Receive</p>
                    <p className="text-4xl font-bold text-[#0f7a4d]">{(buyTokenAmount || 100000000).toLocaleString()} {PROJECT_CURRENCY_NAME}</p>
                    <p className="text-lg font-semibold text-[#4b6b5c]">~ $90 &nbsp;&nbsp;&nbsp;&nbsp; ≈ $190</p>
                  </div>

                  <button
                    onClick={handleBuy}
                    disabled={txProcessing || !buyPaymentAmount || Number(buyPaymentAmount) <= 0 || !!buyAmountError}
                    className="w-full h-14 rounded-2xl bg-gradient-to-r from-[#4ecb73] to-[#0f7a4d] text-white font-bold text-2xl disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {txProcessing && <AppIcon name="progress_activity" fallback="loading" className="text-lg animate-spin" />}
                    {txProcessing ? t('dashboard_pro.buy.processing') : '🚀 BUY PWIFE NOW'}
                  </button>
                  <p className="text-center text-lg font-semibold text-[#8f59d1]">Early buyers win the most. 💎</p>
                  <div className="rounded-2xl border border-[#d7e7dd] bg-white p-3 flex flex-col md:flex-row items-start md:items-center gap-3 md:justify-between">
                    <div className="w-full md:w-auto">
                      <p className="text-2xl font-bold text-[#123126]">Your Referral Link</p>
                      <CopyInput value="https://pepewife.../" onCopy={() => handleCopy('https://pepewife.../', 'referral-inline')} copyLabel="Copy" />
                    </div>
                    <div className="rounded-xl border border-[#d7e7dd] bg-[#f6fbf8] px-3 py-2 min-w-[140px]">
                      <p className="text-sm font-bold text-[#0f7a4d]">↗ 20% PWIFE</p>
                      <p className="text-xs font-semibold text-[#6c8177]">Free referral</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="xl:col-span-4 space-y-4">
                <div className={`rounded-3xl border p-5 ${cardBase}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">🔥</span>
                    <h4 className="text-3xl font-black tracking-tight">Phase Progress</h4>
                  </div>
                  <div className="h-6 rounded-full bg-[#e8f6ee] border border-[#cfe9db] overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#4ecb73] to-[#0f7a4d]" style={{ width: '72%' }} />
                  </div>
                  <div className="mt-2 flex items-center justify-between text-sm font-black text-[#1d5a3f]">
                    <span>72% SOLD</span>
                    <span>72%</span>
                  </div>
                  <div className="mt-3 border-t border-[#d7e7dd] pt-3 flex items-center justify-between">
                    <span className="text-sm font-semibold text-[#6c8177]">Ends in:</span>
                    <span className="text-3xl font-bold text-[#0f7a4d]">01:01:45</span>
                  </div>
                </div>

                <div className={`rounded-3xl border p-5 ${cardBase}`}>
                  <ul className="space-y-3 text-base font-semibold">
                    <li className="flex items-center gap-2"><AppIcon name="verified" fallback="ok" className="text-[#0f7a4d]" /> Liquidity Locked</li>
                    <li className="flex items-center gap-2"><AppIcon name="verified" fallback="ok" className="text-[#0f7a4d]" /> Mint Revoked</li>
                    <li className="flex items-center gap-2"><AppIcon name="verified" fallback="ok" className="text-[#0f7a4d]" /> Contract Verified</li>
                  </ul>
                  <div className="mt-4 border-t border-[#d7e7dd] pt-3">
                    <p className="text-xs font-black opacity-60">Presale Contract Address</p>
                    <div className="mt-1 flex items-center justify-between gap-2">
                      <p className="font-black truncate">{formatAddress(address)}</p>
                      <button onClick={() => handleCopy(address, 'sidebar')} className="text-[#0f7a4d] font-semibold text-xs">Copy</button>
                    </div>
                  </div>
                </div>

                <div className={`rounded-3xl border p-5 relative overflow-hidden ${cardBase}`}>
                  <h4 className="text-2xl font-black mb-3">Recent Transactions</h4>
                  <div className="grid grid-cols-3 gap-2 text-sm font-semibold text-[#6c8177] border-b border-[#e3efe8] pb-2 mb-2">
                    <span>Date</span>
                    <span>Type</span>
                    <span className="text-right">Amount</span>
                  </div>
                  <div className="space-y-2">
                    {[
                      { time: '11 min', type: 'Buy', amount: '200,000,000' },
                      { time: '11 min', type: 'Buy', amount: '200,000,000' },
                      { time: '9 min', type: 'Airdrop', amount: '750,000' }
                    ].map((tx, index) => (
                      <div key={`${tx.time}-${index}`} className="grid grid-cols-3 gap-2 text-sm font-semibold border-b border-[#e3efe8] pb-2">
                        <span className="opacity-70">{tx.time}</span>
                        <span>{tx.type}</span>
                        <span className="text-right truncate">{tx.amount}</span>
                      </div>
                    ))}
                  </div>
                  <img src="/assets/hero-character.png" alt="PepeWife" className="absolute -bottom-4 -right-3 w-28 h-28 object-contain opacity-95 pointer-events-none" />
                </div>
              </div>
            </div>
          )}

          {activeSection === 'transactions' && (
            <ContentSection className="space-y-5">
              <div className="flex flex-wrap gap-3 items-end">
                <div>
                  <p className="text-xs font-black opacity-60 mb-1">{t('dashboard_pro.transactions.filter_type')}</p>
                  <select value={txTypeFilter} onChange={(e) => setTxTypeFilter(e.target.value)} className="p-2 rounded-xl border border-[#d7e7dd] bg-white font-semibold">
                    <option value="all">{t('dashboard_pro.transactions.types.all')}</option>
                    <option value="buy">{t('dashboard_pro.transactions.types.buy')}</option>
                    <option value="referral">{t('dashboard_pro.transactions.types.referral')}</option>
                    <option value="claim">{t('dashboard_pro.transactions.types.claim')}</option>
                  </select>
                </div>
                <div>
                  <p className="text-xs font-black opacity-60 mb-1">{t('dashboard_pro.transactions.filter_range')}</p>
                  <select value={txRangeFilter} onChange={(e) => setTxRangeFilter(e.target.value)} className="p-2 rounded-xl border border-[#d7e7dd] bg-white font-semibold">
                    <option value="7d">{t('dashboard_pro.transactions.range_7d')}</option>
                    <option value="30d">{t('dashboard_pro.transactions.range_30d')}</option>
                    <option value="90d">{t('dashboard_pro.transactions.range_90d')}</option>
                    <option value="all">{t('dashboard_pro.transactions.range_all')}</option>
                  </select>
                </div>
              </div>
              <div className="rounded-2xl border border-[#d7e7dd] overflow-hidden bg-white/85">
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px]">
                    <thead className="bg-[#f5fbf7]">
                      <tr>
                        <th className="text-start p-3 text-xs font-black uppercase">{t('dashboard_pro.transactions.table.date')}</th>
                        <th className="text-start p-3 text-xs font-black uppercase">{t('dashboard_pro.transactions.table.type')}</th>
                        <th className="text-start p-3 text-xs font-black uppercase">{t('dashboard_pro.transactions.table.tokens')}</th>
                        <th className="text-start p-3 text-xs font-black uppercase">{t('dashboard_pro.transactions.table.amount')}</th>
                        <th className="text-start p-3 text-xs font-black uppercase">{t('dashboard_pro.transactions.table.status')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTransactions.map((tx) => (
                        <tr key={tx.id} className="border-t border-[#e3efe8]">
                          <td className="p-3 text-sm font-bold whitespace-nowrap">{new Date(tx.date).toLocaleDateString()}</td>
                          <td className="p-3 text-sm font-bold">{t(`dashboard_pro.transactions.types.${tx.type}`)}</td>
                          <td className="p-3 text-sm font-bold">{Number(tx.tokenAmount).toLocaleString()} {PROJECT_CURRENCY_NAME}</td>
                          <td className="p-3 text-sm font-bold">{tx.usdAmount.toFixed(2)} {tx.currency}</td>
                          <td className="p-3 text-sm font-bold">{t(`dashboard_pro.transactions.status.${tx.status}`)}</td>
                        </tr>
                      ))}
                      {!filteredTransactions.length && (
                        <tr>
                          <td className="p-4 text-sm font-black opacity-70" colSpan={5}>{t('dashboard_pro.transactions.empty')}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </ContentSection>
          )}

          {activeSection === 'performance' && (
            <ContentSection className="space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-2xl font-black">{t('dashboard_pro.performance.title')}</h3>
                <div className="grid grid-cols-3 gap-2">
                  {['7d', '30d', '90d'].map((range) => (
                    <button key={range} onClick={() => setPerformanceRange(range)} className={`px-3 py-2 rounded-xl border text-xs font-semibold ${performanceRange === range ? 'bg-[#0f7a4d] text-white border-transparent' : 'border-[#d7e7dd] bg-white text-[#2d4a3b]'}`}>
                      {t(`dashboard_pro.transactions.range_${range}`)}
                    </button>
                  ))}
                </div>
              </div>
              <div className="rounded-2xl border border-[#d7e7dd] p-4 bg-white/75">
                <svg viewBox="0 0 100 100" className="w-full h-56">
                  <path d={chartPath} fill="none" stroke="#ec4899" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
                </svg>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-4 rounded-xl border border-[#d7e7dd] bg-white">
                  <p className="text-xs font-black opacity-60">{t('dashboard_pro.performance.current')}</p>
                  <p className="text-xl font-black mt-1">${stats.tokenPriceUsd.toFixed(8)}</p>
                </div>
                <div className="p-4 rounded-xl border border-[#d7e7dd] bg-white">
                  <p className="text-xs font-black opacity-60">{t('dashboard_pro.performance.high')}</p>
                  <p className="text-xl font-black mt-1">${Math.max(...performanceSeries.map((d) => d.value)).toFixed(8)}</p>
                </div>
                <div className="p-4 rounded-xl border border-[#d7e7dd] bg-white">
                  <p className="text-xs font-black opacity-60">{t('dashboard_pro.performance.low')}</p>
                  <p className="text-xl font-black mt-1">${Math.min(...performanceSeries.map((d) => d.value)).toFixed(8)}</p>
                </div>
              </div>
            </ContentSection>
          )}

          {activeSection === 'tokens' && (
            <ContentSection className="space-y-5">
              <h3 className="text-2xl font-black">{t('dashboard_pro.tokens.title')}</h3>
              <Card>
                <p className="text-xs font-black opacity-60">{t('dashboard_pro.tokens.total_bought')}</p>
                <p className="text-3xl font-black mt-1 break-words">{totalBoughtTokens.toLocaleString()} {PROJECT_CURRENCY_NAME}</p>
              </Card>
              <div className="space-y-3">
                {buyTransactions.map((tx) => (
                  <div key={tx.id} className="p-4 rounded-xl border border-[#d7e7dd] bg-white grid grid-cols-1 md:grid-cols-4 gap-3">
                    <p className="text-sm font-black">{new Date(tx.date).toLocaleDateString()}</p>
                    <p className="text-sm font-black break-words">{tx.tokenAmount.toLocaleString()} {PROJECT_CURRENCY_NAME}</p>
                    <p className="text-sm font-black">{tx.usdAmount.toFixed(2)} {tx.currency}</p>
                    <p className="text-sm font-black">{t(`dashboard_pro.transactions.status.${tx.status}`)}</p>
                  </div>
                ))}
                {!buyTransactions.length && <p className="text-sm font-black opacity-70">{t('dashboard_pro.tokens.empty')}</p>}
              </div>
            </ContentSection>
          )}

          {activeSection === 'referral' && (
            <ContentSection className="space-y-5">
              <h3 className="text-2xl font-black">{t('dashboard_pro.referral.title')}</h3>
              <GlassCard>
                <p className="text-xs font-black opacity-60">{t('dashboard_pro.referral.unique_link')}</p>
                <div className="mt-2 flex flex-col sm:flex-row gap-3">
                  <p className="font-black text-sm break-all flex-1">{referralLink}</p>
                  <SecondaryButton onClick={() => handleCopy(referralLink, 'referral')} className="px-4 py-2 font-semibold flex items-center gap-2">
                    <AppIcon name="content_copy" fallback="copy link" className={`text-sm ${copied === 'referral' ? 'text-pepe-pink' : ''}`} />
                    {copied === 'referral' ? t('dashboard_pro.wallet.copied') : t('dashboard_pro.referral.copy_link')}
                  </SecondaryButton>
                </div>
              </GlassCard>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <Card>
                  <p className="text-xs font-black opacity-60">{t('dashboard_pro.referral.invited')}</p>
                  <p className="text-2xl font-black mt-1">{referralStats.invitedFriends}</p>
                </Card>
                <Card>
                  <p className="text-xs font-black opacity-60">{t('dashboard_pro.referral.active')}</p>
                  <p className="text-2xl font-black mt-1">{referralStats.activeReferrals}</p>
                </Card>
                <Card>
                  <p className="text-xs font-black opacity-60">{t('dashboard_pro.referral.earned')}</p>
                  <p className="text-2xl font-black mt-1">${referralStats.earnedUsd.toFixed(2)}</p>
                </Card>
              </div>
              <Card>
                <div className="flex items-center justify-between gap-3 mb-2">
                  <p className="text-xs font-black opacity-60">{t('dashboard_pro.referral.reward_progress')}</p>
                  <p className="text-xs font-black">{referralProgress}%</p>
                </div>
                <div className="h-3 rounded-full overflow-hidden bg-[#e3efe8]">
                  <div className="h-full bg-pepe-pink transition-all" style={{ width: `${referralProgress}%` }} />
                </div>
                <p className="text-xs font-black opacity-70 mt-2">{t('dashboard_pro.referral.next_reward', { amount: referralStats.nextRewardUsd.toFixed(2) })}</p>
              </Card>
            </ContentSection>
          )}

          {['claim', 'staking'].includes(activeSection) && (
            <EmptyState
              title={t('dashboard_pro.soon')}
              subtitle={t('dashboard_pro.soon_desc')}
            />
          )}

          {activeSection === 'support' && (
            <ContentSection className="p-8">
              <SectionHeader title={t('dashboard_pro.support.title')} />
              <p className="text-sm font-bold opacity-80 mb-6">{t('dashboard_pro.support.desc')}</p>
              <a href={supportUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-[#d7e7dd] bg-white font-black">
                {t('dashboard_pro.support.open')}
                <AppIcon name="open_in_new" fallback="open link" className="text-base" />
              </a>
            </ContentSection>
          )}

          {activeSection === 'wallet' && (
            <ContentSection className="space-y-6">
              <SectionHeader title={t('dashboard_pro.wallet.title')} />
              <GlassCard>
                <p className="text-xs font-black opacity-60">{t('dashboard_pro.wallet.connected_address')}</p>
                <p className="font-black break-all mt-1">{address || '---'}</p>
                <div className="flex flex-wrap gap-3 mt-4">
                  <SecondaryButton onClick={() => handleCopy(address, 'wallet')} className="px-4 py-2 flex items-center gap-2">
                    <AppIcon name="content_copy" fallback="copy address" className="text-sm" />
                    {copied === 'wallet' ? t('dashboard_pro.wallet.copied') : t('dashboard_pro.wallet.copy')}
                  </SecondaryButton>
                  <a href={explorerUrl} target="_blank" rel="noreferrer" className="px-4 py-2 rounded-xl border border-[#d7e7dd] bg-white font-black flex items-center gap-2">
                    {t('dashboard_pro.wallet.explorer')}
                    <AppIcon name="open_in_new" fallback="open explorer" className="text-sm" />
                  </a>
                </div>
              </GlassCard>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <p className="text-xs font-black opacity-60">{t('dashboard_pro.wallet.sol_balance')}</p>
                  <p className="text-2xl font-black mt-1">{walletBalancesLoading ? '...' : (walletBalances.sol === null ? '--' : walletBalances.sol.toFixed(4))}</p>
                </Card>
                <Card>
                  <p className="text-xs font-black opacity-60">{t('dashboard_pro.wallet.usdt_balance')}</p>
                  <p className="text-2xl font-black mt-1">{walletBalancesLoading ? '...' : (walletBalances.usdt === null ? '--' : walletBalances.usdt.toFixed(2))}</p>
                </Card>
              </div>
            </ContentSection>
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
    </AppShell>
  )
}

export default DashboardPage
