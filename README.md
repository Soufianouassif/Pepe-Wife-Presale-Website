# Pepe-Wife-Presale-Website

## Solana SPL Token (Only Token Contract)

This repository now includes a script to issue a standard SPL token on Solana without building a custom on-chain program.

### Script

- `npm run token:create:solana`
- `npm run token:create:solana:check`

### Required Environment Variables

- `SOLANA_PAYER_KEYPAIR_PATH`: absolute path to your Solana keypair JSON

### Optional Environment Variables

- `SOLANA_RPC_URL` (default: devnet)
- `SOLANA_TOKEN_DECIMALS` (default: `9`)
- `SOLANA_TOKEN_INITIAL_SUPPLY` (default: `1000000`)
- `SOLANA_TOKEN_OWNER` (default: payer wallet)
- `SOLANA_DISABLE_FREEZE` (`true/false`, default: `false`)
- `SOLANA_REVOKE_MINT_AUTHORITY` (`true/false`, default: `false`)
- `SOLANA_REVOKE_FREEZE_AUTHORITY` (`true/false`, default: `false`)

### Example (PowerShell)

```powershell
$env:SOLANA_PAYER_KEYPAIR_PATH="C:\path\to\id.json"
$env:SOLANA_RPC_URL="https://api.devnet.solana.com"
$env:SOLANA_TOKEN_DECIMALS="9"
$env:SOLANA_TOKEN_INITIAL_SUPPLY="1000000"
$env:SOLANA_DISABLE_FREEZE="false"
$env:SOLANA_REVOKE_MINT_AUTHORITY="true"
$env:SOLANA_REVOKE_FREEZE_AUTHORITY="true"
npm run token:create:solana
```

The script prints a JSON result including `mintAddress`, recipient `tokenAccount`, and effective authority settings.

## Wallet Adapter Architecture

The wallet flow was refactored to a dedicated adapter layer:

- `src/wallet/detector.js`: strict provider detection for MetaMask and Phantom signatures.
- `src/wallet/adapters.js`: unified API (`connect`, `sign`, `sendTransaction`) with chain and address validation.
- `src/wallet/errors.js`: normalized wallet errors and bounded retry strategy.
- `src/context/WalletContext.jsx`: UI-facing orchestration, provider priority, session authorization, and event safety handling.

### Smart Priority

- Primary wallet: `MetaMask`
- Fallback wallet: `Phantom`
- Automatic fallback only when the preferred provider is unavailable.

### Security Controls

- Chain validation for EVM operations (default BSC `0x38`, configurable with `VITE_EVM_CHAIN_ID`).
- Address format validation for EVM and Solana.
- Session approval signature before finalizing connection.
- Disconnect on unsafe chain switch events.

### Unit Tests

- Run tests:

```bash
npm run test
```

- Covered cases:
  - no wallet
  - single wallet (MetaMask)
  - single wallet (Phantom)
  - both wallets with priority selection
  - user rejects connection
  - network switch during usage

### Performance Verification Checklist

- React render stability:
  - wallet context value is memoized to reduce unnecessary re-renders.
  - wallet callbacks use stable references.
- Lighthouse:

```bash
npm run build
npm run preview -- --host 127.0.0.1 --port 4173 --strictPort
npx lighthouse http://127.0.0.1:4173 --only-categories=performance --chrome-flags="--headless --no-sandbox"
```

- React DevTools:
  - verify `WalletProvider` updates only on real wallet/session changes.
  - verify no repeated mounts/unmounts in connect/disconnect loops.
