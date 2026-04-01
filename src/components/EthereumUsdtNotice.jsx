import React from 'react'
import { useTranslation } from 'react-i18next'
import { AlertTriangle } from 'lucide-react'
import { USDT_NETWORK_NOTICE } from '../constants/projectConstants'

const EthereumUsdtNotice = ({ className = '' }) => {
  const { t } = useTranslation()
  return (
    <div className={`rounded-2xl border-2 border-amber-500 bg-amber-50 text-amber-900 p-3 ${className}`}>
      <div className="flex items-start gap-2">
        <AlertTriangle className="text-amber-700 mt-0.5" size={18} />
        <div className="space-y-1">
          <p className="text-xs font-black uppercase">{t('usdt_notice.title')}</p>
          <p className="text-xs font-bold">
            {t('usdt_notice.desc', { network: USDT_NETWORK_NOTICE.network, gas: USDT_NETWORK_NOTICE.gasFeeRange })}
          </p>
        </div>
      </div>
    </div>
  )
}

export default EthereumUsdtNotice
