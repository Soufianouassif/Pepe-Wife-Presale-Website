import React from 'react'
import { dashboardTokens } from './tokens'

const cn = (...classes) => classes.filter(Boolean).join(' ')

export const AppShell = ({ children }) => (
  <div
    className="dashboard-shell min-h-screen relative text-dashboard-text-primary"
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
      <div className="h-[72px] w-full px-5 py-4 border border-[#E2EFE2] rounded-[22px] bg-white backdrop-blur-[10px] shadow-dashboard-soft flex items-center">
        {children}
      </div>
    </PageContainer>
  </header>
)

export const DashboardSidebar = ({ children, className = '' }) => (
  <div className={cn('rounded-3xl border border-[#E0EEE0] bg-[rgba(255,255,255,0.58)] backdrop-blur-[10px] p-[18px] shadow-dashboard-soft min-h-[calc(100vh-120px)]', className)}>
    {children}
  </div>
)

export const Navbar = DashboardNavbar
export const Sidebar = DashboardSidebar

export const SidebarItem = ({ active, children, disabled, right }) => (
  <div
    className={cn(
      'w-full h-[46px] px-[14px] rounded-dashboard-md border transition-all flex items-center justify-between gap-3 text-sm font-medium',
      active
        ? 'bg-dashboard-primary text-white border-transparent shadow-[0_8px_20px_rgba(31,42,31,0.08)]'
        : 'border-transparent text-dashboard-text-primary hover:bg-[#EEF7EE] hover:text-dashboard-primary-dark',
      disabled && 'opacity-55'
    )}
  >
    {children}
    {right}
  </div>
)

export const ContentSection = ({ children, className = '' }) => (
  <section className={cn('rounded-dashboard-xl border border-dashboard-border-soft bg-[rgba(255,255,255,0.82)] p-5 shadow-dashboard-card', className)}>
    {children}
  </section>
)

export const PageHeader = ({ title, right }) => (
  <div className="flex items-center justify-between gap-3 mb-[14px]">
    <h3 className="text-lg leading-[1.2] text-dashboard-text-primary min-w-0 truncate" style={{ fontWeight: 700 }}>{title}</h3>
    {right}
  </div>
)

export const SectionHeader = PageHeader

export const DashboardCard = ({ children, className = '' }) => (
  <div className={cn('min-w-0 overflow-hidden rounded-dashboard-xl border border-dashboard-border-soft bg-white p-5 shadow-dashboard-card', className)}>{children}</div>
)

export const GlassPanel = ({ children, className = '' }) => (
  <div className={cn('min-w-0 rounded-dashboard-xl border border-[rgba(255,255,255,0.35)] bg-[rgba(255,255,255,0.58)] backdrop-blur-[10px] p-5 shadow-dashboard-soft', className)}>{children}</div>
)

export const Card = DashboardCard
export const GlassCard = GlassPanel

export const StatsCard = ({ icon, label, value, hint, className = '' }) => (
  <DashboardCard className={cn('min-h-[108px] p-[18px] md:p-5', className)}>
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0 flex-1">
        <p className="dashboard-label truncate" style={{ fontWeight: 600 }}>{label}</p>
        <p className="dashboard-main-value dashboard-stat-value mt-2 block max-w-full dashboard-ellipsis">{value}</p>
        {hint ? <p className="text-xs font-normal text-dashboard-muted mt-1 truncate max-w-full">{hint}</p> : null}
      </div>
      {icon ? (
        <span className="w-9 h-9 rounded-[12px] bg-dashboard-icon-soft text-dashboard-primary flex items-center justify-center shrink-0">
          {icon}
        </span>
      ) : null}
    </div>
  </DashboardCard>
)

export const Button = ({ children, className = '', ...props }) => (
  <button {...props} className={cn('h-11 px-[18px] rounded-dashboard-md border text-sm font-medium transition-colors', className)}>
    {children}
  </button>
)

export const PrimaryButton = ({ children, className = '', ...props }) => (
  <Button
    {...props}
    className={cn('bg-dashboard-primary text-white border-transparent shadow-dashboard-soft hover:bg-dashboard-hoverGreen', className)}
  >
    {children}
  </Button>
)

export const SecondaryButton = ({ children, className = '', ...props }) => (
  <Button {...props} className={cn('bg-[rgba(255,255,255,0.9)] border-dashboard-border-soft text-dashboard-primary-dark hover:bg-dashboard-highlight', className)}>
    {children}
  </Button>
)

export const Input = (props) => (
  <input
    {...props}
    className={cn(
      'w-full h-[46px] rounded-dashboard-md border border-dashboard-border bg-[rgba(255,255,255,0.95)] px-[14px] text-sm font-medium text-dashboard-text-primary placeholder:text-dashboard-muted focus:border-dashboard-primary focus:outline-none focus:shadow-[0_0_0_4px_rgba(95,174,110,0.12)]',
      props.className
    )}
  />
)

export const CopyField = ({ value, onCopy, copyLabel = 'Copy', className = '' }) => (
  <div className={cn('flex items-center gap-2 rounded-dashboard-md border border-dashboard-border-soft bg-white p-2', className)}>
    <input value={value} readOnly className="flex-1 min-w-0 bg-transparent outline-none text-sm font-medium text-dashboard-text-primary truncate" />
    <PrimaryButton onClick={onCopy} className="h-10 px-[14px] rounded-[12px] text-[13px]">
      {copyLabel}
    </PrimaryButton>
  </div>
)

export const CopyInput = CopyField

export const ProgressCard = ({ title, value, children }) => (
  <ContentSection>
    <PageHeader title={title} />
    <div className="h-5 rounded-full bg-dashboard-highlight border border-dashboard-border overflow-hidden">
      <div className="h-full bg-dashboard-primary" style={{ width: `${value}%` }} />
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
    <p className="text-[28px] leading-[1.2]" style={{ fontWeight: 700 }}>{title}</p>
    <p className="text-sm text-dashboard-text-secondary mt-2">{subtitle}</p>
  </DashboardCard>
)

export const Badge = ({ children, className = '' }) => (
  <span className={cn('text-[10px] px-2 py-0.5 rounded-full bg-dashboard-highlight text-dashboard-primary-dark font-semibold', className)}>{children}</span>
)

export const StatusPill = ({ children, ok = true }) => (
  <span className={cn('px-2.5 py-1 rounded-full text-xs font-semibold', ok ? 'bg-[#EAF7EC] text-dashboard-success' : 'bg-[#FFF1F1] text-dashboard-danger')}>
    {children}
  </span>
)
