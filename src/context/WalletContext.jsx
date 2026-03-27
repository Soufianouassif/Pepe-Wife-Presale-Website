import React, { createContext, useState, useEffect, useContext, useRef, useCallback, useMemo } from 'react';
import { detectWalletProviders, selectWalletProvider } from '../wallet/detector';
import { createWalletAdapter, handleWalletAdapterError, isValidEvmAddress, isValidSolAddress } from '../wallet/adapters';
import { WalletOperationError } from '../wallet/errors';

const WalletContext = createContext();
const WALLETCONNECT_PROJECT_ID = "90be08cc5b7174d4051d2de451af0d9b";
const EVM_REQUIRED_CHAIN_ID = import.meta?.env?.VITE_EVM_CHAIN_ID || '0x38';

const STORAGE_KEYS = {
  connected: 'walletConnected',
  address: 'walletAddress',
  type: 'walletType',
  explicitLogout: 'explicit_logout',
};

const SOLANA_WALLET_TYPES = new Set(['Social', 'Phantom', 'Solflare', 'Backpack', 'OKX', 'Trust Wallet']);
const EVM_WALLET_TYPES = new Set(['MetaMask', 'Binance', 'Coinbase', 'WalletConnect']);

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
  const [web3auth, setWeb3auth] = useState(null);
  const [activeChainId, setActiveChainId] = useState('');

  const web3authInitPromiseRef = useRef(null);
  const adapterRef = useRef(null);
  const providerRef = useRef(null);
  const walletTypeRef = useRef('');

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

  /**
   * @returns {Promise<any>}
   */
  const ensureWeb3AuthInitialized = useCallback(async () => {
    if (web3auth) return web3auth;
    if (web3authInitPromiseRef.current) return await web3authInitPromiseRef.current;
    web3authInitPromiseRef.current = (async () => {
      try {
        const mod = await import('../services/web3authService.js');
        const svc = mod.default;
        await svc.init();
        const instance = svc.getInstance();
        setWeb3auth(instance);
        return instance;
      } catch (error) {
        throw handleWalletAdapterError(error, 'init_social_wallet');
      }
    })();
    try {
      return await web3authInitPromiseRef.current;
    } finally {
      web3authInitPromiseRef.current = null;
    }
  }, [web3auth]);

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
  const createAdapterFor = useCallback((type, walletProvider) => {
    if (!walletProvider) return null;
    if (type === 'MetaMask') {
      return createWalletAdapter({
        provider: walletProvider,
        walletType: 'MetaMask',
        expectedChainId: EVM_REQUIRED_CHAIN_ID,
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
  }, []);

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
      if (web3auth && web3auth.status === "connected") {
        await web3auth.logout();
      }
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
  }, [web3auth, logWallet]);

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

  /**
   * @param {'MetaMask'|'Phantom'} preferred
   * @param {'MetaMask'|'Phantom'} fallback
   * @returns {Promise<{ address: string, walletType: string }>}
   */
  const connectPreferredWallet = useCallback(async (preferred = 'MetaMask', fallback = 'Phantom') => {
    if (typeof window === 'undefined') {
      throw new WalletOperationError('Wallet connection is browser-only.', {
        code: 'BROWSER_REQUIRED',
        userMessage: 'الاتصال بالمحفظة متاح فقط داخل المتصفح.',
        retriable: false
      });
    }
    const selection = selectWalletProvider({ preferred, fallback, win: window });
    const adapter = createAdapterFor(selection.walletType, selection.provider);
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
  }, [authorizeSessionWithProvider, connect, createAdapterFor]);

  /**
   * @param {string} loginProvider
   * @param {{ login_hint?: string }} [extraOptions]
   * @returns {Promise<string|null>}
   */
  const loginWithSocial = useCallback(async (loginProvider, extraOptions = {}) => {
    const web3authInstance = await ensureWeb3AuthInitialized();
    const { WALLET_ADAPTERS } = await import("@web3auth/base");
    try {
      if (web3authInstance.status === "connected") {
        await web3authInstance.logout();
      }
      const web3authProvider = await web3authInstance.connectTo(WALLET_ADAPTERS.AUTH, {
        loginProvider,
        extraLoginOptions: extraOptions.login_hint ? { login_hint: extraOptions.login_hint } : {},
      });
      if (!web3authProvider) {
        throw new WalletOperationError('Web3Auth connection returned null provider.', {
          code: 'SOCIAL_PROVIDER_MISSING',
          userMessage: 'فشل تسجيل الدخول الاجتماعي.',
          retriable: true
        });
      }
      const socialProvider = web3authInstance.provider;
      if (!socialProvider) {
        throw new WalletOperationError('Web3Auth provider missing after connect.', {
          code: 'SOCIAL_PROVIDER_MISSING',
          userMessage: 'تعذر تفعيل مزود Web3Auth.',
          retriable: true
        });
      }
      const accounts = await socialProvider.request({ method: "solana_getAccounts" });
      const account = accounts?.[0];
      if (!isValidSolAddress(account)) {
        throw new WalletOperationError('Social wallet account is invalid.', {
          code: 'ADDRESS_INVALID',
          userMessage: 'العنوان الناتج من تسجيل الدخول الاجتماعي غير صالح.',
          retriable: false
        });
      }
      const adapter = createAdapterFor('Social', socialProvider);
      await authorizeSessionWithProvider({
        address: account,
        walletType: 'Social',
        providerOverride: socialProvider,
        adapterOverride: adapter
      });
      connect(account, 'Social', socialProvider, adapter);
      return account;
    } catch (error) {
      if (error?.code === 4011) {
        return null;
      }
      throw handleWalletAdapterError(error, 'social_connect');
    }
  }, [authorizeSessionWithProvider, connect, createAdapterFor, ensureWeb3AuthInitialized]);

  /**
   * @param {'MetaMask'|'Binance'|'Coinbase'} walletName
   * @returns {Promise<string>}
   */
  const connectEVMWallet = useCallback(async (walletName) => {
    if (walletName === 'MetaMask') {
      const result = await connectPreferredWallet('MetaMask', 'Phantom');
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
    const adapter = createWalletAdapter({
      provider: targetProvider,
      walletType: 'MetaMask',
      expectedChainId: EVM_REQUIRED_CHAIN_ID,
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
  }, [authorizeSessionWithProvider, connect, connectPreferredWallet]);

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
  const connectWalletConnect = useCallback(async (preferredWallet) => {
    if (typeof window === 'undefined') {
      throw new WalletOperationError('Wallet connection is browser-only.', {
        code: 'BROWSER_REQUIRED',
        userMessage: 'الاتصال بالمحفظة متاح فقط داخل المتصفح.',
        retriable: false
      });
    }
    try {
      const { EthereumProvider } = await import("@walletconnect/ethereum-provider");
      const wcProvider = await EthereumProvider.init({
        projectId: WALLETCONNECT_PROJECT_ID,
        showQrModal: true,
        qrModalOptions: { themeMode: "light" },
        chains: [56],
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
        expectedChainId: EVM_REQUIRED_CHAIN_ID,
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
  }, [authorizeSessionWithProvider, connect]);

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
        setActiveChainId(chainId || '');
        if (EVM_REQUIRED_CHAIN_ID && chainId !== EVM_REQUIRED_CHAIN_ID) {
          logWallet('warn', 'chain mismatch detected, disconnecting for safety', { chainId, expected: EVM_REQUIRED_CHAIN_ID });
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
  }, [provider, walletType, connect, disconnect, isValidEvmAddress, isValidSolAddress, logWallet]);

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
              expectedChainId: EVM_REQUIRED_CHAIN_ID,
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
  }, [connect, createAdapterFor, isValidSolAddress]);

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
