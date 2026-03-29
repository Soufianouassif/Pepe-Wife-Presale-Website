import React from 'react'
import { useTranslation } from 'react-i18next'

const SIZE_CLASSES = {
  sm: {
    icon: 'w-8 h-8',
    name: 'text-base',
    symbol: 'text-[9px]'
  },
  md: {
    icon: 'w-10 h-10',
    name: 'text-xl',
    symbol: 'text-[10px]'
  },
  lg: {
    icon: 'w-12 h-12',
    name: 'text-2xl',
    symbol: 'text-xs'
  }
}

const BrandLogo = ({
  size = 'md',
  className = '',
  nameClassName = 'text-pepe-black',
  symbolClassName = 'text-pepe-black/70',
  showSymbol = true
}) => {
  const { t } = useTranslation()
  const [first, second] = t('brand.name').split(' ')
  const scale = SIZE_CLASSES[size] || SIZE_CLASSES.md

  return (
    <div className={`flex items-center gap-2 min-w-0 ${className}`}>
      <img src="/assets/hero-character.png" alt={t('brand.name')} className={`${scale.icon} object-contain shrink-0`} />
      <div className="flex flex-col justify-center min-w-0 leading-none">
        <span className={`font-brand font-black tracking-tight truncate ${scale.name} ${nameClassName}`}>
          {first || 'Pepe'}<span className="text-pepe-pink">{second || 'Wife'}</span>
        </span>
        {showSymbol && (
          <span className={`font-brand font-bold uppercase tracking-wider ${scale.symbol} ${symbolClassName}`}>
            {t('brand.symbol')}
          </span>
        )}
      </div>
    </div>
  )
}

export default BrandLogo
