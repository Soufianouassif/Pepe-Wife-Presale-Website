import React from 'react'

const cn = (...classes) => classes.filter(Boolean).join(' ')

export const AppShell = ({ children }) => (
  <div
    className="min-h-screen text-[#123126] relative"
    style={{
      backgroundImage: "linear-gradient(rgba(245,251,247,0.78), rgba(245,251,247,0.78)), url('/assets/bab.png')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
      backgroundAttachment: 'fixed'
    }}
  >
    {children}
  </div>
)

export const PageContainer = ({ children, className = '' }) => (
  <div className={cn('px-4 lg:px-8', className)}>{children}</div>
)

export const Navbar = ({ children }) => (
  <header className="sticky top-0 z-40 border border-[#d7e7dd] bg-white/75 backdrop-blur-md rounded-b-2xl shadow-[0_4px_16px_rgba(16,72,47,0.06)]">
    {children}
  </header>
)

export const Sidebar = ({ children }) => (
  <div className="h-full rounded-3xl border border-[#cfe3d5] bg-white/58 backdrop-blur-md p-4 shadow-[0_6px_20px_rgba(16,72,47,0.05)]">
    {children}
  </div>
)

export const SidebarItem = ({ active, children, disabled, right }) => (
  <div
    className={cn(
      'w-full flex items-center justify-between p-3 rounded-xl border transition-all',
      active
        ? 'bg-gradient-to-r from-[#1fa767] to-[#0f7a4d] text-white border-transparent shadow-[0_6px_14px_rgba(16,122,77,0.18)]'
        : 'border-[#d7e7dd] text-[#123126] bg-white/78',
      disabled && 'opacity-60'
    )}
  >
    {children}
    {right}
  </div>
)

export const ContentSection = ({ children, className = '' }) => (
  <section className={cn('rounded-3xl border border-[#d6e8dc] bg-white/90 p-6 shadow-[0_8px_22px_rgba(15,122,77,0.06)]', className)}>
    {children}
  </section>
)

export const SectionHeader = ({ title, right }) => (
  <div className="flex items-center justify-between gap-3 mb-4">
    <h3 className="text-2xl font-black tracking-tight">{title}</h3>
    {right}
  </div>
)

export const Card = ({ children, className = '' }) => (
  <div className={cn('rounded-2xl border border-[#d7e7dd] bg-white p-4', className)}>{children}</div>
)

export const GlassCard = ({ children, className = '' }) => (
  <div className={cn('rounded-2xl border border-white/60 bg-white/55 backdrop-blur-md p-4 shadow-[0_6px_16px_rgba(16,72,47,0.05)]', className)}>{children}</div>
)

export const StatsCard = ({ label, value, hint }) => (
  <Card>
    <p className="text-xs font-black opacity-60">{label}</p>
    <p className="text-3xl font-black mt-1 text-[#0f7a4d]">{value}</p>
    {hint ? <p className="text-[11px] font-black opacity-60 mt-1">{hint}</p> : null}
  </Card>
)

export const Button = ({ children, className = '', ...props }) => (
  <button {...props} className={cn('h-11 px-4 rounded-xl border font-black transition-all', className)}>
    {children}
  </button>
)

export const PrimaryButton = ({ children, className = '', ...props }) => (
  <Button
    {...props}
    className={cn('bg-gradient-to-r from-[#42c96f] to-[#0f7a4d] text-white border-transparent shadow-[0_8px_18px_rgba(16,122,77,0.16)] hover:brightness-105', className)}
  >
    {children}
  </Button>
)

export const SecondaryButton = ({ children, className = '', ...props }) => (
  <Button {...props} className={cn('bg-white border-[#d7e7dd] text-[#123126] hover:bg-[#f4faf6]', className)}>
    {children}
  </Button>
)

export const Input = (props) => (
  <input
    {...props}
    className={cn(
      'w-full h-12 rounded-xl border border-[#d7e7dd] bg-white px-4 font-bold text-[#123126] focus:ring-2 focus:ring-[#93d8b4] outline-none',
      props.className
    )}
  />
)

export const CopyInput = ({ value, onCopy, copyLabel = 'Copy' }) => (
  <div className="flex items-center gap-2 rounded-xl border border-[#d7e7dd] bg-white p-2">
    <input value={value} readOnly className="flex-1 bg-transparent outline-none font-black text-sm text-[#123126]" />
    <SecondaryButton onClick={onCopy} className="h-9 px-3 text-xs">
      {copyLabel}
    </SecondaryButton>
  </div>
)

export const ProgressCard = ({ title, value, children }) => (
  <ContentSection>
    <SectionHeader title={title} />
    <div className="h-5 rounded-full bg-[#e8f6ee] border border-[#cfe9db] overflow-hidden">
      <div className="h-full bg-gradient-to-r from-[#4ecb73] to-[#0f7a4d]" style={{ width: `${value}%` }} />
    </div>
    {children}
  </ContentSection>
)

export const TableCard = ({ title, children }) => (
  <ContentSection>
    <SectionHeader title={title} />
    {children}
  </ContentSection>
)

export const EmptyState = ({ title, subtitle }) => (
  <ContentSection className="text-center">
    <p className="text-3xl font-black">{title}</p>
    <p className="text-sm font-bold opacity-70 mt-2">{subtitle}</p>
  </ContentSection>
)

export const Badge = ({ children, className = '' }) => (
  <span className={cn('text-[10px] px-2 py-0.5 rounded-full bg-[#e8f8ee] text-[#0f7a4d] font-black', className)}>{children}</span>
)

export const StatusPill = ({ children, ok = true }) => (
  <span className={cn('px-2.5 py-1 rounded-full text-xs font-black', ok ? 'bg-[#e8f8ee] text-[#0f7a4d]' : 'bg-[#fff0f0] text-[#b42318]')}>
    {children}
  </span>
)
