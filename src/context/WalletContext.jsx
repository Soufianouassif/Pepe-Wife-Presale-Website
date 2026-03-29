import React, { createContext, useState, useEffect, useContext, useRef, useCallback, useMemo } from 'react';
import { useLogin, usePrivy } from '@privy-io/react-auth';
import { detectWalletProviders, selectWalletProvider } from '../wallet/detector';
import { createWalletAdapter, handleWalletAdapterError, isValidEvmAddress, isValidSolAddress } from '../wallet/adapters';
import { WalletOperationError } from '../wallet/errors';

const WalletContext = createContext();
const WALLETCONNECT_PROJECT_ID = "90be08cc5b7174d4051d2de451af0d9b";
const DEFAULT_EVM_CHAIN_ID = import.meta?.env?.VITE_EVM_CHAIN_ID || '0x1';
const ALLOWED_EVM_CHAIN_IDS = new Set(['0x1', '0x38', '0xaa36a7']);
const EVM_CHAIN_PARAMS = {
  '0x1': {
    chainId: '0x1',
    chainName: 'Ethereum Mainnet',
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://rpc.ankr.com/eth'],
    blockExplorerUrls: ['https://etherscan.io']
  },
  '0x38': {
    chainId: '0x38',
    chainName: 'BNB Smart Chain',
    nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
    rpcUrls: ['https://bsc-dataseed.binance.org'],
    blockExplorerUrls: ['https://bscscan.com']
  },
  '0xaa36a7': {
    chainId: '0xaa36a7',
    chainName: 'Sepolia',
    nativeCurrency: { name: 'Sepolia Ether', symbol: 'ETH', decimals: 18 },
    rpcUrls: ['https://rpc.sepolia.org'],
    blockExplorerUrls: ['https://sepolia.etherscan.io']
  }
};

const STORAGE_KEYS = {
  connected: 'walletConnected',
  address: 'walletAddress',
  type: 'walletType',
  explicitLogout: 'explicit_logout',
};

const SOLANA_WALLET_TYPES = new Set(['Social', 'Phantom', 'Solflare', 'Backpack', 'OKX', 'Trust Wallet']);
const EVM_WALLET_TYPES = new Set(['MetaMask', 'Binance', 'Coinbase', 'WalletConnect']);
const SOCIAL_LOGIN_PROVIDERS = new Set(['google', 'twitter', 'telegram', 'email_passwordless']);
const SOCIAL_FLOW_TIMEOUT_MS = 30000;

/**
 * Wallet provider that exposes unified wallet operations for UI and business logic.
 * @param {{ children: React.ReactNode }} props
 */
export const WalletProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState('');
  const [walletType, setWalletType] = useState('');
  const [provider, setProvider] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [activeChainId, setActiveChainId] = useState('');
  const [requiredEvmChainId, setRequiredEvmChainIdState] = useState(DEFAULT_EVM_CHAIN_ID);

  const { ready: privyReady, user: privyUser, logout: privyLogout } = usePrivy();
  const { login: privyLogin } = useLogin();

  const privyUserRef = useRef(null);
  const adapterRef = useRef(null);
  const providerRef = useRef(null);
  const walletTypeRef = useRef('');

  useEffect(() => {
    privyUserRef.current = privyUser || null;
  }, [privyUser]);

  /**
   * @param {'info'|'warn'|'error'} level
   * @param {string} message
   * @param {unknown} [payload]
   */
  const logWallet = useCallback((level, message, payload) => {
    const logger = level === 'error' ? console.error : level === 'warn' ? console.warn : console.info;
    if (typeof payload === 'undefined') {
      logger(`[Wallet] ${message}`);
      return;
    }
    logger(`[Wallet] ${message}`, payload);
  }, []);

  const withTimeout = useCallback(async (promise, ms, userMessage) => {
    let timer = null;
    try {
      return await Promise.race([
        promise,
        new Promise((_, reject) => {
          timer = setTimeout(() => {
            reject(new WalletOperationError('Operation timed out.', {
              code: 'OPERATION_TIMEOUT',
              userMessage,
              retriable: true
            }));
          }, ms);
        })
      ]);
    } finally {
      if (timer) clearTimeout(timer);
    }
  }, []);

  const normalizeSocialAccount = useCallback((value) => {
    if (!value) return null;
    if (typeof value === 'string') {
      const trimmed = value.trim();
      return trimmed || null;
    }
    if (typeof value === 'object') {
      const fromAddress = typeof value.address === 'string' ? value.address.trim() : '';
      if (fromAddress) return fromAddress;
      const fromPublicKeyString = typeof value.publicKey === 'string' ? value.publicKey.trim() : '';
      if (fromPublicKeyString) return fromPublicKeyString;
      if (value.publicKey?.toBase58) {
        const base58 = value.publicKey.toBase58();
        if (typeof base58 === 'string' && base58.trim()) return base58.trim();
      }
      if (value.publicKey?.toString) {
        const key = value.publicKey.toString();
        if (typeof key === 'string' && key.trim() && key !== '[object Object]') return key.trim();
      }
      if (value.toBase58) {
        const base58 = value.toBase58();
        if (typeof base58 === 'string' && base58.trim()) return base58.trim();
      }
      if (value.toString) {
        const asString = value.toString();
        if (typeof asString === 'string' && asString.trim() && asString !== '[object Object]') return asString.trim();
      }
    }
    return null;
  }, []);

  const resolveSocialAccount = useCallback(async (socialProvider) => {
    if (!socialProvider) return null;
    const requestMethods = ['solana_getAccounts', 'solana_accounts', 'solana_requestAccounts'];
    for (const method of requestMethods) {
      try {
        const response = await withTimeout(
          socialProvider.request({ method }),
          12000,
          'تعذر قراءة حسابات المحفظة الاجتماعية.'
        );
        const items = Array.isArray(response) ? response : [response];
        for (const item of items) {
          const candidate = normalizeSocialAccount(item);
          if (candidate && isValidSolAddress(candidate)) return candidate;
        }
      } catch {}
    }
    const directCandidates = [
      normalizeSocialAccount(socialProvider.publicKey),
      normalizeSocialAccount(socialProvider.address),
      normalizeSocialAccount(socialProvider.selectedAddress),
    ];
    for (const candidate of directCandidates) {
      if (candidate && isValidSolAddress(candidate)) return candidate;
    }
    try {
      const evmAccounts = await withTimeout(
        socialProvider.request({ method: 'eth_accounts' }),
        7000,
        'تعذر قراءة حسابات EVM من المزود الاجتماعي.'
      );
      const firstEvm = Array.isArray(evmAccounts) ? evmAccounts[0] : evmAccounts;
      const normalizedEvm = normalizeSocialAccount(firstEvm);
      if (normalizedEvm && isValidEvmAddress(normalizedEvm)) {
        throw new WalletOperationError('Social provider returned EVM account on Solana flow.', {
          code: 'SOCIAL_CHAIN_MISMATCH',
          userMessage: 'تمت مصادقة اجتماعية لكن الاتصال مُعدّ على EVM بدل Solana. راجع إعداد Social Connection في Web3Auth Dashboard.',
          retriable: false
        });
      }
    } catch (error) {
      if (error instanceof WalletOperationError) throw error;
    }
    return null;
  }, [isValidEvmAddress, isValidSolAddress, normalizeSocialAccount, withTimeout]);

  const normalizeChainId = useCallback((chainId) => {
    if (typeof chainId !== 'string') return '';
    const lower = chainId.trim().toLowerCase();
    if (!lower) return '';
    return lower.startsWith('0x') ? lower : `0x${Number.parseInt(lower, 10).toString(16)}`;
  }, []);

  const setRequiredEvmChainId = useCallback((chainId) => {
    const normalized = normalizeChainId(chainId);
    if (!ALLOWED_EVM_CHAIN_IDS.has(normalized)) {
      throw new WalletOperationError('Unsupported EVM chain id.', {
        code: 'CHAIN_NOT_ALLOWED',
        userMessage: 'الشبكة المطلوبة غير مدعومة في إعدادات الأمان.',
        retriable: false,
        details: { chainId: normalized }
      });
    }
    setRequiredEvmChainIdState(normalized);
    return normalized;
  }, [normalizeChainId]);

  const resolveRequiredChainId = useCallback((requestedChainId) => {
    const normalized = normalizeChainId(requestedChainId || requiredEvmChainId || DEFAULT_EVM_CHAIN_ID);
    if (!ALLOWED_EVM_CHAIN_IDS.has(normalized)) {
      throw new WalletOperationError('Unsupported requested EVM chain id.', {
        code: 'CHAIN_NOT_ALLOWED',
        userMessage: 'الشبكة المطلوبة غير مسموحة.',
        retriable: false,
        details: { chainId: normalized }
      });
    }
    return normalized;
  }, [normalizeChainId, requiredEvmChainId]);

  const resolvePrivyUserPayload = useCallback(async (payload) => {
    const directUser = payload?.user || payload || null;
    if (directUser?.linkedAccounts || directUser?.wallet?.address) return directUser;
    for (let i = 0; i < 12; i += 1) {
      const current = privyUserRef.current;
      if (current?.linkedAccounts || current?.wallet?.address) return current;
      await new Promise((resolve) => setTimeout(resolve, 150));
    }
    return privyUserRef.current || null;
  }, []);

  const resolvePrivySocialAddress = useCallback((userPayload) => {
    const directCandidates = [
      userPayload?.wallet?.address,
      ...(Array.isArray(userPayload?.wallets) ? userPayload.wallets.map((w) => w?.address) : [])
    ];
    for (const value of directCandidates) {
      const candidate = normalizeSocialAccount(value);
      if (candidate && isValidSolAddress(candidate)) return candidate;
    }
    const linkedAccounts = Array.isArray(userPayload?.linkedAccounts) ? userPayload.linkedAccounts : [];
    for (const account of linkedAccounts) {
      const candidate = normalizeSocialAccount(account?.address || account?.publicKey || account);
      if (candidate && isValidSolAddress(candidate)) return candidate;
    }
    for (const account of linkedAccounts) {
      const evmCandidate = normalizeSocialAccount(account?.address || account);
      if (evmCandidate && isValidEvmAddress(evmCandidate)) {
        throw new WalletOperationError('Privy returned EVM address for Solana social flow.', {
          code: 'SOCIAL_CHAIN_MISMATCH',
          userMessage: 'المصادقة الاجتماعية نجحت لكن عنوان المحفظة ليس على Solana. فعّل Solana embedded wallet في Privy Dashboard.',
          retriable: false
        });
      }
    }
    return null;
  }, [isValidEvmAddress, isValidSolAddress, normalizeSocialAccount]);

  /**
   * @param {string} walletAddress
   * @param {string} type
   * @returns {string}
   */
  const getSessionChallengeMessage = useCallback((walletAddress, type) => {
    const ts = new Date().toISOString();
    return `Pepe Wife Session Approval\nWallet: ${type}\nAddress: ${walletAddress}\nTimestamp: ${ts}\nAction: Reconnect session`;
  }, []);

  /**
   * @param {string} type
   * @param {any} walletProvider
   * @returns {any|null}
   */
  const createAdapterFor = useCallback((type, walletProvider, expectedChainId = requiredEvmChainId) => {
    if (!walletProvider) return null;
    if (type === 'MetaMask') {
      return createWalletAdapter({
        provider: walletProvider,
        walletType: 'MetaMask',
        expectedChainId,
        retries: 1
      });
    }
    if (SOLANA_WALLET_TYPES.has(type)) {
      return createWalletAdapter({
        provider: walletProvider,
        walletType: 'Solana',
        retries: 1
      });
    }
    return null;
  }, [requiredEvmChainId]);

  /**
   * @param {string} addr
   * @param {string} type
   * @returns {boolean}
   */
  const isValidAddressByType = useCallback((addr, type) => {
    if (!addr || typeof addr !== 'string') return false;
    if (EVM_WALLET_TYPES.has(type)) return isValidEvmAddress(addr);
    if (SOLANA_WALLET_TYPES.has(type)) return isValidSolAddress(addr);
    return addr.length > 10;
  }, []);

  /**
   * @param {{ address?: string, walletType?: string, providerOverride?: any, adapterOverride?: any }} params
   * @returns {Promise<boolean>}
   * @throws {WalletOperationError}
   */
  const authorizeSessionWithProvider = useCallback(async (params = {}) => {
    const activeAddress = typeof params.address === 'string' ? params.address : address;
    const activeType = params.walletType || walletType;
    const activeProvider = params.providerOverride || provider;
    const activeAdapter = params.adapterOverride || adapterRef.current || createAdapterFor(activeType, activeProvider);
    if (!activeAddress || !activeType || !activeProvider || !activeAdapter) {
      throw new WalletOperationError('Missing wallet session authorization context.', {
        code: 'SESSION_CONTEXT_MISSING',
        userMessage: 'تعذر تجهيز سياق التحقق من الجلسة.',
        retriable: false
      });
    }
    const challenge = getSessionChallengeMessage(activeAddress, activeType);
    try {
      await activeAdapter.sign(challenge, activeAddress);
      return true;
    } catch (error) {
      throw handleWalletAdapterError(error, 'session_signature');
    }
  }, [address, walletType, provider, createAdapterFor, getSessionChallengeMessage]);

  /**
   * @param {string} addr
   * @param {string} type
   * @param {any} walletProvider
   * @param {any} [walletAdapter]
   */
  const connect = useCallback((addr, type, walletProvider = null, walletAdapter = null) => {
    if (!isValidAddressByType(addr, type)) return;
    safeSessionSet(STORAGE_KEYS.connected, 'true');
    safeSessionSet(STORAGE_KEYS.address, addr);
    safeSessionSet(STORAGE_KEYS.type, type);
    safeSessionRemove(STORAGE_KEYS.explicitLogout);
    setAddress(addr);
    setWalletType(type);
    setProvider(walletProvider);
    adapterRef.current = walletAdapter || createAdapterFor(type, walletProvider);
    setIsConnected(true);
  }, [createAdapterFor, isValidAddressByType]);

  /**
   * @returns {Promise<void>}
   */
  const disconnect = useCallback(async () => {
    try {
      await privyLogout?.();
      const currentProvider = providerRef.current;
      if (currentProvider && typeof currentProvider.disconnect === 'function') {
        await currentProvider.disconnect();
      }
    } catch (error) {
      logWallet('warn', 'disconnect finished with non-fatal error', error);
    } finally {
      setIsConnected(false);
      setAddress('');
      setWalletType('');
      setProvider(null);
      setActiveChainId('');
      adapterRef.current = null;
      safeSessionRemove(STORAGE_KEYS.connected);
      safeSessionRemove(STORAGE_KEYS.address);
      safeSessionRemove(STORAGE_KEYS.type);
      safeSessionSet(STORAGE_KEYS.explicitLogout, 'true');
    }
  }, [logWallet, privyLogout]);

  /**
   * @returns {{ MetaMask: boolean, Phantom: boolean }}
   */
  const detectAvailableWallets = useCallback(() => {
    if (typeof window === 'undefined') return { MetaMask: false, Phantom: false };
    const detected = detectWalletProviders(window);
    return {
      MetaMask: Boolean(detected.MetaMask),
      Phantom: Boolean(detected.Phantom),
    };
  }, []);

  const ensureEvmChain = useCallback(async (evmProvider, requestedChainId, autoSwitch = true) => {
    if (!evmProvider || typeof evmProvider.request !== 'function') {
      throw new WalletOperationError('EVM provider is invalid.', {
        code: 'PROVIDER_INVALID',
        userMessage: 'مزود الشبكة غير صالح.',
        retriable: false
      });
    }
    const requiredChainId = resolveRequiredChainId(requestedChainId);
    const current = normalizeChainId(await evmProvider.request({ method: 'eth_chainId' }));
    if (current === requiredChainId) return requiredChainId;
    if (!autoSwitch) {
      throw new WalletOperationError(`Unexpected chain id: ${current}`, {
        code: 'CHAIN_MISMATCH',
        userMessage: 'الشبكة الحالية غير صحيحة. يرجى التبديل إلى الشبكة المطلوبة.',
        retriable: false,
        details: { current, requiredChainId }
      });
    }
    try {
      await evmProvider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: requiredChainId }]
      });
    } catch (switchError) {
      const code = switchError?.code;
      if (code === 4902 && EVM_CHAIN_PARAMS[requiredChainId]) {
        await evmProvider.request({
          method: 'wallet_addEthereumChain',
          params: [EVM_CHAIN_PARAMS[requiredChainId]]
        });
      } else {
        throw handleWalletAdapterError(switchError, 'switch_chain');
      }
    }
    const afterSwitch = normalizeChainId(await evmProvider.request({ method: 'eth_chainId' }));
    if (afterSwitch !== requiredChainId) {
      throw new WalletOperationError(`Failed to switch to required chain: ${requiredChainId}`, {
        code: 'CHAIN_MISMATCH',
        userMessage: 'تعذر التبديل إلى الشبكة المطلوبة.',
        retriable: false,
        details: { afterSwitch, requiredChainId }
      });
    }
    setActiveChainId(afterSwitch);
    return afterSwitch;
  }, [normalizeChainId, resolveRequiredChainId]);

  /**
   * @param {'MetaMask'|'Phantom'} preferred
   * @param {'MetaMask'|'Phantom'} fallback
   * @returns {Promise<{ address: string, walletType: string }>}
   */
  const connectPreferredWallet = useCallback(async (preferred = 'MetaMask', fallback = 'Phantom', options = {}) => {
    if (typeof window === 'undefined') {
      throw new WalletOperationError('Wallet connection is browser-only.', {
        code: 'BROWSER_REQUIRED',
        userMessage: 'الاتصال بالمحفظة متاح فقط داخل المتصفح.',
        retriable: false
      });
    }
    const allowFallback = options.allowFallback !== false;
    const requestedChainId = resolveRequiredChainId(options.requiredChainId);
    let selection = null;
    if (allowFallback) {
      selection = selectWalletProvider({ preferred, fallback, win: window });
    } else {
      const detected = detectWalletProviders(window);
      if (!detected[preferred]) {
        throw new WalletOperationError(`${preferred} provider not found.`, {
          code: 'WALLET_NOT_FOUND',
          userMessage: `المحفظة ${preferred} غير مثبتة.`,
          retriable: false
        });
      }
      selection = { walletType: preferred, provider: detected[preferred] };
    }
    if (selection.walletType === 'MetaMask') {
      await ensureEvmChain(selection.provider, requestedChainId, options.autoSwitch !== false);
    }
    const adapter = createAdapterFor(selection.walletType, selection.provider, requestedChainId);
    if (!adapter) {
      throw new WalletOperationError('Failed to create wallet adapter.', {
        code: 'ADAPTER_NOT_CREATED',
        userMessage: 'تعذر إنشاء طبقة التوافق للمحفظة.',
        retriable: false
      });
    }
    const nextAddress = await adapter.connect();
    await authorizeSessionWithProvider({
      address: nextAddress,
      walletType: selection.walletType,
      providerOverride: selection.provider,
      adapterOverride: adapter
    });
    connect(nextAddress, selection.walletType, selection.provider, adapter);
    if (selection.walletType === 'MetaMask' && typeof selection.provider.request === 'function') {
      try {
        const chainId = await selection.provider.request({ method: 'eth_chainId' });
        setActiveChainId(chainId || '');
      } catch {}
    }
    return { address: nextAddress, walletType: selection.walletType };
  }, [authorizeSessionWithProvider, connect, createAdapterFor, ensureEvmChain, resolveRequiredChainId]);

  /**
   * @param {string} loginProvider
   * @param {{ login_hint?: string }} [extraOptions]
   * @returns {Promise<string|null>}
   */
  const loginWithSocial = useCallback(async (loginProvider, extraOptions = {}) => {
    try {
      if (!privyReady) {
        throw new WalletOperationError('Privy SDK is not ready.', {
          code: 'SOCIAL_SDK_NOT_READY',
          userMessage: 'تهيئة مزود الدخول الاجتماعي ما زالت جارية. حاول بعد ثوانٍ.',
          retriable: true
        });
      }
      if (!SOCIAL_LOGIN_PROVIDERS.has(loginProvider)) {
        throw new WalletOperationError('Unsupported social login provider.', {
          code: 'SOCIAL_PROVIDER_UNSUPPORTED',
          userMessage: 'مزود تسجيل الدخول الاجتماعي غير مسموح.',
          retriable: false
        });
      }
      const privyMethodMap = {
        google: 'google',
        twitter: 'twitter',
        telegram: 'telegram',
        email_passwordless: 'email'
      };
      const loginMethod = privyMethodMap[loginProvider];
      if (!loginMethod) {
        throw new WalletOperationError('Unsupported Privy social method.', {
          code: 'SOCIAL_PROVIDER_UNSUPPORTED',
          userMessage: 'طريقة تسجيل الدخول غير مدعومة.',
          retriable: false
        });
      }
      const sanitizedLoginHint = typeof extraOptions.login_hint === 'string'
        ? extraOptions.login_hint.trim()
        : '';
      if (loginProvider === 'email_passwordless' && !sanitizedLoginHint) {
        throw new WalletOperationError('Missing email for email otp login.', {
          code: 'EMAIL_REQUIRED',
          userMessage: 'أدخل بريدًا إلكترونيًا صحيحًا قبل متابعة Email OTP.',
          retriable: true
        });
      }
      const loginPayload = await withTimeout(
        privyLogin({
          loginMethods: [loginMethod],
          ...(loginProvider === 'email_passwordless' && sanitizedLoginHint
            ? { prefill: { type: 'email', value: sanitizedLoginHint } }
            : {})
        }),
        SOCIAL_FLOW_TIMEOUT_MS,
        'انتهت مهلة تسجيل الدخول الاجتماعي. تحقق من إعدادات Privy والـ allowed origins.'
      );
      const resolvedUser = await resolvePrivyUserPayload(loginPayload);
      const account = resolvePrivySocialAddress(resolvedUser);
      if (!isValidSolAddress(account)) {
        throw new WalletOperationError('Social wallet account is invalid.', {
          code: 'ADDRESS_INVALID',
          userMessage: 'لا يمكن استخراج عنوان Solana من حساب Privy. فعّل Solana embedded wallet داخل Privy Dashboard.',
          retriable: false
        });
      }
      connect(account, 'Social', null, null);
      return account;
    } catch (error) {
      if (error?.code === 4011) {
        return null;
      }
      throw handleWalletAdapterError(error, 'social_connect');
    }
  }, [connect, isValidSolAddress, privyLogin, privyReady, resolvePrivySocialAddress, resolvePrivyUserPayload, withTimeout]);

  /**
   * @param {'MetaMask'|'Binance'|'Coinbase'} walletName
   * @returns {Promise<string>}
   */
  const connectEVMWallet = useCallback(async (walletName, options = {}) => {
    if (walletName === 'MetaMask') {
      const result = await connectPreferredWallet('MetaMask', 'Phantom', {
        requiredChainId: options.requiredChainId,
        autoSwitch: options.autoSwitch !== false,
        allowFallback: options.allowFallback === true
      });
      return result.address;
    }
    if (typeof window === 'undefined') {
      throw new WalletOperationError('Wallet connection is browser-only.', {
        code: 'BROWSER_REQUIRED',
        userMessage: 'الاتصال بالمحفظة متاح فقط داخل المتصفح.',
        retriable: false
      });
    }
    let targetProvider = null;
    if (walletName === 'Binance') {
      targetProvider = window.BinanceChain ||
        window.ethereum?.providers?.find?.((p) => p.isBinance) ||
        (window.ethereum?.isBinance ? window.ethereum : null);
      if (!targetProvider) {
        return connectWalletConnect('Binance');
      }
    }
    if (walletName === 'Coinbase') {
      targetProvider = window.coinbaseWalletExtension ||
        (window.ethereum?.isCoinbaseWallet ? window.ethereum : window.ethereum?.providers?.find?.((p) => p.isCoinbaseWallet));
      if (!targetProvider) {
        window.open('https://www.coinbase.com/wallet', '_blank');
        throw new WalletOperationError('Coinbase wallet not found.', {
          code: 'WALLET_NOT_FOUND',
          userMessage: 'محفظة Coinbase غير مثبتة على المتصفح.',
          retriable: false
        });
      }
    }
    const requestedChainId = resolveRequiredChainId(options.requiredChainId);
    await ensureEvmChain(targetProvider, requestedChainId, options.autoSwitch !== false);
    const adapter = createWalletAdapter({
      provider: targetProvider,
      walletType: 'MetaMask',
      expectedChainId: requestedChainId,
      retries: 1
    });
    const nextAddress = await adapter.connect();
    await authorizeSessionWithProvider({
      address: nextAddress,
      walletType: walletName,
      providerOverride: targetProvider,
      adapterOverride: adapter
    });
    connect(nextAddress, walletName, targetProvider, adapter);
    const chainId = await targetProvider.request({ method: 'eth_chainId' });
    setActiveChainId(chainId || '');
    return nextAddress;
  }, [authorizeSessionWithProvider, connect, connectPreferredWallet, ensureEvmChain, resolveRequiredChainId]);

  /**
   * @param {'Phantom'|'Solflare'|'Backpack'|'OKX'|'Trust Wallet'} walletName
   * @returns {Promise<string>}
   */
  const connectSolanaWallet = useCallback(async (walletName) => {
    if (typeof window === 'undefined') {
      throw new WalletOperationError('Wallet connection is browser-only.', {
        code: 'BROWSER_REQUIRED',
        userMessage: 'الاتصال بالمحفظة متاح فقط داخل المتصفح.',
        retriable: false
      });
    }
    let targetProvider = null;
    if (walletName === 'Phantom') {
      const selected = selectWalletProvider({ preferred: 'Phantom', fallback: 'MetaMask', win: window });
      if (selected.walletType !== 'Phantom') {
        throw new WalletOperationError('Phantom not found for Solana connection.', {
          code: 'WALLET_NOT_FOUND',
          userMessage: 'محفظة Phantom غير مثبتة.',
          retriable: false
        });
      }
      targetProvider = selected.provider;
    } else if (walletName === 'Solflare') {
      targetProvider = window.solflare?.isSolflare ? window.solflare : null;
    } else if (walletName === 'Backpack') {
      targetProvider = window.backpack || null;
    } else if (walletName === 'OKX') {
      targetProvider = window.okxwallet?.solana || null;
    } else if (walletName === 'Trust Wallet') {
      targetProvider = window.trustwallet?.solana || null;
    }
    if (!targetProvider) {
      throw new WalletOperationError(`${walletName} provider not available.`, {
        code: 'WALLET_NOT_FOUND',
        userMessage: `المحفظة ${walletName} غير متوفرة في المتصفح.`,
        retriable: false
      });
    }
    const adapter = createWalletAdapter({
      provider: targetProvider,
      walletType: 'Solana',
      retries: 1
    });
    const nextAddress = await adapter.connect();
    await authorizeSessionWithProvider({
      address: nextAddress,
      walletType: walletName,
      providerOverride: targetProvider,
      adapterOverride: adapter
    });
    connect(nextAddress, walletName, targetProvider, adapter);
    return nextAddress;
  }, [authorizeSessionWithProvider, connect]);

  /**
   * @param {string} preferredWallet
   * @returns {Promise<string>}
   */
  const connectWalletConnect = useCallback(async (preferredWallet, options = {}) => {
    if (typeof window === 'undefined') {
      throw new WalletOperationError('Wallet connection is browser-only.', {
        code: 'BROWSER_REQUIRED',
        userMessage: 'الاتصال بالمحفظة متاح فقط داخل المتصفح.',
        retriable: false
      });
    }
    try {
      const requiredChainId = resolveRequiredChainId(options.requiredChainId);
      const requiredChainDecimal = Number.parseInt(requiredChainId, 16);
      const { EthereumProvider } = await import("@walletconnect/ethereum-provider");
      const wcProvider = await EthereumProvider.init({
        projectId: WALLETCONNECT_PROJECT_ID,
        showQrModal: true,
        qrModalOptions: { themeMode: "light" },
        chains: [requiredChainDecimal],
        methods: ["eth_sendTransaction", "personal_sign", "eth_accounts", "eth_requestAccounts"],
        events: ["chainChanged", "accountsChanged"],
        metadata: {
          name: "Pepe Wife",
          description: "Pepe Wife Presale",
          url: window.location.origin,
          icons: [window.location.origin + "/logo.png"],
        },
      });
      await wcProvider.connect();
      const accounts = await wcProvider.request({ method: 'eth_accounts' });
      const account = accounts?.[0];
      if (!isValidEvmAddress(account)) {
        throw new WalletOperationError('No valid account via WalletConnect.', {
          code: 'ADDRESS_INVALID',
          userMessage: 'فشل الحصول على عنوان صالح عبر WalletConnect.',
          retriable: true
        });
      }
      const adapter = createWalletAdapter({
        provider: wcProvider,
        walletType: 'MetaMask',
        expectedChainId: requiredChainId,
        retries: 1
      });
      await authorizeSessionWithProvider({
        address: account,
        walletType: preferredWallet || 'WalletConnect',
        providerOverride: wcProvider,
        adapterOverride: adapter
      });
      connect(account, preferredWallet || 'WalletConnect', wcProvider, adapter);
      const chainId = await wcProvider.request({ method: 'eth_chainId' });
      setActiveChainId(chainId || '');
      return account;
    } catch (error) {
      throw handleWalletAdapterError(error, 'walletconnect_connect');
    }
  }, [authorizeSessionWithProvider, connect, resolveRequiredChainId]);

  /**
   * @param {object} transaction
   * @returns {Promise<string>}
   */
  const sendTransaction = useCallback(async (transaction) => {
    const adapter = adapterRef.current;
    if (!adapter) {
      throw new WalletOperationError('Wallet adapter is not ready.', {
        code: 'ADAPTER_NOT_READY',
        userMessage: 'المحفظة غير متصلة بشكل صحيح.',
        retriable: false
      });
    }
    try {
      return await adapter.sendTransaction(transaction, address);
    } catch (error) {
      throw handleWalletAdapterError(error, 'send_transaction');
    }
  }, [address]);

  /**
   * @param {string} message
   * @returns {Promise<any>}
   */
  const signMessage = useCallback(async (message) => {
    const adapter = adapterRef.current;
    if (!adapter) {
      throw new WalletOperationError('Wallet adapter is not ready.', {
        code: 'ADAPTER_NOT_READY',
        userMessage: 'المحفظة غير متصلة بشكل صحيح.',
        retriable: false
      });
    }
    try {
      return await adapter.sign(message, address);
    } catch (error) {
      throw handleWalletAdapterError(error, 'sign_message');
    }
  }, [address]);

  useEffect(() => {
    providerRef.current = provider;
    walletTypeRef.current = walletType;
  }, [provider, walletType]);

  useEffect(() => {
    if (!provider || !walletType) return;
    const cleanupFns = [];
    if (EVM_WALLET_TYPES.has(walletType) && typeof provider.on === 'function') {
      const handleAccountsChanged = (accounts) => {
        const next = Array.isArray(accounts) ? accounts[0] : null;
        if (!isValidEvmAddress(next)) {
          disconnect();
          return;
        }
        connect(next, walletType, provider, adapterRef.current);
      };
      const handleDisconnect = () => disconnect();
      const handleChainChanged = (chainId) => {
        const normalizedChainId = normalizeChainId(chainId || '');
        setActiveChainId(normalizedChainId);
        const requiredChainId = resolveRequiredChainId();
        if (requiredChainId && normalizedChainId !== requiredChainId) {
          logWallet('warn', 'chain mismatch detected, disconnecting for safety', { chainId: normalizedChainId, expected: requiredChainId });
          disconnect();
        }
      };
      provider.on('accountsChanged', handleAccountsChanged);
      provider.on('disconnect', handleDisconnect);
      provider.on('chainChanged', handleChainChanged);
      cleanupFns.push(() => {
        if (typeof provider.removeListener === 'function') {
          provider.removeListener('accountsChanged', handleAccountsChanged);
          provider.removeListener('disconnect', handleDisconnect);
          provider.removeListener('chainChanged', handleChainChanged);
        }
      });
    }
    if (SOLANA_WALLET_TYPES.has(walletType) && typeof provider.on === 'function') {
      const handleDisconnect = () => disconnect();
      const handleAccountChanged = (pubkey) => {
        const next = pubkey?.toString?.();
        if (!isValidSolAddress(next)) {
          disconnect();
          return;
        }
        connect(next, walletType, provider, adapterRef.current);
      };
      provider.on('disconnect', handleDisconnect);
      provider.on('accountChanged', handleAccountChanged);
      cleanupFns.push(() => {
        if (typeof provider.removeListener === 'function') {
          provider.removeListener('disconnect', handleDisconnect);
          provider.removeListener('accountChanged', handleAccountChanged);
        }
      });
    }
    return () => cleanupFns.forEach((fn) => fn());
  }, [provider, walletType, connect, disconnect, isValidEvmAddress, isValidSolAddress, logWallet, normalizeChainId, resolveRequiredChainId]);

  const safeSessionGet = (key) => {
    try {
      if (typeof window === 'undefined') return null;
      return window.sessionStorage.getItem(key);
    } catch {
      return null;
    }
  };

  const safeSessionSet = (key, value) => {
    try {
      if (typeof window === 'undefined') return;
      window.sessionStorage.setItem(key, value);
    } catch {}
  };

  const safeSessionRemove = (key) => {
    try {
      if (typeof window === 'undefined') return;
      window.sessionStorage.removeItem(key);
    } catch {}
  };

  const clearStoredWallet = () => {
    safeSessionRemove(STORAGE_KEYS.connected);
    safeSessionRemove(STORAGE_KEYS.address);
    safeSessionRemove(STORAGE_KEYS.type);
  };

  const getSolanaExtensionProvider = (type) => {
    if (typeof window === 'undefined') return null;
    if (type === 'Phantom') return window.phantom?.solana || (window.solana?.isPhantom ? window.solana : null);
    if (type === 'Solflare') return window.solflare?.isSolflare ? window.solflare : null;
    if (type === 'Backpack') return window.backpack || null;
    if (type === 'OKX') return window.okxwallet?.solana || null;
    if (type === 'Trust Wallet') return window.trustwallet?.solana || null;
    return null;
  };

  const getEvmInjectedProvider = (type) => {
    if (typeof window === 'undefined') return null;
    if (type === 'MetaMask') return detectWalletProviders(window).MetaMask;
    if (type === 'Binance') {
      return window.BinanceChain ||
        window.ethereum?.providers?.find?.((p) => p.isBinance) ||
        (window.ethereum?.isBinance ? window.ethereum : null) ||
        null;
    }
    if (type === 'Coinbase') {
      return window.coinbaseWalletExtension ||
        (window.ethereum?.isCoinbaseWallet ? window.ethereum : window.ethereum?.providers?.find?.((p) => p.isCoinbaseWallet)) ||
        null;
    }
    return null;
  };

  /**
   * @param {any} instance
   * @param {boolean} wasLoggedOut
   * @returns {Promise<void>}
   */
  const attemptRehydrate = useCallback(async (instance, wasLoggedOut) => {
    if (typeof window === 'undefined') return;
    const storedConnected = safeSessionGet(STORAGE_KEYS.connected) === 'true';
    const storedAddress = safeSessionGet(STORAGE_KEYS.address);
    const storedType = safeSessionGet(STORAGE_KEYS.type);
    if (wasLoggedOut || !storedConnected || !storedAddress || !storedType) return;
    if (storedType === 'Social') {
      if (instance && instance.status === "connected" && instance.provider) {
        try {
          const accounts = await instance.provider.request({ method: "solana_getAccounts" });
          const account = accounts?.[0];
          if (isValidSolAddress(account) && account.toLowerCase() === storedAddress.toLowerCase()) {
            const adapter = createAdapterFor('Social', instance.provider);
            connect(account, 'Social', instance.provider, adapter);
            return;
          }
        } catch {}
      }
      clearStoredWallet();
      return;
    }
    if (SOLANA_WALLET_TYPES.has(storedType)) {
      const solProvider = getSolanaExtensionProvider(storedType);
      if (solProvider) {
        const currentPk = solProvider.publicKey?.toString?.();
        if (isValidSolAddress(currentPk) && currentPk.toLowerCase() === storedAddress.toLowerCase()) {
          const adapter = createAdapterFor(storedType, solProvider);
          connect(storedAddress, storedType, solProvider, adapter);
          return;
        }
      }
      clearStoredWallet();
      return;
    }
    if (EVM_WALLET_TYPES.has(storedType) && storedType !== 'WalletConnect') {
      const evmProvider = getEvmInjectedProvider(storedType);
      if (evmProvider) {
        try {
          const accounts = await evmProvider.request({ method: 'eth_accounts' });
          const normalized = accounts?.map?.((a) => (typeof a === 'string' ? a.toLowerCase() : a)) || [];
          if (normalized.includes(storedAddress.toLowerCase())) {
            const adapter = createWalletAdapter({
              provider: evmProvider,
              walletType: 'MetaMask',
              expectedChainId: resolveRequiredChainId(),
              retries: 1
            });
            connect(storedAddress, storedType, evmProvider, adapter);
            return;
          }
        } catch {}
      }
      clearStoredWallet();
      return;
    }
    clearStoredWallet();
  }, [connect, createAdapterFor, isValidSolAddress, resolveRequiredChainId]);

  useEffect(() => {
    const init = async () => {
      try {
        const wasLoggedOut = safeSessionGet(STORAGE_KEYS.explicitLogout) === 'true';
        const storedType = safeSessionGet(STORAGE_KEYS.type);
        const storedConnected = safeSessionGet(STORAGE_KEYS.connected) === 'true';
        if (!wasLoggedOut && storedConnected && storedType === 'Social') {
          clearStoredWallet();
          safeSessionSet(STORAGE_KEYS.explicitLogout, 'true');
          await attemptRehydrate(null, true);
        } else {
          await attemptRehydrate(null, wasLoggedOut);
        }
      } catch (error) {
        logWallet('warn', 'rehydration failed', error);
      } finally {
        setIsInitializing(false);
      }
    };
    init();
  }, [attemptRehydrate, logWallet]);

  const contextValue = useMemo(() => ({
    isConnected,
    address,
    walletType,
    isInitializing,
    activeChainId,
    requiredEvmChainId,
    setRequiredEvmChainId,
    detectAvailableWallets,
    connectPreferredWallet,
    connect,
    disconnect,
    loginWithSocial,
    connectEVMWallet,
    connectSolanaWallet,
    connectWalletConnect,
    sendTransaction,
    signMessage,
    authorizeSessionWithProvider
  }), [
    isConnected,
    address,
    walletType,
    isInitializing,
    activeChainId,
    requiredEvmChainId,
    setRequiredEvmChainId,
    detectAvailableWallets,
    connectPreferredWallet,
    connect,
    disconnect,
    loginWithSocial,
    connectEVMWallet,
    connectSolanaWallet,
    connectWalletConnect,
    sendTransaction,
    signMessage,
    authorizeSessionWithProvider
  ]);

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);
