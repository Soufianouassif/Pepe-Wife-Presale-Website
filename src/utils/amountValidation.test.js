import { describe, expect, it } from 'vitest'
import { clampPaymentAmount, getPaymentRange, validatePaymentAmount } from './amountValidation'

describe('amount validation unit', () => {
  it('returns SOL range limits', () => {
    expect(getPaymentRange('SOL')).toEqual({ min: 1, max: 50 })
  })

  it('returns USDT range limits', () => {
    expect(getPaymentRange('USDT')).toEqual({ min: 1, max: 10000 })
  })

  it('rejects SOL amount below min', () => {
    const result = validatePaymentAmount(0.5, 'SOL')
    expect(result.valid).toBe(false)
    expect(result.reason).toBe('min')
  })

  it('rejects USDT amount above max', () => {
    const result = validatePaymentAmount(20000, 'USDT')
    expect(result.valid).toBe(false)
    expect(result.reason).toBe('max')
  })

  it('accepts valid USDT amount', () => {
    const result = validatePaymentAmount(500, 'USDT')
    expect(result.valid).toBe(true)
  })
})

describe('amount validation integration', () => {
  it('clamps SOL input to hard range', () => {
    expect(clampPaymentAmount(80, 'SOL')).toBe('50')
    expect(clampPaymentAmount(0, 'SOL')).toBe('1')
  })

  it('clamps USDT input to hard range', () => {
    expect(clampPaymentAmount(15000, 'USDT')).toBe('10000')
    expect(clampPaymentAmount(-2, 'USDT')).toBe('1')
  })
})
