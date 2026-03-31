export const formatCompactNumber = (value) => {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return '0'
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 2
  }).format(parsed)
}

export const formatFullNumber = (value) => {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) return '0'
  return new Intl.NumberFormat('en-US').format(parsed)
}

export const formatTinyPrice = (value) => {
  const parsed = Number(value)
  if (!Number.isFinite(parsed)) {
    return { isTiny: false, normal: '0', zeroCount: 0, significant: '' }
  }
  if (Math.abs(parsed) >= 0.001 || parsed === 0) {
    return {
      isTiny: false,
      normal: parsed.toLocaleString('en-US', {
        minimumFractionDigits: parsed % 1 === 0 ? 0 : 2,
        maximumFractionDigits: 8
      }),
      zeroCount: 0,
      significant: ''
    }
  }
  const abs = Math.abs(parsed)
  const asString = abs.toFixed(20).replace(/0+$/, '')
  const decimal = asString.split('.')[1] || ''
  const firstNonZero = decimal.search(/[1-9]/)
  const zeroCount = firstNonZero >= 0 ? firstNonZero : 0
  const significant = decimal.slice(zeroCount, zeroCount + 4)
  return { isTiny: true, normal: '', zeroCount, significant }
}
