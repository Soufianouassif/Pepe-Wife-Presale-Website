import { PAYMENT_LIMITS } from '../constants/projectConstants'

export const getPaymentRange = (currency) => PAYMENT_LIMITS[currency] || { min: 1, max: 50 }

export const validatePaymentAmount = (value, currency) => {
  const { min, max } = getPaymentRange(currency)
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return { valid: false, min, max, reason: 'nan' }
  if (parsed < min) return { valid: false, min, max, reason: 'min' }
  if (parsed > max) return { valid: false, min, max, reason: 'max' }
  return { valid: true, min, max, reason: null }
}

export const clampPaymentAmount = (value, currency) => {
  const { min, max } = getPaymentRange(currency)
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return ''
  return String(Math.max(min, Math.min(max, parsed)))
}
