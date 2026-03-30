const compactNumberFormatter = new Intl.NumberFormat('en-US', {
  notation: 'compact',
  maximumFractionDigits: 2
})

const superscriptMap = {
  0: '⁰',
  1: '¹',
  2: '²',
  3: '³',
  4: '⁴',
  5: '⁵',
  6: '⁶',
  7: '⁷',
  8: '⁸',
  9: '⁹'
}

const toNumber = (value) => {
  const normalized = typeof value === 'string' ? value.trim() : value
  const num = Number(normalized)
  return Number.isFinite(num) ? num : null
}

const toPlainDecimal = (value) => {
  if (!Number.isFinite(value)) return ''
  if (value === 0) return '0'
  const abs = Math.abs(value)
  if (!String(abs).includes('e')) return String(abs)
  return abs.toFixed(20).replace(/\.?0+$/, '')
}

const toSuperscript = (value) => String(value).split('').map((digit) => superscriptMap[digit] ?? '').join('')

export const formatCompactNumber = (value) => {
  const numberValue = toNumber(value)
  if (numberValue === null) return '--'
  return compactNumberFormatter.format(numberValue)
}

export const formatFullNumber = (value, options = {}) => {
  const numberValue = toNumber(value)
  if (numberValue === null) return '--'
  return new Intl.NumberFormat('en-US', options).format(numberValue)
}

export const formatSmallPrice = (value, options = {}) => {
  const numberValue = toNumber(value)
  if (numberValue === null) return null
  const absolute = Math.abs(numberValue)
  if (absolute === 0 || absolute >= 0.001) return null

  const decimalString = toPlainDecimal(absolute)
  const [, fractional = ''] = decimalString.split('.')
  if (!fractional) return null

  let zeroCount = 0
  while (zeroCount < fractional.length && fractional[zeroCount] === '0') zeroCount += 1
  const significantRaw = fractional.slice(zeroCount).replace(/0+$/, '')
  const maxSignificantDigits = options.maxSignificantDigits ?? 6
  const significantDigits = (significantRaw || '0').slice(0, maxSignificantDigits)

  return {
    sign: numberValue < 0 ? '-' : '',
    base: '0.0',
    zeroCount,
    zeroCountSuperscript: toSuperscript(zeroCount),
    significantDigits
  }
}

export const formatDisplayPrice = (value, options = {}) => {
  const numberValue = toNumber(value)
  if (numberValue === null) return { type: 'normal', text: '--' }
  const small = formatSmallPrice(numberValue, options.smallPriceOptions)
  if (small) return { type: 'small', ...small }
  return {
    type: 'normal',
    text: formatFullNumber(numberValue, {
      minimumFractionDigits: options.minimumFractionDigits ?? 0,
      maximumFractionDigits: options.maximumFractionDigits ?? (Math.abs(numberValue) < 1 ? 6 : 2)
    })
  }
}
