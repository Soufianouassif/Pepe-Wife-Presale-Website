# Dashboard Smart Contract Integration

## Current State

- Dashboard buy flow validates wallet type and address.
- Dashboard requires wallet signature before confirming buy intent.
- Buy intents are submitted to `src/services/dashboardApi.js` as a temporary API layer.

## Required Environment Variables

- `VITE_SUPPORT_URL`: support chat or ticket URL
- `VITE_PRESALE_SOL_RECIPIENT`: Solana recipient wallet
- `VITE_PRESALE_EVM_RECIPIENT`: EVM recipient wallet
- `VITE_USDT_CONTRACT_ADDRESS`: USDT token contract address (if different from mainnet default)

## Contract Wiring Plan

1. Add backend endpoint to create signed quote and nonce.
2. Verify wallet signature server-side before creating order record.
3. For Solana purchases:
   - build transaction server-side or client-side with verified recipient
   - submit signed transaction hash
4. For USDT on Ethereum:
   - call ERC20 `approve` then presale contract `buyWithUSDT`
   - verify receipt status and emitted event
5. Confirm order on backend only after on-chain receipt success.

## Security Checklist

- Reject mismatched chain IDs.
- Reject invalid addresses and zero/negative amounts.
- Enforce nonce and expiration for each signed payload.
- Store order logs with wallet, signature, hash, and timestamp.
- Disable buy button while transaction is pending.
