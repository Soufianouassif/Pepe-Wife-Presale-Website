const TOKEN_PRICE_USD_FALLBACK = 0.00012
const TOTAL_SUPPLY = 1_000_000_000
const PRESALE_AVAILABLE = 400_000_000

const withTimeout = async (promise, ms = 5000) => {
  let timer
  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error('timeout')), ms)
      })
    ])
  } finally {
    clearTimeout(timer)
  }
}

export const getDashboardStats = async () => {
  try {
    const response = await withTimeout(
      fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana,tether&vs_currencies=usd'),
      6000
    )
    const prices = await response.json()
    const solUsd = Number(prices?.solana?.usd || 185)
    const usdtUsd = Number(prices?.tether?.usd || 1)
    const tokenPriceUsd = TOKEN_PRICE_USD_FALLBACK
    return {
      tokenPriceUsd,
      totalSupply: TOTAL_SUPPLY,
      presaleAvailable: PRESALE_AVAILABLE,
      marketCapUsd: tokenPriceUsd * TOTAL_SUPPLY,
      liquidityUsd: 2_450_000,
      holders: 12489,
      solUsd,
      usdtUsd
    }
  } catch {
    return {
      tokenPriceUsd: TOKEN_PRICE_USD_FALLBACK,
      totalSupply: TOTAL_SUPPLY,
      presaleAvailable: PRESALE_AVAILABLE,
      marketCapUsd: TOKEN_PRICE_USD_FALLBACK * TOTAL_SUPPLY,
      liquidityUsd: 2_450_000,
      holders: 12489,
      solUsd: 185,
      usdtUsd: 1
    }
  }
}

export const submitPresaleIntent = async (payload) => {
  const amount = Number(payload?.tokenAmount || 0)
  if (!payload?.address || amount <= 0) {
    throw new Error('invalid_payload')
  }
  await new Promise((resolve) => setTimeout(resolve, 1200))
  return {
    status: 'ok',
    intentId: `intent_${Date.now()}`,
    createdAt: new Date().toISOString()
  }
}
