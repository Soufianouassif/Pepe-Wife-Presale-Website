export const PRESALE_CONFIG = {
  totalPhases: 3,
  currentPhase: {
    id: 1,
    supply: 2_000_000_000_000,
    priceUsd: 0.00000005
  }
}

export const CURRENT_TOKEN_PRICE_USD = PRESALE_CONFIG.currentPhase.priceUsd
export const CURRENT_PHASE_SUPPLY = PRESALE_CONFIG.currentPhase.supply
export const TOTAL_PRESALE_SUPPLY = PRESALE_CONFIG.currentPhase.supply * PRESALE_CONFIG.totalPhases
export const TOKENS_PER_USDT = Math.floor(1 / CURRENT_TOKEN_PRICE_USD)
