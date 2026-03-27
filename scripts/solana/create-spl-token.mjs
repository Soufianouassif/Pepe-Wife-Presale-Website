import fs from 'node:fs/promises';
import process from 'node:process';
import { Connection, Keypair, PublicKey, clusterApiUrl } from '@solana/web3.js';
import {
  createMint,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  setAuthority,
  AuthorityType
} from '@solana/spl-token';

const args = new Set(process.argv.slice(2));
const isCheck = args.has('--check');

const readBool = (value, fallback = false) => {
  if (typeof value !== 'string') return fallback;
  const normalized = value.trim().toLowerCase();
  if (['1', 'true', 'yes', 'y', 'on'].includes(normalized)) return true;
  if (['0', 'false', 'no', 'n', 'off'].includes(normalized)) return false;
  return fallback;
};

const parseUnits = (amount, decimals) => {
  const raw = String(amount ?? '').trim();
  if (!raw) throw new Error('TOKEN_INITIAL_SUPPLY is required.');
  if (!/^\d+(\.\d+)?$/.test(raw)) {
    throw new Error('TOKEN_INITIAL_SUPPLY must be a positive numeric string.');
  }
  const [whole = '0', fraction = ''] = raw.split('.');
  if (fraction.length > decimals) {
    throw new Error(`TOKEN_INITIAL_SUPPLY supports up to ${decimals} decimal places.`);
  }
  const paddedFraction = fraction.padEnd(decimals, '0');
  const units = `${whole}${paddedFraction}`.replace(/^0+(?=\d)/, '');
  return BigInt(units || '0');
};

const parseKeypairFromFile = async (filePath) => {
  const raw = await fs.readFile(filePath, 'utf8');
  const parsed = JSON.parse(raw);
  const secret = Array.isArray(parsed) ? parsed : parsed?.secretKey;
  if (!Array.isArray(secret)) {
    throw new Error('Invalid keypair file format.');
  }
  return Keypair.fromSecretKey(Uint8Array.from(secret));
};

const rpcUrl = process.env.SOLANA_RPC_URL || clusterApiUrl('devnet');
const payerKeyPath = process.env.SOLANA_PAYER_KEYPAIR_PATH || '';
const recipientOwnerRaw = process.env.SOLANA_TOKEN_OWNER || '';
const decimals = Number.parseInt(process.env.SOLANA_TOKEN_DECIMALS || '9', 10);
const initialSupply = process.env.SOLANA_TOKEN_INITIAL_SUPPLY || '1000000';
const disableFreeze = readBool(process.env.SOLANA_DISABLE_FREEZE, false);
const revokeMintAuthority = readBool(process.env.SOLANA_REVOKE_MINT_AUTHORITY, false);
const revokeFreezeAuthority = readBool(process.env.SOLANA_REVOKE_FREEZE_AUTHORITY, false);

if (!Number.isInteger(decimals) || decimals < 0 || decimals > 9) {
  throw new Error('SOLANA_TOKEN_DECIMALS must be an integer between 0 and 9.');
}

if (isCheck) {
  const units = parseUnits(initialSupply, decimals).toString();
  const payload = {
    check: true,
    rpcUrl,
    decimals,
    initialSupply,
    initialSupplyBaseUnits: units,
    requiresPayerKeypairPath: !payerKeyPath
  };
  process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
  process.exit(0);
}

if (!payerKeyPath) {
  throw new Error('Set SOLANA_PAYER_KEYPAIR_PATH before running token creation.');
}

const run = async () => {
  const connection = new Connection(rpcUrl, 'confirmed');
  const payer = await parseKeypairFromFile(payerKeyPath);
  const recipientOwner = recipientOwnerRaw ? new PublicKey(recipientOwnerRaw) : payer.publicKey;
  const freezeAuthority = disableFreeze ? null : payer.publicKey;
  const supplyUnits = parseUnits(initialSupply, decimals);

  const mint = await createMint(
    connection,
    payer,
    payer.publicKey,
    freezeAuthority,
    decimals
  );

  const tokenAccount = await getOrCreateAssociatedTokenAccount(
    connection,
    payer,
    mint,
    recipientOwner
  );

  await mintTo(
    connection,
    payer,
    mint,
    tokenAccount.address,
    payer.publicKey,
    supplyUnits
  );

  if (revokeMintAuthority) {
    await setAuthority(
      connection,
      payer,
      mint,
      payer.publicKey,
      AuthorityType.MintTokens,
      null
    );
  }

  if (revokeFreezeAuthority && !disableFreeze) {
    await setAuthority(
      connection,
      payer,
      mint,
      payer.publicKey,
      AuthorityType.FreezeAccount,
      null
    );
  }

  const result = {
    ok: true,
    network: rpcUrl,
    mintAddress: mint.toBase58(),
    ownerAddress: recipientOwner.toBase58(),
    tokenAccount: tokenAccount.address.toBase58(),
    decimals,
    initialSupply,
    initialSupplyBaseUnits: supplyUnits.toString(),
    freezeAuthority: disableFreeze ? null : payer.publicKey.toBase58(),
    mintAuthorityRevoked: revokeMintAuthority,
    freezeAuthorityRevoked: revokeFreezeAuthority && !disableFreeze
  };

  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
};

run().catch((error) => {
  process.stderr.write(`${error?.message || String(error)}\n`);
  process.exit(1);
});
