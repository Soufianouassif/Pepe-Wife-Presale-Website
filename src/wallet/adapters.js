import { PublicKey } from '@solana/web3.js';
import { WalletOperationError, normalizeWalletError, withRetry } from './errors';

/**
 * @typedef {'MetaMask'|'Phantom'|'Solana'} SupportedWallet
 */

/**
 * @param {string} address
 * @returns {boolean}
 */
export const isValidEvmAddress = (address) => /^0x[a-fA-F0-9]{40}$/.test(address || '');

/**
 * @param {string} address
 * @returns {boolean}
 */
export const isValidSolAddress = (address) => {
  try {
    if (!address || typeof address !== 'string') return false;
    new PublicKey(address);
    return true;
  } catch {
    return false;
  }
};

/**
 * @param {{ provider: any, walletType: SupportedWallet, expectedChainId?: string, retries?: number }} config
 */
export const createWalletAdapter = (config) => {
  if (!config?.provider || !config?.walletType) {
    throw new WalletOperationError('Wallet adapter configuration is invalid.', {
      code: 'ADAPTER_CONFIG_INVALID',
      userMessage: 'تهيئة المحفظة غير صالحة.',
      retriable: false
    });
  }
  if (config.walletType === 'MetaMask') {
    return createEvmAdapter(config);
  }
  if (config.walletType === 'Phantom' || config.walletType === 'Solana') {
    return createPhantomAdapter(config);
  }
  throw new WalletOperationError('Unsupported wallet type.', {
    code: 'WALLET_TYPE_UNSUPPORTED',
    userMessage: 'نوع المحفظة غير مدعوم.',
    retriable: false
  });
};

/**
 * @param {{ provider: any, walletType: 'MetaMask', expectedChainId?: string, retries?: number }} config
 */
const createEvmAdapter = (config) => {
  const retries = typeof config.retries === 'number' ? config.retries : 1;
  const expectedChainId = config.expectedChainId || '0x38';
  const provider = config.provider;
  const adapter = {
    walletType: 'MetaMask',
    provider,
    async ensureChain() {
      const chainId = await provider.request({ method: 'eth_chainId' });
      if (expectedChainId && chainId !== expectedChainId) {
        throw new WalletOperationError(`Unexpected chain id: ${chainId}`, {
          code: 'CHAIN_MISMATCH',
          userMessage: 'الشبكة الحالية غير صحيحة. يرجى التبديل إلى الشبكة المطلوبة.',
          details: { expectedChainId, currentChainId: chainId },
          retriable: false
        });
      }
      return chainId;
    },
    async connect() {
      return withRetry(async () => {
        const accounts = await provider.request({ method: 'eth_requestAccounts' });
        const account = Array.isArray(accounts) ? accounts[0] : null;
        if (!isValidEvmAddress(account)) {
          throw new WalletOperationError('Invalid EVM address.', {
            code: 'ADDRESS_INVALID',
            userMessage: 'عنوان المحفظة غير صالح.',
            retriable: false
          });
        }
        await adapter.ensureChain();
        return account;
      }, {
        retries,
        shouldRetry: (error) => error.retriable && error.code !== 'CHAIN_MISMATCH'
      });
    },
    async sign(message, address) {
      return withRetry(async () => {
        if (!message || typeof message !== 'string') {
          throw new WalletOperationError('Message is required for signing.', {
            code: 'SIGN_MESSAGE_INVALID',
            userMessage: 'الرسالة المطلوبة للتوقيع غير صالحة.',
            retriable: false
          });
        }
        if (!isValidEvmAddress(address)) {
          throw new WalletOperationError('Address is invalid for signing.', {
            code: 'ADDRESS_INVALID',
            userMessage: 'عنوان المحفظة غير صالح.',
            retriable: false
          });
        }
        await adapter.ensureChain();
        return provider.request({ method: 'personal_sign', params: [message, address] });
      }, { retries });
    },
    async sendTransaction(transaction, address) {
      return withRetry(async () => {
        if (!transaction || typeof transaction !== 'object') {
          throw new WalletOperationError('Transaction payload is invalid.', {
            code: 'TRANSACTION_INVALID',
            userMessage: 'بيانات المعاملة غير صالحة.',
            retriable: false
          });
        }
        if (transaction.from && transaction.from.toLowerCase() !== String(address).toLowerCase()) {
          throw new WalletOperationError('Transaction sender mismatch.', {
            code: 'TRANSACTION_SENDER_MISMATCH',
            userMessage: 'عنوان المرسل لا يطابق المحفظة المتصلة.',
            retriable: false
          });
        }
        await adapter.ensureChain();
        return provider.request({ method: 'eth_sendTransaction', params: [transaction] });
      }, { retries });
    }
  };
  return adapter;
};

/**
 * @param {{ provider: any, walletType: 'Phantom'|'Solana', retries?: number }} config
 */
const createPhantomAdapter = (config) => {
  const retries = typeof config.retries === 'number' ? config.retries : 1;
  const provider = config.provider;
  return {
    walletType: config.walletType,
    provider,
    async connect() {
      return withRetry(async () => {
        const response = await provider.connect();
        const address = response?.publicKey?.toString?.() || provider?.publicKey?.toString?.();
        if (!isValidSolAddress(address)) {
          throw new WalletOperationError('Invalid Solana address.', {
            code: 'ADDRESS_INVALID',
            userMessage: 'عنوان المحفظة غير صالح.',
            retriable: false
          });
        }
        return address;
      }, { retries });
    },
    async sign(message) {
      return withRetry(async () => {
        if (!message || typeof message !== 'string') {
          throw new WalletOperationError('Message is required for signing.', {
            code: 'SIGN_MESSAGE_INVALID',
            userMessage: 'الرسالة المطلوبة للتوقيع غير صالحة.',
            retriable: false
          });
        }
        const encoded = new TextEncoder().encode(message);
        if (typeof provider.signMessage === 'function') {
          const signed = await provider.signMessage(encoded);
          return signed?.signature || signed;
        }
        if (typeof provider.request === 'function') {
          return provider.request({
            method: 'solana_signMessage',
            params: { message: Array.from(encoded) }
          });
        }
        throw new WalletOperationError('Signing not supported on provider.', {
          code: 'SIGN_UNSUPPORTED',
          userMessage: 'المحفظة لا تدعم عملية التوقيع.',
          retriable: false
        });
      }, { retries });
    },
    async sendTransaction(transaction) {
      return withRetry(async () => {
        if (!transaction || typeof transaction !== 'object') {
          throw new WalletOperationError('Transaction payload is invalid.', {
            code: 'TRANSACTION_INVALID',
            userMessage: 'بيانات المعاملة غير صالحة.',
            retriable: false
          });
        }
        if (typeof provider.request !== 'function') {
          throw new WalletOperationError('Provider does not support transaction requests.', {
            code: 'TRANSACTION_UNSUPPORTED',
            userMessage: 'المحفظة لا تدعم إرسال المعاملة.',
            retriable: false
          });
        }
        return provider.request({
          method: 'solana_signAndSendTransaction',
          params: { transaction }
        });
      }, { retries });
    }
  };
};

/**
 * @param {unknown} error
 * @param {string} operation
 * @returns {WalletOperationError}
 */
export const handleWalletAdapterError = (error, operation) => {
  return normalizeWalletError(error, 'WALLET_ADAPTER_ERROR', `فشل تنفيذ عملية ${operation} على المحفظة.`);
};
