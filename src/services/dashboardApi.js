import { CURRENT_TOKEN_PRICE_USD, TOTAL_PRESALE_SUPPLY, CURRENT_PHASE_SUPPLY, PRESALE_CONFIG } from '../presaleConfig'

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
    const tokenPriceUsd = CURRENT_TOKEN_PRICE_USD
    return {
      tokenPriceUsd,
      totalSupply: TOTAL_PRESALE_SUPPLY,
      presaleAvailable: CURRENT_PHASE_SUPPLY,
      marketCapUsd: tokenPriceUsd * TOTAL_PRESALE_SUPPLY,
      liquidityUsd: 2_450_000,
      holders: 12489,
      solUsd,
      usdtUsd,
      currentPhase: PRESALE_CONFIG.currentPhase.id,
      totalPhases: PRESALE_CONFIG.totalPhases
    }
  } catch {
    return {
      tokenPriceUsd: CURRENT_TOKEN_PRICE_USD,
      totalSupply: TOTAL_PRESALE_SUPPLY,
      presaleAvailable: CURRENT_PHASE_SUPPLY,
      marketCapUsd: CURRENT_TOKEN_PRICE_USD * TOTAL_PRESALE_SUPPLY,
      liquidityUsd: 2_450_000,
      holders: 12489,
      solUsd: 185,
      usdtUsd: 1,
      currentPhase: PRESALE_CONFIG.currentPhase.id,
      totalPhases: PRESALE_CONFIG.totalPhases
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
