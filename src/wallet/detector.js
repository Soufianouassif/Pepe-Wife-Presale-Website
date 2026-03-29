import { WalletOperationError } from './errors';
import i18n from '../i18n/config';

/**
 * @typedef {'MetaMask'|'Phantom'|'Unknown'} DetectedWalletType
 */

/**
 * @param {any} candidate
 * @returns {boolean}
 */
const isEip1193Provider = (candidate) => Boolean(candidate && typeof candidate.request === 'function');

/**
 * @param {any} ethereum
 * @returns {any|null}
 */
const detectMetaMaskProvider = (ethereum) => {
  if (!ethereum) return null;
  if (Array.isArray(ethereum.providers)) {
    const provider = ethereum.providers.find((p) => isEip1193Provider(p) && p.isMetaMask);
    if (provider) return provider;
  }
  if (isEip1193Provider(ethereum) && ethereum.isMetaMask) {
    return ethereum;
  }
  return null;
};

/**
 * @param {Window & typeof globalThis} win
 * @returns {any|null}
 */
const detectPhantomProvider = (win) => {
  const phantom = win?.phantom?.solana;
  if (phantom && phantom.isPhantom && typeof phantom.connect === 'function') {
    return phantom;
  }
  const solana = win?.solana;
  if (solana && solana.isPhantom && typeof solana.connect === 'function') {
    return solana;
  }
  return null;
};

/**
 * Detects officially signed wallet providers.
 * @param {Window & typeof globalThis} [win]
 * @returns {{ MetaMask: any|null, Phantom: any|null }}
 */
export const detectWalletProviders = (win = window) => {
  return {
    MetaMask: detectMetaMaskProvider(win?.ethereum),
    Phantom: detectPhantomProvider(win)
  };
};

/**
 * Chooses wallet by priority and fallback.
 * @param {{ preferred?: 'MetaMask'|'Phantom', fallback?: 'MetaMask'|'Phantom', win?: Window & typeof globalThis }} [options]
 * @returns {{ walletType: 'MetaMask'|'Phantom', provider: any }}
 * @throws {WalletOperationError}
 */
export const selectWalletProvider = (options = {}) => {
  const preferred = options.preferred || 'MetaMask';
  const fallback = options.fallback || 'Phantom';
  const detected = detectWalletProviders(options.win);
  if (detected[preferred]) {
    return { walletType: preferred, provider: detected[preferred] };
  }
  if (detected[fallback]) {
    return { walletType: fallback, provider: detected[fallback] };
  }
  throw new WalletOperationError('No supported wallet detected.', {
    code: 'WALLET_NOT_FOUND',
    userMessage: i18n.t('wallet_errors.no_supported_wallet'),
    details: { preferred, fallback },
    retriable: false
  });
};
