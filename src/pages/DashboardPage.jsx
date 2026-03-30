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

  const chartPath = useMemo(() => {
    if (!performanceSeries.length) return ''
    const min = Math.min(...performanceSeries)
    const max = Math.max(...performanceSeries)
    const spread = Math.max(max - min, 0.000000001)
    return performanceSeries.map((value, i) => {
      const x = (i / Math.max(performanceSeries.length - 1, 1)) * 100
      const y = 100 - ((value - min) / spread) * 100
      return `${i === 0 ? 'M' : 'L'} ${x} ${y}`
    }).join(' ')
  }, [performanceSeries])

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
        <StatsCard icon={<Coins size={18} />} label={t('dashboard_pro.overview.total_supply')} value={`${stats.totalSupply.toLocaleString()} ${PROJECT_CURRENCY_NAME}`} />
        <StatsCard icon={<Wallet size={18} />} label={t('dashboard_pro.overview.presale_available')} value={`${stats.presaleAvailable.toLocaleString()} ${PROJECT_CURRENCY_NAME}`} />
        <StatsCard icon={<Rocket size={18} />} label={t('dashboard_pro.overview.token_price')} value={`$${stats.tokenPriceUsd.toFixed(8)}`} hint={t('dashboard_pro.overview.phase_status', { current: stats.currentPhase, total: stats.totalPhases })} />
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <ContentSection>
          <PageHeader title={t('dashboard_pro.wallet_overview.title')} />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <DashboardCard className="p-4">
              <p className="text-[13px] text-dashboard-text-secondary">{t('dashboard_pro.wallet_overview.total_value')}</p>
              <p className="text-[28px] font-bold mt-2">${totalWalletUsd.toFixed(2)}</p>
            </DashboardCard>
            <DashboardCard className="p-4">
              <p className="text-[13px] text-dashboard-text-secondary">{t('dashboard_pro.wallet.sol_balance')}</p>
              <p className="text-[28px] font-bold mt-2">{walletBalancesLoading ? '...' : (walletBalances.sol === null ? '--' : walletBalances.sol.toFixed(4))}</p>
            </DashboardCard>
            <DashboardCard className="p-4">
              <p className="text-[13px] text-dashboard-text-secondary">{t('dashboard_pro.wallet.usdt_balance')}</p>
              <p className="text-[28px] font-bold mt-2">{walletBalancesLoading ? '...' : (walletBalances.usdt === null ? '--' : walletBalances.usdt.toFixed(2))}</p>
            </DashboardCard>
          </div>
        </ContentSection>
        <ContentSection>
          <PageHeader title={t('dashboard_pro.overview.roi_calculator')} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium mb-2">{t('dashboard_pro.overview.investment_label')}</p>
              <Input type="number" value={roiInvestment} onChange={(e) => setRoiInvestment(e.target.value)} placeholder={t('dashboard_pro.overview.investment_placeholder')} />
            </div>
            <div>
              <p className="text-sm font-medium mb-2">{t('dashboard_pro.overview.target_label')}</p>
              <Input type="number" value={roiTargetPrice} onChange={(e) => setRoiTargetPrice(e.target.value)} placeholder={t('dashboard_pro.overview.target_placeholder')} />
            </div>
          </div>
          {'error' in roiResult ? (
            <p className="text-sm text-dashboard-danger mt-3">{t('dashboard_pro.overview.invalid_roi')}</p>
          ) : (
            <div className="grid grid-cols-2 gap-4 mt-4">
              <DashboardCard className="p-4"><p className="text-[13px] text-dashboard-text-secondary">{t('dashboard_pro.overview.profit')}</p><p className="text-xl font-bold mt-1">${Number(roiResult.profit).toLocaleString()}</p></DashboardCard>
              <DashboardCard className="p-4"><p className="text-[13px] text-dashboard-text-secondary">{t('dashboard_pro.overview.roi')}</p><p className="text-xl font-bold mt-1">{roiResult.roi}%</p></DashboardCard>
            </div>
          )}
        </ContentSection>
      </div>
    </div>
  )

  const renderBuy = (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-5">
      <ContentSection className="xl:col-span-8">
        <PageHeader title={t('dashboard_pro.buy.title')} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <StatsCard label="Wallet Balance" value="$1,240" />
          <StatsCard label="Total Invested" value="$800" />
          <StatsCard label="PWIFE Owned" value="120,000,000" />
        </div>
        <DashboardCard className="space-y-4">
          <div>
            <p className="text-[13px] text-dashboard-text-secondary">{t('dashboard_pro.buy.current_price')}</p>
            <p className="text-[28px] font-bold text-dashboard-primary mt-1">$0.00000005</p>
            <p className="text-sm text-dashboard-text-secondary mt-1">{t('dashboard_pro.buy.phase_supply', { supply: stats.presaleAvailable.toLocaleString() })}</p>
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
            <Input value={buyPaymentAmount} onChange={(e) => handleBuyAmountChange(e.target.value)} onBlur={handleBuyAmountBlur} min={buyRange.min} max={buyRange.max} type="number" placeholder={t('dashboard_pro.buy.payment_placeholder', { min: buyRange.min, max: buyRange.max })} />
            <p className="text-xs text-dashboard-muted">{t('dashboard_pro.buy.range_hint', { min: buyRange.min, max: buyRange.max })}</p>
            {buyAmountError && <p className="text-xs text-dashboard-danger">{buyAmountError}</p>}
            {buyCurrency === 'USDT' && <EthereumUsdtNotice />}
          </div>
          <DashboardCard className="p-4 bg-dashboard-highlight">
            <p className="text-[13px] text-dashboard-text-secondary">{t('dashboard_pro.buy.estimated_receive', { amount: (buyTokenAmount || 0).toLocaleString(), currency: PROJECT_CURRENCY_NAME })}</p>
            <p className="text-[28px] font-bold mt-1 text-dashboard-primary">{(buyTokenAmount || 0).toLocaleString()} {PROJECT_CURRENCY_NAME}</p>
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
          <div className="flex items-center justify-between mt-2 text-sm font-semibold text-dashboard-primary-dark">
            <span>72% SOLD</span><span>72%</span>
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
            <tr className="h-11 text-[13px] font-semibold text-dashboard-text-secondary border-b border-[#EDF3ED]">
              <th className="text-start px-4">{t('dashboard_pro.transactions.table.date')}</th>
              <th className="text-start px-4">{t('dashboard_pro.transactions.table.type')}</th>
              <th className="text-start px-4">{t('dashboard_pro.transactions.table.tokens')}</th>
              <th className="text-start px-4">{t('dashboard_pro.transactions.table.amount')}</th>
              <th className="text-start px-4">{t('dashboard_pro.transactions.table.status')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((tx) => (
              <tr key={tx.id} className="min-h-[52px] border-b border-[#F1F5F1] hover:bg-[#FAFDFA]">
                <td className="px-4 py-3 text-sm">{new Date(tx.date).toLocaleDateString()}</td>
                <td className="px-4 py-3 text-sm">{t(`dashboard_pro.transactions.types.${tx.type}`)}</td>
                <td className="px-4 py-3 text-sm">{tx.tokenAmount.toLocaleString()} {PROJECT_CURRENCY_NAME}</td>
                <td className={`px-4 py-3 text-sm font-semibold ${tx.type === 'claim' ? 'text-dashboard-success' : 'text-dashboard-text-primary'}`}>{tx.usdAmount.toFixed(2)} {tx.currency}</td>
                <td className="px-4 py-3 text-sm"><StatusPill ok={tx.status === 'confirmed'}>{t(`dashboard_pro.transactions.status.${tx.status}`)}</StatusPill></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </TableCard>
  )

  const renderPerformance = (
    <ContentSection>
      <PageHeader
        title={t('dashboard_pro.performance.title')}
        right={
          <div className="flex items-center gap-2">
            {['7d', '30d', '90d'].map((range) => (
              <SecondaryButton key={range} onClick={() => setPerformanceRange(range)} className={performanceRange === range ? 'bg-dashboard-primary text-white border-transparent' : ''}>
                {t(`dashboard_pro.transactions.range_${range}`)}
              </SecondaryButton>
            ))}
          </div>
        }
      />
      <DashboardCard className="p-4 bg-white/90">
        <svg viewBox="0 0 100 100" className="w-full h-56">
          <path d={chartPath} fill="none" stroke="#5FAE6E" strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
        </svg>
      </DashboardCard>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <StatsCard label={t('dashboard_pro.performance.current')} value={`$${stats.tokenPriceUsd.toFixed(8)}`} />
        <StatsCard label={t('dashboard_pro.performance.high')} value={`$${Math.max(...performanceSeries).toFixed(8)}`} />
        <StatsCard label={t('dashboard_pro.performance.low')} value={`$${Math.min(...performanceSeries).toFixed(8)}`} />
      </div>
    </ContentSection>
  )

  const renderTokens = (
    <ContentSection>
      <PageHeader title={t('dashboard_pro.tokens.title')} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard label="Total Balance" value={totalBoughtTokens.toLocaleString()} />
        <StatsCard label="Locked" value={`${Math.floor(totalBoughtTokens * 0.45).toLocaleString()}`} />
        <StatsCard label="Available" value={`${Math.floor(totalBoughtTokens * 0.55).toLocaleString()}`} />
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
        <StatsCard label={t('dashboard_pro.referral.invited')} value={`${referralStats.invitedFriends}`} />
        <StatsCard label={t('dashboard_pro.referral.active')} value={`${referralStats.activeReferrals}`} />
        <StatsCard label={t('dashboard_pro.referral.earned')} value={`$${referralStats.earnedUsd.toFixed(2)}`} />
      </div>
      <DashboardCard className="p-4">
        <div className="flex items-center justify-between mb-2">
          <p className="text-[13px] font-medium text-dashboard-text-secondary">{t('dashboard_pro.referral.reward_progress')}</p>
          <p className="text-xs">{referralProgress}%</p>
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
        <p className="text-[13px] text-dashboard-text-secondary">Available Rewards</p>
        <p className="text-[28px] font-bold mt-2 text-dashboard-primary">245,000 {PROJECT_CURRENCY_NAME}</p>
        <PrimaryButton className="mt-4">Claim Rewards</PrimaryButton>
      </DashboardCard>
    </ContentSection>
  )

  const renderStaking = (
    <ContentSection>
      <PageHeader title={t('dashboard_pro.sidebar.staking')} />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard label="APR" value="24%" />
        <StatsCard label="Status" value={t('dashboard_pro.soon')} />
        <StatsCard label="Staked" value="0 PWIFE" />
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
            <div className="flex items-center gap-3">
              <LanguageSwitcher className="hidden md:flex" />
              <PrimaryButton className="h-[42px] min-w-[124px] rounded-dashboard-pill hidden md:flex items-center justify-center gap-2">
                <Rocket size={16} /> Buy Now
              </PrimaryButton>
              <GlassPanel className="h-10 px-[14px] py-0 rounded-dashboard-pill border border-[#DCECDC] bg-[rgba(255,255,255,0.88)] hidden sm:flex items-center">
                <span className="text-[13px] font-medium">{formatAddress(address)}</span>
              </GlassPanel>
              <SecondaryButton onClick={() => handleCopy(address, 'wallet-badge')} className="h-10 px-3 rounded-dashboard-pill flex items-center gap-2">
                <Copy size={16} />
                <span className="text-[13px] font-medium">{copied === 'wallet-badge' ? t('dashboard_pro.wallet.copied') : t('dashboard_pro.wallet.copy_nav')}</span>
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
            </main>

            <aside className="hidden xl:block">
              <div className="space-y-4 sticky top-24">
                <GlassPanel>
                  <PageHeader title="Quick Insights" />
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm"><span className="text-dashboard-text-secondary">Token Price</span><span className="font-semibold">${stats.tokenPriceUsd.toFixed(8)}</span></div>
                    <div className="flex items-center justify-between text-sm"><span className="text-dashboard-text-secondary">Market Cap</span><span className="font-semibold">${Math.round(stats.marketCapUsd).toLocaleString()}</span></div>
                    <div className="flex items-center justify-between text-sm"><span className="text-dashboard-text-secondary">Holders</span><span className="font-semibold">{stats.holders.toLocaleString()}</span></div>
                  </div>
                </GlassPanel>
                <DashboardCard className="relative overflow-hidden">
                  <PageHeader title="Referral" />
                  <p className="text-sm text-dashboard-text-secondary">Invite friends and earn rewards</p>
                  <div className="mt-3 flex items-center gap-2 text-dashboard-primary text-sm font-semibold">
                    <ArrowUpRight size={16} /> 20% referral rate
                  </div>
                  <img src="/assets/hero-character.png" alt="PepeWife" className="absolute -bottom-6 -right-3 w-28 opacity-80 pointer-events-none" />
                </DashboardCard>
              </div>
            </aside>
          </div>
        </PageContainer>

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
