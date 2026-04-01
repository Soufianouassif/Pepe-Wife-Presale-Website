import React, { useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useTranslation } from 'react-i18next'
import { ethers } from 'ethers'
import { Connection, PublicKey } from '@solana/web3.js'
import {
  LayoutGrid,
  ShoppingCart,
  History,
  BarChart3,
  Coins,
  Users,
  Gift,
  Lock,
  LifeBuoy,
  Menu,
  X,
  Rocket,
  Copy,
  LogOut,
  Wallet,
  CircleCheck,
  ArrowUpRight,
  Activity,
  CircleDollarSign,
  TrendingDown,
  TrendingUp,
  BadgeCheck,
  Mail,
  HelpCircle
} from 'lucide-react'
import { useWallet } from '../context/WalletContext'
import { formatAddress } from '../utils/format'
import { calculateProfit } from '../utils/calculator'
import { getDashboardStats, submitPresaleIntent } from '../services/dashboardApi'
import { isValidEvmAddress, isValidSolAddress } from '../wallet/adapters'
import LanguageSwitcher from '../components/LanguageSwitcher'
import BrandLogo from '../components/BrandLogo'
import { PRESALE_CONFIG, CURRENT_TOKEN_PRICE_USD, TOTAL_PRESALE_SUPPLY, CURRENT_PHASE_SUPPLY } from '../presaleConfig'
import EthereumUsdtNotice from '../components/EthereumUsdtNotice'
import { PROJECT_CURRENCY_NAME } from '../constants/projectConstants'
import { getPaymentRange, validatePaymentAmount, clampPaymentAmount } from '../utils/amountValidation'
import { formatCompactNumber, formatFullNumber, formatAutoNumber, formatCryptoDisplayPrice } from '../utils/numberFormat'
import {
  AppShell,
  PageContainer,
  Navbar,
  Sidebar,
  SidebarItem,
  ContentSection,
  PageHeader,
  DashboardCard,
  GlassPanel,
  StatsCard,
  PrimaryButton,
  SecondaryButton,
  Input,
  CopyField,
  TableCard,
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

const dashboardTickerItems = [
  'Presale Live Now',
  'Secure Multi-Wallet Access',
  'Real-Time Analytics Dashboard',
  'Roadmap Execution In Progress',
  'Community Rewards & Referral',
  'Token Utility Expansion'
]

const roadmapPhases = [
  { id: '01', title: 'Phase 1 · Foundation', desc: 'Brand launch, core website, and initial community onboarding.' },
  { id: '02', title: 'Phase 2 · Presale', desc: 'Presale rollout, wallet integrations, and on-chain payment flows.' },
  { id: '03', title: 'Phase 3 · Growth', desc: 'CEX/DEX expansion, partnerships, and referral acceleration.' },
  { id: '04', title: 'Phase 4 · Utility', desc: 'Staking, ecosystem features, and long-term product scaling.' }
]

const faqItems = [
  { q: 'How do I buy PWIFE tokens?', a: 'Go to Buy section, choose SOL or USDT, enter amount, then confirm transaction.' },
  { q: 'When can I claim purchased tokens?', a: 'Claim availability follows the official release schedule and vesting plan.' },
  { q: 'Is the dashboard connected to my wallet?', a: 'Yes, balances and activity are shown based on your currently connected wallet.' },
  { q: 'Where can I get official support?', a: 'Use the support section or the official email for verified assistance only.' }
]

const sidebarIcons = {
  overview: LayoutGrid,
  buy: ShoppingCart,
  transactions: History,
  performance: BarChart3,
  tokens: Coins,
  referral: Users,
  claim: Gift,
  staking: Lock,
  support: LifeBuoy
}

const sidebarItems = [
  { id: 'overview', labelKey: 'dashboard_pro.sidebar.overview' },
  { id: 'buy', labelKey: 'dashboard_pro.sidebar.buy' },
  { id: 'transactions', labelKey: 'dashboard_pro.sidebar.transactions' },
  { id: 'performance', labelKey: 'dashboard_pro.sidebar.performance' },
  { id: 'tokens', labelKey: 'dashboard_pro.sidebar.tokens' },
  { id: 'referral', labelKey: 'dashboard_pro.sidebar.referral' },
  { id: 'claim', labelKey: 'dashboard_pro.sidebar.claim' },
  { id: 'staking', labelKey: 'dashboard_pro.sidebar.staking' },
  { id: 'support', labelKey: 'dashboard_pro.sidebar.support' }
]

const cn = (...classes) => classes.filter(Boolean).join(' ')

const DashboardPage = () => {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const { isConnected, address, walletType, disconnect, signMessage } = useWallet()
  const isRTL = i18n.language === 'ar'

  const [activeSection, setActiveSection] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(false)
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
  const [notification, setNotification] = useState(null)
  const [copied, setCopied] = useState('')
  const [walletBalances, setWalletBalances] = useState({ sol: null, usdt: null })
  const [walletBalancesLoading, setWalletBalancesLoading] = useState(false)
  const [txTypeFilter, setTxTypeFilter] = useState('all')
  const [txRangeFilter, setTxRangeFilter] = useState('30d')
  const [performanceRange, setPerformanceRange] = useState('30d')
  const [hoveredPointIndex, setHoveredPointIndex] = useState(null)
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
  const tokenContractAddress = import.meta?.env?.VITE_PWIFE_TOKEN_CONTRACT || 'YOUR_TOKEN_MINT_ADDRESS_HERE'
  const siteOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://pepewife.io'
  const faqUrl = `${siteOrigin}/#faq`
  const referralStats = { invitedFriends: 18, activeReferrals: 9, earnedUsd: 386.4, nextRewardUsd: 500 }
  const referralProgress = Math.min(100, Math.round((referralStats.earnedUsd / referralStats.nextRewardUsd) * 100))

  useEffect(() => {
    if (!isConnected) navigate('/connect')
  }, [isConnected, navigate])

  useEffect(() => {
    document.documentElement.classList.remove('dark')
  }, [])

  useEffect(() => {
    let mounted = true
    const loadStats = async () => {
      const data = await getDashboardStats()
      if (mounted) setStats(data)
    }
    loadStats().catch(() => null)
    return () => { mounted = false }
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
    return () => { mounted = false }
  }, [address, walletType, isConnected])

  const notify = (type, message) => {
    setNotification({ type, message, id: Date.now() })
    setTimeout(() => setNotification(null), 3000)
  }

  const handleCopy = async (text, key) => {
    if (!text) return
    await navigator.clipboard.writeText(text)
    setCopied(key)
    setTimeout(() => setCopied(''), 1500)
  }

  const handleLogout = async () => {
    await disconnect()
    navigate('/')
  }

  const buyRange = useMemo(() => getPaymentRange(buyCurrency), [buyCurrency])
  const buyCostInSelectedCurrency = Number(buyPaymentAmount || 0)
  const buyTotalCost = buyCurrency === 'SOL' ? buyCostInSelectedCurrency * Math.max(stats.solUsd, 1) : buyCostInSelectedCurrency * Math.max(stats.usdtUsd, 1)
  const buyTokenAmount = buyTotalCost && stats.tokenPriceUsd ? Math.floor(buyTotalCost / stats.tokenPriceUsd) : 0
  const totalWalletUsd = (walletBalances.sol || 0) * stats.solUsd + (walletBalances.usdt || 0)
  const buyTransactions = useMemo(() => transactions.filter((tx) => tx.type === 'buy'), [transactions])
  const totalBoughtTokens = useMemo(() => buyTransactions.reduce((sum, tx) => sum + tx.tokenAmount, 0), [buyTransactions])
  const roiResult = useMemo(() => calculateProfit(roiInvestment, stats.tokenPriceUsd, roiTargetPrice, 0), [roiInvestment, roiTargetPrice, stats.tokenPriceUsd])
  const totalVolumeUsd = useMemo(() => transactions.reduce((sum, tx) => sum + tx.usdAmount, 0), [transactions])

  const performanceSeries = useMemo(() => {
    const pointsMap = { '7d': 7, '30d': 12, '90d': 20 }
    const points = pointsMap[performanceRange] || 12
    return Array.from({ length: points }).map((_, i) => {
      const base = stats.tokenPriceUsd
      const wave = Math.sin(i / 2.4) * (base * 0.16)
      const trend = i * (base * 0.02)
      return Number((base + wave + trend).toFixed(10))
    })
  }, [performanceRange, stats.tokenPriceUsd])

  const performanceChart = useMemo(() => {
    const width = 900
    const height = 340
    const padding = { top: 24, right: 20, bottom: 28, left: 20 }
    if (!performanceSeries.length) {
      return { width, height, padding, points: [], linePath: '', areaPath: '' }
    }
    const min = Math.min(...performanceSeries)
    const max = Math.max(...performanceSeries)
    const spread = Math.max(max - min, 0.000000001)
    const innerWidth = width - padding.left - padding.right
    const innerHeight = height - padding.top - padding.bottom
    const points = performanceSeries.map((value, index) => {
      const x = padding.left + (index / Math.max(performanceSeries.length - 1, 1)) * innerWidth
      const y = padding.top + (1 - ((value - min) / spread)) * innerHeight
      return { x, y, value, index }
    })
    const linePath = points.reduce((path, point, index) => {
      if (index === 0) return `M ${point.x} ${point.y}`
      const prev = points[index - 1]
      const cpX = (prev.x + point.x) / 2
      return `${path} C ${cpX} ${prev.y}, ${cpX} ${point.y}, ${point.x} ${point.y}`
    }, '')
    const areaPath = points.length
      ? `${linePath} L ${points[points.length - 1].x} ${height - padding.bottom} L ${points[0].x} ${height - padding.bottom} Z`
      : ''
    return { width, height, padding, points, linePath, areaPath }
  }, [performanceSeries])

  const hoveredPoint = hoveredPointIndex === null ? null : performanceChart.points[hoveredPointIndex]

  const filteredTransactions = useMemo(() => {
    const now = Date.now()
    const daysMap = { '7d': 7, '30d': 30, '90d': 90, all: 9999 }
    const maxDays = daysMap[txRangeFilter] || 30
    return transactions.filter((tx) => {
      const byType = txTypeFilter === 'all' || tx.type === txTypeFilter
      const diffDays = (now - new Date(tx.date).getTime()) / 86_400_000
      const byRange = txRangeFilter === 'all' || diffDays <= maxDays
      return byType && byRange
    })
  }, [transactions, txTypeFilter, txRangeFilter])

  const referralCode = address ? `${address.slice(0, 6)}${address.slice(-4)}` : 'guest0000'
  const referralLink = `${siteOrigin}/?ref=${referralCode}`
  const roiProfit = Number(roiResult?.profit || 0)
  const roiPercent = Number(roiResult?.roi || 0)

  const toneClass = (value) => {
    if (value > 0) return 'number-positive'
    if (value < 0) return 'number-negative'
    return 'number-neutral'
  }

  const renderPriceText = (price, { className = '', minimumFractionDigits = 0, maximumFractionDigits } = {}) => {
    const display = formatCryptoDisplayPrice(price, { minimumFractionDigits, maximumFractionDigits })
    if (display.type === 'small') {
      return (
        <span className={cn('price', className)}>
          {display.sign}
          {display.base}
          <span className="zeros-count">{display.zeroCount}</span>
          {display.significantDigits}
        </span>
      )
    }
    return <span className={cn('dashboard-number', className)}>{display.text}</span>
  }

  const formatMetricValue = (value, options = {}) => formatAutoNumber(value, options)

  const handleBuyAmountChange = (raw) => {
    setBuyPaymentAmount(raw)
    if (!raw) {
      setBuyAmountError('')
      return
    }
    const validation = validatePaymentAmount(raw, buyCurrency)
    setBuyAmountError(validation.valid ? '' : t('validation.amount_range', { min: validation.min, max: validation.max }))
  }

  const handleBuyAmountBlur = () => {
    if (!buyPaymentAmount) return
    const validation = validatePaymentAmount(buyPaymentAmount, buyCurrency)
    if (!validation.valid) setBuyPaymentAmount(clampPaymentAmount(buyPaymentAmount, buyCurrency))
  }

  const handleBuy = async () => {
    const qty = Number(buyTokenAmount || 0)
    const validation = validatePaymentAmount(buyPaymentAmount, buyCurrency)
    if (!validation.valid) return notify('error', t('validation.amount_range', { min: validation.min, max: validation.max }))
    if (!address || qty <= 0) return notify('error', t('dashboard_pro.notifications.invalid_amount'))
    if (buyCurrency === 'SOL' && !isValidSolAddress(address)) return notify('error', t('dashboard_pro.notifications.require_solana'))
    if (buyCurrency === 'USDT' && !isValidEvmAddress(address)) return notify('error', t('dashboard_pro.notifications.require_evm'))
    try {
      setTxProcessing(true)
      const nonce = Date.now()
      const payload = `PWIFE_PRESALE_BUY|address=${address}|token=${qty}|currency=${buyCurrency}|nonce=${nonce}`
      const signature = await signMessage(payload)
      if (!signature) return notify('error', t('dashboard_pro.notifications.signature_failed'))
      await submitPresaleIntent({
        address,
        tokenAmount: qty,
        paymentCurrency: buyCurrency,
        quoteUsd: buyTotalCost,
        signature
      })
      setTransactions((prev) => [{ id: `tx-${Date.now()}`, date: new Date().toISOString(), type: 'buy', currency: buyCurrency, tokenAmount: qty, usdAmount: buyTotalCost, status: 'confirmed' }, ...prev])
      notify('success', t('dashboard_pro.notifications.buy_success'))
      setBuyPaymentAmount('')
      setBuyAmountError('')
    } catch (error) {
      notify('error', error?.userMessage || error?.message || t('dashboard_pro.notifications.buy_failed'))
    } finally {
      setTxProcessing(false)
    }
  }

  const renderOverview = (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard icon={<Coins size={18} />} label={t('dashboard_pro.overview.total_supply')} value={<span>{formatCompactNumber(stats.totalSupply)}</span>} hint={`${formatFullNumber(stats.totalSupply)} ${PROJECT_CURRENCY_NAME}`} />
        <StatsCard icon={<Wallet size={18} />} label={t('dashboard_pro.overview.presale_available')} value={<span>{formatCompactNumber(stats.presaleAvailable)}</span>} hint={`${formatFullNumber(stats.presaleAvailable)} ${PROJECT_CURRENCY_NAME}`} />
        <StatsCard icon={<Rocket size={18} />} label={t('dashboard_pro.overview.token_price')} value={<span>$ {renderPriceText(stats.tokenPriceUsd)}</span>} hint={t('dashboard_pro.overview.phase_status', { current: stats.currentPhase, total: stats.totalPhases })} />
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <ContentSection>
          <PageHeader title={t('dashboard_pro.wallet_overview.title')} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <DashboardCard className="p-4">
              <p className="dashboard-label">{t('dashboard_pro.wallet_overview.total_value')}</p>
              <p className="dashboard-main-value mt-2">$ {formatFullNumber(totalWalletUsd, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </DashboardCard>
            <DashboardCard className="p-4">
              <p className="dashboard-label">{t('dashboard_pro.wallet.sol_balance')}</p>
              <p className="dashboard-main-value mt-2">{walletBalancesLoading ? '...' : (walletBalances.sol === null ? '--' : formatFullNumber(walletBalances.sol, { minimumFractionDigits: 4, maximumFractionDigits: 4 }))}</p>
            </DashboardCard>
            <DashboardCard className="p-4">
              <p className="dashboard-label">{t('dashboard_pro.wallet.usdt_balance')}</p>
              <p className="dashboard-main-value mt-2">{walletBalancesLoading ? '...' : (walletBalances.usdt === null ? '--' : formatFullNumber(walletBalances.usdt, { minimumFractionDigits: 2, maximumFractionDigits: 2 }))}</p>
            </DashboardCard>
          </div>
        </ContentSection>
        <ContentSection>
          <PageHeader title={t('dashboard_pro.overview.roi_calculator')} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium mb-2">{t('dashboard_pro.overview.investment_label')}</p>
              <Input type="number" value={roiInvestment} onChange={(e) => setRoiInvestment(e.target.value)} placeholder={t('dashboard_pro.overview.investment_placeholder')} className="font-mono" />
            </div>
            <div>
              <p className="text-sm font-medium mb-2">{t('dashboard_pro.overview.target_label')}</p>
              <Input type="number" value={roiTargetPrice} onChange={(e) => setRoiTargetPrice(e.target.value)} placeholder={t('dashboard_pro.overview.target_placeholder')} className="font-mono" />
            </div>
          </div>
          {'error' in roiResult ? (
            <p className="text-sm text-dashboard-danger mt-3">{t('dashboard_pro.overview.invalid_roi')}</p>
          ) : (
            <div className="grid grid-cols-2 gap-4 mt-4">
              <DashboardCard className="p-4"><p className="dashboard-label">{t('dashboard_pro.overview.profit')}</p><p className={cn('text-xl mt-1 dashboard-number', toneClass(roiProfit))} style={{ fontWeight: 700 }}>$ {formatFullNumber(roiProfit, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p></DashboardCard>
              <DashboardCard className="p-4"><p className="dashboard-label">{t('dashboard_pro.overview.roi')}</p><p className={cn('text-xl mt-1 dashboard-number', toneClass(roiPercent))} style={{ fontWeight: 700 }}>{formatFullNumber(roiPercent, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%</p></DashboardCard>
            </div>
          )}
        </ContentSection>
      </div>
    </div>
  )

  const dashboardExtraContent = (
    <>
      <ContentSection className="p-0 overflow-hidden">
        <div className="h-[72px] w-full px-5 py-4 border border-[#E2EFE2] rounded-[22px] bg-white backdrop-blur-[10px] shadow-dashboard-soft flex items-center overflow-hidden">
          <div className="dashboard-marquee-track text-sm md:text-[15px] font-medium text-dashboard-text-primary">
            {[...dashboardTickerItems, ...dashboardTickerItems].map((item, index) => (
              <span key={`${item}-${index}`} className="inline-flex items-center gap-3 mr-8 whitespace-nowrap">
                <Rocket size={15} className="text-dashboard-primary" />
                <span>{item}</span>
              </span>
            ))}
          </div>
        </div>
      </ContentSection>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 xl:[direction:rtl]">
        <ContentSection className="space-y-3">
          <PageHeader title="Roadmap" />
          {roadmapPhases.map((phase) => (
            <DashboardCard key={phase.id} className="p-4">
              <div className="flex items-start gap-3">
                <span className="w-9 h-9 rounded-[12px] bg-dashboard-icon-soft text-dashboard-primary flex items-center justify-center shrink-0 dashboard-number" style={{ fontWeight: 700 }}>
                  {phase.id}
                </span>
                <div className="min-w-0">
                  <p className="text-sm text-dashboard-text-primary" style={{ fontWeight: 700 }}>{phase.title}</p>
                  <p className="text-sm text-dashboard-text-secondary mt-1">{phase.desc}</p>
                </div>
              </div>
            </DashboardCard>
          ))}
        </ContentSection>
        <ContentSection>
          <PageHeader title="Token Contract" />
          <div className="space-y-3">
            <DashboardCard className="p-4">
              <p className="dashboard-label">Token</p>
              <p className="dashboard-main-value mt-1">PWIFE</p>
            </DashboardCard>
            <DashboardCard className="p-4">
              <p className="dashboard-label">Network</p>
              <p className="text-base text-dashboard-text-primary mt-1" style={{ fontWeight: 700 }}>Solana · Mainnet</p>
            </DashboardCard>
            <DashboardCard className="p-4">
              <p className="dashboard-label">Contract Address</p>
              <p className="text-sm text-dashboard-text-primary mt-1 break-all dashboard-number">{tokenContractAddress}</p>
              <div className="mt-3">
                <SecondaryButton onClick={() => handleCopy(tokenContractAddress, 'token-contract')} className="h-10 px-3.5 rounded-dashboard-pill flex items-center gap-2 border-[#CFE5CF] bg-white/95 hover:bg-[#F4FBF4] text-dashboard-primary-dark shadow-[0_8px_20px_rgba(31,42,31,0.06)]">
                  {copied === 'token-contract' ? <CircleCheck size={16} className="text-dashboard-success" /> : <Copy size={16} />}
                  <span className="text-[13px] font-semibold tracking-tight">{copied === 'token-contract' ? t('dashboard_pro.wallet.copied') : t('dashboard_pro.wallet.copy_nav')}</span>
                </SecondaryButton>
              </div>
            </DashboardCard>
          </div>
        </ContentSection>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 xl:[direction:rtl]">
        <ContentSection className="space-y-3">
          <PageHeader title="FAQ" />
          {faqItems.map((item, index) => (
            <DashboardCard key={`${item.q}-${index}`} className="p-4">
              <p className="text-sm text-dashboard-text-primary" style={{ fontWeight: 700 }}>{item.q}</p>
              <p className="text-sm text-dashboard-text-secondary mt-1">{item.a}</p>
            </DashboardCard>
          ))}
        </ContentSection>
        <ContentSection>
          <PageHeader title="Risk Warning" />
          <DashboardCard className="p-4 bg-[rgba(255,255,255,0.92)]">
            <ul className="space-y-3 text-sm text-dashboard-text-secondary">
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-dashboard-danger"><X size={16} /></span>
                <span>Crypto markets are volatile; token prices can move sharply in short periods.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-dashboard-danger"><X size={16} /></span>
                <span>Only invest funds you can afford to lose and always use your own research.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-0.5 text-dashboard-danger"><X size={16} /></span>
                <span>Never share seed phrases or private keys with anyone claiming support access.</span>
              </li>
            </ul>
          </DashboardCard>
        </ContentSection>
      </div>
    </>
  )

  const renderBuy = (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
      <ContentSection className="xl:col-span-8">
        <PageHeader title={t('dashboard_pro.buy.title')} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <StatsCard label="Wallet Balance" value={`$${formatCompactNumber(totalWalletUsd)}`} hint={`$${formatFullNumber(totalWalletUsd, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
          <StatsCard label="Total Invested" value={`$${formatCompactNumber(totalVolumeUsd)}`} hint={`$${formatFullNumber(totalVolumeUsd, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
          <StatsCard label="PWIFE Owned" value={formatCompactNumber(totalBoughtTokens)} hint={`${formatFullNumber(totalBoughtTokens)} ${PROJECT_CURRENCY_NAME}`} />
        </div>
        <DashboardCard className="space-y-4">
          <div>
            <p className="dashboard-label">{t('dashboard_pro.buy.current_price')}</p>
            <p className="dashboard-main-value mt-1 text-dashboard-primary">$ {renderPriceText(stats.tokenPriceUsd)}</p>
            <p className="text-sm text-dashboard-text-secondary mt-1">{t('dashboard_pro.buy.phase_supply', { supply: formatMetricValue(stats.presaleAvailable, { compactLarge: true }) })}</p>
          </div>
          <div className="grid grid-cols-3 gap-2 rounded-dashboard-lg p-1 bg-dashboard-highlight border border-dashboard-border">
            {['SOL', 'USDT'].map((currency) => (
              <button
                key={currency}
                type="button"
                onClick={() => setBuyCurrency(currency)}
                className={`h-11 rounded-dashboard-md text-sm font-semibold ${buyCurrency === currency ? 'bg-dashboard-primary text-white' : 'text-dashboard-primary-dark bg-white'}`}
              >
                {currency}
              </button>
            ))}
            <button type="button" className="h-11 rounded-dashboard-md text-sm font-medium border border-dashboard-border bg-white text-dashboard-text-secondary">MAX</button>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">{t('dashboard_pro.buy.payment_amount', { currency: buyCurrency })}</label>
            <Input value={buyPaymentAmount} onChange={(e) => handleBuyAmountChange(e.target.value)} onBlur={handleBuyAmountBlur} min={buyRange.min} max={buyRange.max} type="number" placeholder={t('dashboard_pro.buy.payment_placeholder', { min: buyRange.min, max: buyRange.max })} className="font-mono" />
            <p className="text-xs text-dashboard-muted">{t('dashboard_pro.buy.range_hint', { min: buyRange.min, max: buyRange.max })}</p>
            {buyAmountError && <p className="text-xs text-dashboard-danger">{buyAmountError}</p>}
            {buyCurrency === 'USDT' && <EthereumUsdtNotice />}
          </div>
          <DashboardCard className="p-4 bg-dashboard-highlight">
            <p className="dashboard-label">{t('dashboard_pro.buy.estimated_receive', { amount: formatMetricValue((buyTokenAmount || 0), { compactLarge: true }), currency: PROJECT_CURRENCY_NAME })}</p>
            <p className="dashboard-main-value mt-1 text-dashboard-primary">{formatMetricValue((buyTokenAmount || 0), { compactLarge: true })} {PROJECT_CURRENCY_NAME}</p>
          </DashboardCard>
          <PrimaryButton onClick={handleBuy} disabled={txProcessing || !buyPaymentAmount || Number(buyPaymentAmount) <= 0 || !!buyAmountError} className="w-full h-11 rounded-dashboard-md">
            {txProcessing ? t('dashboard_pro.buy.processing') : t('dashboard_pro.buy.confirm')}
          </PrimaryButton>
        </DashboardCard>
      </ContentSection>
      <div className="xl:col-span-4 space-y-4">
        <GlassPanel>
          <PageHeader title="Phase Progress" />
          <div className="h-5 rounded-full bg-dashboard-highlight border border-dashboard-border overflow-hidden">
            <div className="h-full bg-dashboard-primary" style={{ width: '72%' }} />
          </div>
          <div className="flex items-center justify-between mt-2 text-sm text-dashboard-primary-dark" style={{ fontWeight: 600 }}>
            <span className="dashboard-number">{formatFullNumber(72)}% SOLD</span><span className="dashboard-number">{formatFullNumber(72)}%</span>
          </div>
        </GlassPanel>
        <DashboardCard>
          <ul className="space-y-3 text-sm font-medium">
            <li className="flex items-center gap-2"><BadgeCheck size={18} className="text-dashboard-primary" /> Liquidity Locked</li>
            <li className="flex items-center gap-2"><BadgeCheck size={18} className="text-dashboard-primary" /> Mint Revoked</li>
            <li className="flex items-center gap-2"><BadgeCheck size={18} className="text-dashboard-primary" /> Contract Verified</li>
          </ul>
        </DashboardCard>
      </div>
    </div>
  )

  const renderTransactions = (
    <TableCard title={t('dashboard_pro.sidebar.transactions')}>
      <div className="flex flex-wrap gap-3 mb-4">
        <select value={txTypeFilter} onChange={(e) => setTxTypeFilter(e.target.value)} className="h-[46px] rounded-dashboard-md border border-dashboard-border bg-white px-3 text-sm">
          <option value="all">{t('dashboard_pro.transactions.types.all')}</option>
          <option value="buy">{t('dashboard_pro.transactions.types.buy')}</option>
          <option value="referral">{t('dashboard_pro.transactions.types.referral')}</option>
          <option value="claim">{t('dashboard_pro.transactions.types.claim')}</option>
        </select>
        <select value={txRangeFilter} onChange={(e) => setTxRangeFilter(e.target.value)} className="h-[46px] rounded-dashboard-md border border-dashboard-border bg-white px-3 text-sm">
          <option value="7d">{t('dashboard_pro.transactions.range_7d')}</option>
          <option value="30d">{t('dashboard_pro.transactions.range_30d')}</option>
          <option value="90d">{t('dashboard_pro.transactions.range_90d')}</option>
          <option value="all">{t('dashboard_pro.transactions.range_all')}</option>
        </select>
      </div>
      <div className="overflow-x-auto rounded-dashboard-xl border border-dashboard-border-soft">
        <table className="w-full min-w-[760px] bg-white">
          <thead>
            <tr className="h-11 text-[13px] text-dashboard-text-secondary border-b border-[#EDF3ED]" style={{ fontWeight: 600 }}>
              <th className="text-start px-4">{t('dashboard_pro.transactions.table.date')}</th>
              <th className="text-start px-4">{t('dashboard_pro.transactions.table.type')}</th>
              <th className="text-end px-4">{t('dashboard_pro.transactions.table.tokens')}</th>
              <th className="text-end px-4">{t('dashboard_pro.transactions.table.amount')}</th>
              <th className="text-start px-4">{t('dashboard_pro.transactions.table.status')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((tx) => (
              <tr key={tx.id} className="min-h-[52px] border-b border-[#F1F5F1] hover:bg-[#FAFDFA]">
                <td className="px-4 py-3 text-sm">{new Date(tx.date).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-sm">{t(`dashboard_pro.transactions.types.${tx.type}`)}</td>
                <td className="px-4 py-3 text-sm text-end"><span className="dashboard-number">{formatFullNumber(tx.tokenAmount)} {PROJECT_CURRENCY_NAME}</span></td>
                <td className={cn('px-4 py-3 text-sm text-end', 'dashboard-number', toneClass(tx.type === 'claim' ? tx.usdAmount : 0))} style={{ fontWeight: 600 }}>{formatFullNumber(tx.usdAmount, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {tx.currency}</td>
                <td className="px-4 py-3 text-sm"><StatusPill ok={tx.status === 'confirmed'}>{t(`dashboard_pro.transactions.status.${tx.status}`)}</StatusPill></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </TableCard>
  )

  const renderPerformance = (
    <ContentSection className="p-6 bg-[rgba(255,255,255,0.8)] backdrop-blur-[10px]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-[28px] leading-[1.2] text-[#1F2A1F]" style={{ fontWeight: 700 }}>{t('dashboard_pro.performance.title')}</h3>
          <p className="text-[15px] text-[#667368] mt-1">Track your token growth and performance</p>
        </div>
        <div className="flex items-center gap-2">
          {['7d', '30d', '90d'].map((range) => (
            <button
              key={range}
              type="button"
              onClick={() => { setPerformanceRange(range); setHoveredPointIndex(null) }}
              className={`h-10 px-4 rounded-[14px] border text-sm font-semibold transition-colors ${
                performanceRange === range
                  ? 'bg-[#5FAE6E] text-white border-transparent'
                  : 'bg-[rgba(255,255,255,0.9)] text-[#2F6B3E] border-[#DCECDC]'
              }`}
            >
              {t(`dashboard_pro.transactions.range_${range}`)}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 2xl:grid-cols-[minmax(0,1fr)_300px] gap-4 mt-5">
        <div className="space-y-4">
          <DashboardCard className="rounded-[20px] border-[#DCECDC] bg-[rgba(255,255,255,0.85)] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
            <div className="relative" onMouseLeave={() => setHoveredPointIndex(null)}>
              <svg viewBox={`0 0 ${performanceChart.width} ${performanceChart.height}`} className="w-full h-[360px]">
                <defs>
                  <linearGradient id="performance-area-fill" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(95,174,110,0.22)" />
                    <stop offset="100%" stopColor="rgba(95,174,110,0.02)" />
                  </linearGradient>
                </defs>
                {[0, 1, 2, 3, 4].map((step) => {
                  const y = performanceChart.padding.top + (step / 4) * (performanceChart.height - performanceChart.padding.top - performanceChart.padding.bottom)
                  return <line key={step} x1={performanceChart.padding.left} y1={y} x2={performanceChart.width - performanceChart.padding.right} y2={y} stroke="rgba(31,42,31,0.07)" strokeWidth="1" />
                })}
                <path d={performanceChart.areaPath} fill="url(#performance-area-fill)" />
                <path d={performanceChart.linePath} fill="none" stroke="#5FAE6E" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                {hoveredPoint && <circle cx={hoveredPoint.x} cy={hoveredPoint.y} r="6" fill="#FFFFFF" stroke="#5FAE6E" strokeWidth="3" />}
                {performanceChart.points.map((point) => (
                  <circle
                    key={point.index}
                    cx={point.x}
                    cy={point.y}
                    r="11"
                    fill="transparent"
                    onMouseEnter={() => setHoveredPointIndex(point.index)}
                  />
                ))}
              </svg>
              {hoveredPoint && (
                <div
                  className="absolute pointer-events-none rounded-[14px] border border-[#DCECDC] bg-[rgba(255,255,255,0.94)] px-3 py-2 text-[12px] shadow-[0_10px_30px_rgba(0,0,0,0.05)] backdrop-blur-[8px]"
                  style={{
                    left: `${(hoveredPoint.x / performanceChart.width) * 100}%`,
                    top: `${(hoveredPoint.y / performanceChart.height) * 100}%`,
                    transform: 'translate(-50%, -120%)'
                  }}
                >
                  <p className="text-[#2F6B3E]" style={{ fontWeight: 600 }}>$ {renderPriceText(hoveredPoint.value)}</p>
                  <p className="text-[#667368] mt-0.5">{performanceRange.toUpperCase()} · Point {hoveredPoint.index + 1}</p>
                </div>
              )}
            </div>
          </DashboardCard>
          <div className="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4">
            <div className="rounded-[20px] border border-[#DCECDC] bg-[rgba(255,255,255,0.85)] backdrop-blur-[8px] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.05)] min-w-0">
              <div className="flex items-start gap-3">
                <span className="w-10 h-10 rounded-[14px] border border-[#DCECDC] bg-[#EEF8EE] text-[#2F6B3E] flex items-center justify-center"><CircleDollarSign size={19} /></span>
                <div className="min-w-0">
                  <p className="dashboard-main-value text-[clamp(24px,2.8vw,34px)] leading-tight">$ {renderPriceText(stats.tokenPriceUsd)}</p>
                  <p className="dashboard-label mt-2" style={{ fontWeight: 600 }}>{t('dashboard_pro.performance.current')}</p>
                </div>
              </div>
            </div>
            <div className="rounded-[20px] border border-[#DCECDC] bg-[rgba(255,255,255,0.85)] backdrop-blur-[8px] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.05)] min-w-0">
              <div className="flex items-start gap-3">
                <span className="w-10 h-10 rounded-[14px] border border-[#DCECDC] bg-[#EEF8EE] text-[#2F6B3E] flex items-center justify-center"><TrendingUp size={19} /></span>
                <div className="min-w-0">
                  <p className="dashboard-main-value text-[clamp(24px,2.8vw,34px)] leading-tight">$ {renderPriceText(Math.max(...performanceSeries))}</p>
                  <p className="dashboard-label mt-2" style={{ fontWeight: 600 }}>24H High</p>
                </div>
              </div>
            </div>
            <div className="rounded-[20px] border border-[#DCECDC] bg-[rgba(255,255,255,0.85)] backdrop-blur-[8px] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.05)] min-w-0">
              <div className="flex items-start gap-3">
                <span className="w-10 h-10 rounded-[14px] border border-[#DCECDC] bg-[#EEF8EE] text-[#2F6B3E] flex items-center justify-center"><TrendingDown size={19} /></span>
                <div className="min-w-0">
                  <p className="dashboard-main-value text-[clamp(24px,2.8vw,34px)] leading-tight">$ {renderPriceText(Math.min(...performanceSeries))}</p>
                  <p className="dashboard-label mt-2" style={{ fontWeight: 600 }}>24H Low</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <GlassPanel className="rounded-[20px] border-[#DCECDC] bg-[rgba(255,255,255,0.8)] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
            <PageHeader title="Quick Insights" />
            <div className="space-y-3 mt-1">
              <div className="flex items-center justify-between gap-3 text-sm min-w-0 dashboard-row"><span className="text-[#667368] min-w-0 truncate">Token Price</span><span className="dashboard-number number-neutral text-right text-[clamp(16px,1.4vw,22px)] leading-tight dashboard-ellipsis" style={{ fontWeight: 600 }}>$ {renderPriceText(stats.tokenPriceUsd)}</span></div>
              <div className="flex items-center justify-between gap-3 text-sm min-w-0 dashboard-row"><span className="text-[#667368] min-w-0 truncate">Market Cap</span><span className="dashboard-number number-neutral text-right text-[clamp(16px,1.4vw,22px)] leading-tight dashboard-ellipsis" style={{ fontWeight: 600 }}>$ {formatMetricValue(Math.round(stats.marketCapUsd), { compactLarge: true })}</span></div>
              <div className="flex items-center justify-between gap-3 text-sm min-w-0 dashboard-row"><span className="text-[#667368] min-w-0 truncate">Holders</span><span className="dashboard-number number-neutral text-right text-[clamp(16px,1.4vw,22px)] leading-tight dashboard-ellipsis" style={{ fontWeight: 600 }}>{formatMetricValue(stats.holders, { compactLarge: true })}</span></div>
              <div className="flex items-center justify-between gap-3 text-sm min-w-0 dashboard-row"><span className="text-[#667368] min-w-0 truncate">Volume</span><span className="dashboard-number number-neutral text-right text-[clamp(16px,1.4vw,22px)] leading-tight dashboard-ellipsis" style={{ fontWeight: 600 }}>$ {formatMetricValue(Math.round(totalVolumeUsd), { compactLarge: true })}</span></div>
            </div>
          </GlassPanel>
          <DashboardCard className="rounded-[20px] border-[#DCECDC] bg-[rgba(255,255,255,0.85)] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.05)]">
            <div className="flex items-center justify-between">
              <h4 className="text-base text-[#1F2A1F]" style={{ fontWeight: 700 }}>Your ROI</h4>
              <Activity size={19} className="text-[#2F6B3E]" />
            </div>
            <p className={cn('text-[clamp(30px,3.9vw,52px)] leading-[1.05] dashboard-number mt-5 overflow-hidden text-ellipsis', toneClass(roiPercent))} style={{ fontWeight: 700 }}>{roiPercent > 0 ? '+' : ''}{formatMetricValue(roiPercent, { minimumFractionDigits: 2, maximumFractionDigits: 2, compactLarge: true })}%</p>
          </DashboardCard>
        </div>
      </div>
    </ContentSection>
  )

  const renderTokens = (
    <ContentSection>
      <PageHeader title={t('dashboard_pro.tokens.title')} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard label="Total Balance" value={formatCompactNumber(totalBoughtTokens)} hint={formatFullNumber(totalBoughtTokens)} />
        <StatsCard label="Locked" value={formatCompactNumber(Math.floor(totalBoughtTokens * 0.45))} hint={formatFullNumber(Math.floor(totalBoughtTokens * 0.45))} />
        <StatsCard label="Available" value={formatCompactNumber(Math.floor(totalBoughtTokens * 0.55))} hint={formatFullNumber(Math.floor(totalBoughtTokens * 0.55))} />
      </div>
      <div className="flex gap-3 mt-4">
        <PrimaryButton>Claim</PrimaryButton>
        <SecondaryButton>Stake</SecondaryButton>
      </div>
    </ContentSection>
  )

  const renderReferral = (
    <ContentSection className="space-y-4">
      <PageHeader title={t('dashboard_pro.referral.title')} />
      <CopyField value={referralLink} onCopy={() => handleCopy(referralLink, 'referral')} copyLabel={copied === 'referral' ? t('dashboard_pro.wallet.copied') : t('dashboard_pro.referral.copy_link')} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard label={t('dashboard_pro.referral.invited')} value={`${formatCompactNumber(referralStats.invitedFriends)}`} hint={formatFullNumber(referralStats.invitedFriends)} />
        <StatsCard label={t('dashboard_pro.referral.active')} value={`${formatCompactNumber(referralStats.activeReferrals)}`} hint={formatFullNumber(referralStats.activeReferrals)} />
        <StatsCard label={t('dashboard_pro.referral.earned')} value={`$${formatCompactNumber(referralStats.earnedUsd)}`} hint={`$${formatFullNumber(referralStats.earnedUsd, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`} />
      </div>
      <DashboardCard className="p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="dashboard-label" style={{ fontWeight: 600 }}>{t('dashboard_pro.referral.reward_progress')}</p>
          <p className="text-xs dashboard-number">{formatFullNumber(referralProgress)}%</p>
        </div>
        <div className="h-3 rounded-full bg-dashboard-highlight overflow-hidden">
          <div className="h-full bg-dashboard-primary" style={{ width: `${referralProgress}%` }} />
        </div>
      </DashboardCard>
    </ContentSection>
  )

  const renderClaim = (
    <ContentSection>
      <PageHeader title={t('dashboard_pro.sidebar.claim')} />
      <DashboardCard className="p-5">
        <p className="dashboard-label">Available Rewards</p>
        <p className="dashboard-main-value mt-2 text-dashboard-primary">{formatFullNumber(245000)} {PROJECT_CURRENCY_NAME}</p>
        <PrimaryButton className="mt-4">Claim Rewards</PrimaryButton>
      </DashboardCard>
    </ContentSection>
  )

  const renderStaking = (
    <ContentSection>
      <PageHeader title={t('dashboard_pro.sidebar.staking')} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard label="APR" value={`${formatFullNumber(24)}%`} />
        <StatsCard label="Status" value={t('dashboard_pro.soon')} />
        <StatsCard label="Staked" value={`${formatFullNumber(0)} PWIFE`} />
      </div>
      <DashboardCard className="mt-4 p-5">
        <p className="text-sm text-dashboard-text-secondary">{t('dashboard_pro.soon_desc')}</p>
      </DashboardCard>
    </ContentSection>
  )

  const renderSupport = (
    <ContentSection>
      <PageHeader title={t('dashboard_pro.support.title')} />
      <p className="text-sm text-dashboard-text-secondary mb-4">{t('dashboard_pro.support.desc')}</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <a href={supportUrl} target="_blank" rel="noreferrer" className="rounded-dashboard-lg border border-dashboard-border-soft bg-white p-4 flex items-center gap-3">
          <LifeBuoy size={18} className="text-dashboard-primary" /><span className="text-sm font-medium">{t('dashboard_pro.support.open')}</span>
        </a>
        <a href="mailto:support@pepewife.io" className="rounded-dashboard-lg border border-dashboard-border-soft bg-white p-4 flex items-center gap-3">
          <Mail size={18} className="text-dashboard-primary" /><span className="text-sm font-medium">Email Support</span>
        </a>
        <a href={faqUrl} className="rounded-dashboard-lg border border-dashboard-border-soft bg-white p-4 flex items-center gap-3">
          <HelpCircle size={18} className="text-dashboard-primary" /><span className="text-sm font-medium">FAQ</span>
        </a>
      </div>
    </ContentSection>
  )

  const currentSection = {
    overview: renderOverview,
    buy: renderBuy,
    transactions: renderTransactions,
    performance: renderPerformance,
    tokens: renderTokens,
    referral: renderReferral,
    claim: renderClaim,
    staking: renderStaking,
    support: renderSupport
  }[activeSection]

  return (
    <AppShell>
      <div className={isRTL ? 'rtl' : 'ltr'}>
        <Navbar>
          <div className="w-full flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <button type="button" onClick={() => setSidebarOpen((v) => !v)} className="lg:hidden w-10 h-10 rounded-full border border-dashboard-border bg-white/90 flex items-center justify-center">
                {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
              </button>
              <button type="button" onClick={() => navigate('/')}><BrandLogo size="md" /></button>
            </div>
            <nav className="hidden lg:flex items-center gap-5">
              {navLinks.map((link) => (
                <a key={link.href} href={link.href} className="text-sm font-medium text-dashboard-text-primary hover:text-dashboard-primary">
                  {t(link.labelKey)}
                </a>
              ))}
            </nav>
            <div className="flex items-center gap-2 md:gap-3">
              <LanguageSwitcher className="hidden md:flex" />
              <PrimaryButton className="h-[42px] min-w-[124px] rounded-dashboard-pill hidden md:flex items-center justify-center gap-2">
                <Rocket size={16} /> Buy Now
              </PrimaryButton>
              <GlassPanel className="h-10 px-[14px] py-0 rounded-dashboard-pill border border-[#DCECDC] bg-[rgba(255,255,255,0.92)] hidden sm:flex items-center min-w-[112px] max-w-[156px] shadow-[0_8px_20px_rgba(31,42,31,0.06)]">
                <span dir="ltr" title={address} className="dashboard-number text-[12px] md:text-[13px] font-semibold tracking-tight truncate">{formatAddress(address)}</span>
              </GlassPanel>
              <SecondaryButton onClick={() => handleCopy(address, 'wallet-badge')} className="h-10 px-3.5 rounded-dashboard-pill flex items-center gap-2 border-[#CFE5CF] bg-white/95 hover:bg-[#F4FBF4] text-dashboard-primary-dark shadow-[0_8px_20px_rgba(31,42,31,0.06)]">
                {copied === 'wallet-badge' ? <CircleCheck size={16} className="text-dashboard-success" /> : <Copy size={16} />}
                <span dir="ltr" className="text-[13px] font-semibold tracking-tight">{copied === 'wallet-badge' ? t('dashboard_pro.wallet.copied') : t('dashboard_pro.wallet.copy_nav')}</span>
              </SecondaryButton>
            </div>
          </div>
        </Navbar>

        <PageContainer className="mt-5 pb-8">
          <div className={`grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[260px_minmax(0,1fr)_320px] gap-5 ${isRTL ? 'lg:[direction:rtl]' : ''}`}>
            <aside className={`${sidebarOpen ? 'translate-x-0' : (isRTL ? 'translate-x-full' : '-translate-x-full')} lg:translate-x-0 fixed lg:sticky top-24 z-30 ${isRTL ? 'right-4' : 'left-4'} lg:left-auto lg:right-auto w-[260px] transition-transform`}>
              <Sidebar>
                <div className="space-y-2">
                  {sidebarItems.map((item) => {
                    const Icon = sidebarIcons[item.id]
                    return (
                      <button key={item.id} type="button" onClick={() => { setActiveSection(item.id); setSidebarOpen(false) }} className="w-full text-left">
                        <SidebarItem active={activeSection === item.id} right={item.id === 'tokens' ? <Badge>NEW</Badge> : null}>
                          <span className="flex items-center gap-3 min-w-0">
                            <Icon size={18} />
                            <span className="truncate">{t(item.labelKey)}</span>
                          </span>
                        </SidebarItem>
                      </button>
                    )
                  })}
                </div>
                <SecondaryButton onClick={handleLogout} className="w-full mt-4 h-11 flex items-center justify-center gap-2 border-[#ead3d3] text-[#9d3d3d]">
                  <LogOut size={16} /> {t('dashboard_pro.logout')}
                </SecondaryButton>
              </Sidebar>
            </aside>

            <main className="min-w-0">
              <AnimatePresence>
                {notification && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`mb-4 rounded-dashboard-lg border p-3 flex items-center gap-2 ${notification.type === 'success' ? 'bg-[#EDFAEF] border-[#D3EFD9] text-dashboard-success' : 'bg-[#FFF4F4] border-[#F0D5D5] text-dashboard-danger'}`}
                  >
                    {notification.type === 'success' ? <CircleCheck size={16} /> : <X size={16} />}
                    <span className="text-sm font-medium">{notification.message}</span>
                  </motion.div>
                )}
              </AnimatePresence>
              {currentSection}
              {dashboardExtraContent}
            </main>

            {activeSection !== 'performance' && (
              <aside className="hidden xl:block">
                <div className="space-y-4 sticky top-24">
                  <GlassPanel>
                    <PageHeader title="Quick Insights" />
                    <div className="space-y-3">
                      <div className="flex items-center justify-between gap-3 text-sm dashboard-row"><span className="text-dashboard-text-secondary min-w-0 truncate">Token Price</span><span className="dashboard-number number-neutral dashboard-ellipsis" style={{ fontWeight: 600 }}>$ {renderPriceText(stats.tokenPriceUsd)}</span></div>
                      <div className="flex items-center justify-between gap-3 text-sm dashboard-row"><span className="text-dashboard-text-secondary min-w-0 truncate">Market Cap</span><span className="dashboard-number number-neutral dashboard-ellipsis" style={{ fontWeight: 600 }}>$ {formatMetricValue(Math.round(stats.marketCapUsd), { compactLarge: true })}</span></div>
                      <div className="flex items-center justify-between gap-3 text-sm dashboard-row"><span className="text-dashboard-text-secondary min-w-0 truncate">Holders</span><span className="dashboard-number number-neutral dashboard-ellipsis" style={{ fontWeight: 600 }}>{formatMetricValue(stats.holders, { compactLarge: true })}</span></div>
                    </div>
                  </GlassPanel>
                  <DashboardCard className="relative overflow-hidden">
                    <PageHeader title="Referral" />
                    <p className="text-sm text-dashboard-text-secondary">Invite friends and earn rewards</p>
                    <div className="mt-3 flex items-center gap-2 text-dashboard-primary text-sm" style={{ fontWeight: 600 }}>
                      <ArrowUpRight size={16} /> <span className="dashboard-number">{formatFullNumber(20)}%</span> referral rate
                    </div>
                  </DashboardCard>
                </div>
              </aside>
            )}
          </div>
        </PageContainer>
        <footer className="pb-8">
          <PageContainer>
            <div className="rounded-dashboard-xl border border-dashboard-border-soft bg-[rgba(255,255,255,0.82)] p-5 shadow-dashboard-card">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <BrandLogo size="md" />
                  <p className="text-sm text-dashboard-text-secondary">Secure crypto dashboard experience with unified design system.</p>
                </div>
                <nav className="flex flex-wrap items-center gap-4">
                  {navLinks.map((link) => (
                    <a key={`footer-${link.href}`} href={link.href} className="text-sm font-medium text-dashboard-text-primary hover:text-dashboard-primary">
                      {t(link.labelKey)}
                    </a>
                  ))}
                  <a href={faqUrl} className="text-sm font-medium text-dashboard-text-primary hover:text-dashboard-primary">Support</a>
                </nav>
              </div>
              <div className="mt-4 pt-4 border-t border-dashboard-border-soft flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <p className="text-xs text-dashboard-text-secondary">© {new Date().getFullYear()} PEPE WIFE. All rights reserved.</p>
                <a href={supportUrl} target="_blank" rel="noreferrer" className="text-xs font-medium text-dashboard-primary hover:text-dashboard-primary-dark">
                  Contact Support
                </a>
              </div>
            </div>
          </PageContainer>
        </footer>

        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSidebarOpen(false)}
              className="fixed inset-0 bg-black/35 lg:hidden z-20"
            />
          )}
        </AnimatePresence>
      </div>
    </AppShell>
  )
}

export default DashboardPage
