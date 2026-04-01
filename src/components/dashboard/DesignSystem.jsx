import React from 'react'
import { dashboardTokens } from './tokens'

const cn = (...classes) => classes.filter(Boolean).join(' ')

export const AppShell = ({ children }) => (
  <div
    className="dashboard-shell min-h-screen relative text-pepe-black"
    style={{
      backgroundColor: dashboardTokens.colors.pageBg,
      backgroundImage: "linear-gradient(rgba(255,255,255,0.10), rgba(255,255,255,0.10)), url('/assets/bab.png')",
      backgroundSize: 'contain',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'fixed'
    }}
  >
    {children}
  </div>
)

export const PageContainer = ({ children, className = '' }) => (
  <div className={cn('w-full max-w-[1440px] mx-auto px-4 md:px-5 lg:px-6', className)}>{children}</div>
)

export const DashboardNavbar = ({ children }) => (
  <header className="sticky top-4 z-40">
    <PageContainer>
      <div className="h-[72px] w-full px-5 py-4 border-4 border-pepe-black rounded-[22px] bg-white shadow-[6px_6px_0_0_#000] flex items-center">
        {children}
      </div>
    </PageContainer>
  </header>
)

export const DashboardSidebar = ({ children, className = '' }) => (
  <div className={cn('rounded-[2rem] border-4 border-pepe-black bg-white p-[18px] shadow-[8px_8px_0_0_#000] min-h-[calc(100vh-120px)]', className)}>
    {children}
  </div>
)

export const Navbar = DashboardNavbar
export const Sidebar = DashboardSidebar

export const SidebarItem = ({ active, children, disabled, right }) => (
  <div
    className={cn(
      'w-full h-[46px] px-[14px] rounded-xl border-4 border-pepe-black transition-all flex items-center justify-between gap-3 text-sm font-black uppercase',
      active
        ? 'bg-pepe-yellow text-pepe-black shadow-[4px_4px_0_0_#000]'
        : 'border-transparent text-pepe-black hover:bg-pepe-green hover:text-white hover:shadow-[4px_4px_0_0_#000]',
      disabled && 'opacity-55'
    )}
  >
    {children}
    {right}
  </div>
)

export const ContentSection = ({ children, className = '' }) => (
  <section className={cn('rounded-[2rem] border-4 border-pepe-black bg-white p-5 shadow-[8px_8px_0_0_#000]', className)}>
    {children}
  </section>
)

export const PageHeader = ({ title, right }) => (
  <div className="flex items-center justify-between gap-3 mb-[14px]">
    <h3 className="text-lg leading-[1.2] text-pepe-black min-w-0 truncate font-black uppercase italic" style={{ fontWeight: 900 }}>{title}</h3>
    {right}
  </div>
)

export const SectionHeader = PageHeader

export const DashboardCard = ({ children, className = '' }) => (
  <div className={cn('min-w-0 overflow-hidden rounded-[1.5rem] border-4 border-pepe-black bg-white p-5 shadow-[6px_6px_0_0_#000]', className)}>{children}</div>
)

export const GlassPanel = ({ children, className = '' }) => (
  <div className={cn('min-w-0 rounded-[2rem] border-4 border-pepe-black bg-white/90 backdrop-blur-[10px] p-5 shadow-[6px_6px_0_0_#000]', className)}>{children}</div>
)

export const Card = DashboardCard
export const GlassCard = GlassPanel

export const StatsCard = ({ icon, label, value, hint, className = '' }) => (
  <DashboardCard className={cn('min-h-[108px] p-[18px] md:p-5', className)}>
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        <p className="dashboard-label truncate font-black uppercase text-sm mb-1 text-pepe-black" style={{ fontWeight: 900 }}>{label}</p>
        <p className="dashboard-main-value dashboard-stat-value mt-2 block max-w-full dashboard-ellipsis text-pepe-black font-black" style={{ fontWeight: 900 }}>{value}</p>
        {hint ? <p className="text-xs font-bold text-gray-600 mt-1 truncate max-w-full">{hint}</p> : null}
      </div>
      {icon ? (
        <span className="w-9 h-9 rounded-xl bg-pepe-green border-4 border-pepe-black flex items-center justify-center shrink-0 shadow-[3px_3px_0_0_#000]">
          {icon}
        </span>
      ) : null}
    </div>
  </DashboardCard>
)

export const Button = ({ children, className = '', ...props }) => (
  <button {...props} className={cn('h-11 px-[18px] rounded-xl border-4 border-pepe-black text-sm font-black uppercase transition-all shadow-[4px_4px_0_0_#000] hover:shadow-[6px_6px_0_0_#000] hover:-translate-y-0.5 active:translate-y-0', className)}>
    {children}
  </button>
)

export const PrimaryButton = ({ children, className = '', ...props }) => (
  <Button
    {...props}
    className={cn('bg-pepe-green text-pepe-black hover:bg-pepe-yellow', className)}
  >
    {children}
  </Button>
)

export const SecondaryButton = ({ children, className = '', ...props }) => (
  <Button {...props} className={cn('bg-white text-pepe-black hover:bg-pepe-pink hover:text-white', className)}>
    {children}
  </Button>
)

export const Input = (props) => (
  <input
    {...props}
    className={cn(
      'w-full h-[46px] rounded-xl border-4 border-pepe-black bg-white px-[14px] text-sm font-bold text-pepe-black placeholder:text-gray-400 focus:border-pepe-green focus:outline-none focus:shadow-[4px_4px_0_0_#000]',
      props.className
    )}
  />
)

export const CopyField = ({ value, onCopy, copyLabel = 'Copy', className = '' }) => (
  <div className={cn('flex items-center gap-2 rounded-xl border-4 border-pepe-black bg-white p-2 shadow-[4px_4px_0_0_#000]', className)}>
    <input value={value} readOnly className="flex-1 min-w-0 bg-transparent outline-none text-sm font-bold text-pepe-black truncate" />
    <PrimaryButton onClick={onCopy} className="h-10 px-[14px] rounded-xl text-[13px]">
      {copyLabel}
    </PrimaryButton>
  </div>
)

export const CopyInput = CopyField

export const ProgressCard = ({ title, value, children }) => (
  <ContentSection>
    <PageHeader title={title} />
    <div className="h-5 rounded-full bg-white border-4 border-pepe-black overflow-hidden">
      <div className="h-full bg-pepe-green" style={{ width: `${value}%` }} />
    </div>
    {children}
  </ContentSection>
)

export const TableCard = ({ title, children }) => (
  <DashboardCard className="p-5">
    <PageHeader title={title} />
    {children}
  </DashboardCard>
)

export const EmptyState = ({ title, subtitle }) => (
  <DashboardCard className="text-center">
    <p className="text-[28px] leading-[1.2] font-black uppercase italic text-pepe-black" style={{ fontWeight: 900 }}>{title}</p>
    <p className="text-sm text-gray-600 mt-2 font-bold">{subtitle}</p>
  </DashboardCard>
)

export const Badge = ({ children, className = '' }) => (
  <span className={cn('text-[10px] px-3 py-1 rounded-full bg-pepe-yellow text-pepe-black font-black border-2 border-pepe-black shadow-[2px_2px_0_0_#000]', className)}>{children}</span>
)

export const StatusPill = ({ children, ok = true }) => (
  <span className={cn('px-3 py-1 rounded-full text-xs font-black uppercase border-2 border-pepe-black', ok ? 'bg-pepe-green text-pepe-black shadow-[2px_2px_0_0_#000]' : 'bg-red-500 text-white shadow-[2px_2px_0_0_#000]')}>
    {children}
  </span>
)
