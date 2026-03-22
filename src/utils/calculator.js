/**
 * Calculator utility functions for crypto profit/loss analysis
 */

export const calculateProfit = (amount, buyPrice, sellPrice, feePercent = 0) => {
  // Input validation
  const numAmount = parseFloat(amount);
  const numBuyPrice = parseFloat(buyPrice);
  const numSellPrice = parseFloat(sellPrice);
  const numFee = parseFloat(feePercent);

  if (isNaN(numAmount) || numAmount <= 0) return { error: 'invalid_amount' };
  if (isNaN(numBuyPrice) || numBuyPrice <= 0) return { error: 'invalid_buy_price' };
  if (isNaN(numSellPrice) || numSellPrice <= 0) return { error: 'invalid_sell_price' };
  if (isNaN(numFee) || numFee < 0) return { error: 'invalid_fee' };

  // Assume numAmount is the Investment in USDT
  const initialInvestment = numAmount;
  const tokensBought = numAmount / numBuyPrice;
  const rawRevenue = tokensBought * numSellPrice;
  
  // Fee is applied to the total transaction volume (buy + sell)
  const totalFees = (rawRevenue + initialInvestment) * (numFee / 100);
  const netRevenue = rawRevenue - totalFees;
  
  const profit = netRevenue - initialInvestment;
  const roi = (profit / initialInvestment) * 100;

  return {
    initialInvestment: initialInvestment.toFixed(2),
    tokensBought: tokensBought.toFixed(0), // Tokens usually displayed as integers if high supply
    netRevenue: netRevenue.toFixed(2),
    profit: profit.toFixed(2),
    roi: roi.toFixed(2),
    isProfit: profit >= 0
  };
};
