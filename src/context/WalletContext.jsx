import React, { createContext, useState, useEffect, useContext, useRef } from 'react';

const WalletContext = createContext();
const WALLETCONNECT_PROJECT_ID = "90be08cc5b7174d4051d2de451af0d9b";
const STORAGE_KEYS = {
  connected: 'walletConnected',
  address: 'walletAddress',
  type: 'walletType',
  explicitLogout: 'explicit_logout',
};

const SOLANA_WALLET_TYPES = new Set(['Social', 'Phantom', 'Solflare', 'Backpack', 'OKX', 'Trust Wallet']);
const EVM_WALLET_TYPES = new Set(['MetaMask', 'Binance', 'Coinbase', 'WalletConnect']);

export const WalletProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState('');
  const [walletType, setWalletType] = useState('');
  const [provider, setProvider] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [web3auth, setWeb3auth] = useState(null);
  const web3authInitPromiseRef = useRef(null);
  const providerRef = useRef(null);
  const walletTypeRef = useRef('');
  const isConnectedRef = useRef(false);

  const ensureWeb3AuthInitialized = async () => {
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
      } catch {
        throw new Error("Social login is unavailable in this environment. Please use Phantom or MetaMask.");
      }
    })();

    try {
      return await web3authInitPromiseRef.current;
    } finally {
      web3authInitPromiseRef.current = null;
    }
  };

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
      } finally {
        setIsInitializing(false);
      }
    };
    init();
  }, []);

  const connect = (addr, type, customProvider = null) => {
    if (!addr || typeof addr !== 'string' || addr.length < 10) {
      return;
    }
    safeSessionSet(STORAGE_KEYS.connected, 'true');
    safeSessionSet(STORAGE_KEYS.address, addr);
    safeSessionSet(STORAGE_KEYS.type, type);
    safeSessionRemove(STORAGE_KEYS.explicitLogout);
    setAddress(addr);
    setWalletType(type);
    setProvider(customProvider);
    setIsConnected(true);
  };

  const disconnect = async () => {
    try {
      if (web3auth && web3auth.status === "connected") {
        await web3auth.logout();
      }
      const currentProvider = providerRef.current;
      if (currentProvider && typeof currentProvider.disconnect === 'function') {
        await currentProvider.disconnect();
      }
    } catch (error) {
    } finally {
      setIsConnected(false);
      setAddress('');
      setWalletType('');
      setProvider(null);
      safeSessionRemove(STORAGE_KEYS.connected);
      safeSessionRemove(STORAGE_KEYS.address);
      safeSessionRemove(STORAGE_KEYS.type);
      safeSessionSet(STORAGE_KEYS.explicitLogout, 'true');
    }
  };

  const loginWithSocial = async (loginProvider, extraOptions = {}) => {
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
        throw new Error("Web3Auth `connectTo` did not return a provider.");
      }

      const provider = web3authInstance.provider;
      if (!provider) {
        throw new Error("web3auth.provider is null after a successful connection.");
      }

      const accounts = await provider.request({ method: "solana_getAccounts" });

      if (!accounts || accounts.length === 0) {
        throw new Error("Could not retrieve Solana accounts from the provider.");
      }

      const account = accounts[0];
      connect(account, 'Social', provider);
      
      return account;

    } catch (error) {
      if (error.code === 4011) {
        // Return null to indicate a non-error cancellation.
        return null;
      }
      
      throw error;
    }
  };

  const connectEVMWallet = async (walletName) => {
    if (typeof window === 'undefined') {
      throw new Error("Wallet connection is only available in the browser.");
    }
    let targetProvider = null;

    if (walletName === 'Binance') {
      targetProvider = window.BinanceChain;
      
      if (!targetProvider && window.ethereum?.providers) {
        targetProvider = window.ethereum.providers.find(p => p.isBinance);
      }
      
      if (!targetProvider && window.ethereum?.isBinance) {
        targetProvider = window.ethereum;
      }

      if (!targetProvider) {
        return await connectWalletConnect('Binance');
      }
    } else if (walletName === 'MetaMask') {
      targetProvider = window.ethereum?.isMetaMask ? window.ethereum : window.ethereum?.providers?.find(p => p.isMetaMask);
      if (!targetProvider) {
        window.open('https://metamask.io/download/', '_blank');
        throw new Error("MetaMask not found");
      }
    } else if (walletName === 'Coinbase') {
      targetProvider = window.coinbaseWalletExtension || 
                       (window.ethereum?.isCoinbaseWallet ? window.ethereum : window.ethereum?.providers?.find(p => p.isCoinbaseWallet));
      if (!targetProvider) {
        window.open('https://www.coinbase.com/wallet', '_blank');
        throw new Error("Coinbase Wallet not found");
      }
    }
    
    try {
      const accounts = await targetProvider.request({ method: 'eth_requestAccounts' });
      
      if (Array.isArray(accounts) && typeof accounts[0] === 'string' && accounts[0].length > 0) {
        connect(accounts[0], walletName, targetProvider);
        return accounts[0];
      } else {
        throw new Error("Wallet did not return a valid account string.");
      }
    } catch (error) {
      throw error;
    }
  };

  const connectWalletConnect = async (preferredWallet) => {
    if (typeof window === 'undefined') {
      throw new Error("Wallet connection is only available in the browser.");
    }
    try {
      const { EthereumProvider } = await import("@walletconnect/ethereum-provider");
      const wcProvider = await EthereumProvider.init({
        projectId: WALLETCONNECT_PROJECT_ID,
        showQrModal: true,
        qrModalOptions: {
          themeMode: "light",
        },
        chains: [56], // BSC Mainnet
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
      
      if (accounts && accounts.length > 0) {
        connect(accounts[0], preferredWallet || 'WalletConnect', wcProvider);
        return accounts[0];
      }
      throw new Error("No accounts found via WalletConnect");
    } catch (error) {
      throw error;
    }
  };

  const sendTransaction = async (transaction) => {
    if (!isConnected || !provider) {
      throw new Error("Wallet not connected.");
    }
    if (!transaction || typeof transaction !== 'object') {
      throw new Error("Invalid transaction.");
    }

    try {
      if (SOLANA_WALLET_TYPES.has(walletType)) {
        const signature = await provider.request({
          method: 'solana_signAndSendTransaction',
          params: { transaction }
        });
        return signature;
      } else {
        if (typeof transaction.from === 'string' && transaction.from && transaction.from.toLowerCase() !== address.toLowerCase()) {
          throw new Error("Transaction 'from' does not match connected address.");
        }
        const txHash = await provider.request({
          method: 'eth_sendTransaction',
          params: [transaction]
        });
        return txHash;
      }
    } catch (error) {
      throw error;
    }
  };

  const signMessage = async (message) => {
    if (!isConnected || !provider) {
      throw new Error("Wallet not connected.");
    }
    if (!message || typeof message !== 'string') {
      throw new Error("Invalid message.");
    }

    if (SOLANA_WALLET_TYPES.has(walletType)) {
      const encoded = new TextEncoder().encode(message);
      if (typeof provider.signMessage === 'function') {
        const res = await provider.signMessage(encoded);
        return res?.signature || res;
      }
      if (typeof provider.request === 'function') {
        return await provider.request({
          method: 'solana_signMessage',
          params: { message: Array.from(encoded) }
        });
      }
      throw new Error("Wallet does not support message signing.");
    }

    if (typeof provider.request === 'function') {
      return await provider.request({
        method: 'personal_sign',
        params: [message, address]
      });
    }
    throw new Error("Wallet does not support message signing.");
  };

  useEffect(() => {
    providerRef.current = provider;
    walletTypeRef.current = walletType;
    isConnectedRef.current = isConnected;
  }, [provider, walletType, isConnected]);

  useEffect(() => {
    if (!provider || !walletType) return;

    const currentProvider = provider;
    const currentType = walletType;

    const cleanupFns = [];

    if (EVM_WALLET_TYPES.has(currentType) && typeof currentProvider.on === 'function') {
      const handleAccountsChanged = (accounts) => {
        const next = Array.isArray(accounts) ? accounts[0] : null;
        if (!next) {
          disconnect();
          return;
        }
        connect(next, currentType, currentProvider);
      };
      const handleDisconnect = () => disconnect();
      currentProvider.on('accountsChanged', handleAccountsChanged);
      currentProvider.on('disconnect', handleDisconnect);
      cleanupFns.push(() => {
        if (typeof currentProvider.removeListener === 'function') {
          currentProvider.removeListener('accountsChanged', handleAccountsChanged);
          currentProvider.removeListener('disconnect', handleDisconnect);
        }
      });
    }

    if (SOLANA_WALLET_TYPES.has(currentType) && typeof currentProvider.on === 'function') {
      const handleDisconnect = () => disconnect();
      const handleAccountChanged = (pubkey) => {
        const next = pubkey?.toString?.();
        if (!next) {
          disconnect();
          return;
        }
        connect(next, currentType, currentProvider);
      };
      currentProvider.on('disconnect', handleDisconnect);
      currentProvider.on('accountChanged', handleAccountChanged);
      cleanupFns.push(() => {
        if (typeof currentProvider.removeListener === 'function') {
          currentProvider.removeListener('disconnect', handleDisconnect);
          currentProvider.removeListener('accountChanged', handleAccountChanged);
        }
      });
    }

    return () => cleanupFns.forEach((fn) => fn());
  }, [provider, walletType]);

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
    if (type === 'MetaMask') {
      return window.ethereum?.isMetaMask ? window.ethereum : window.ethereum?.providers?.find?.(p => p.isMetaMask) || null;
    }
    if (type === 'Binance') {
      return window.BinanceChain ||
        window.ethereum?.providers?.find?.(p => p.isBinance) ||
        (window.ethereum?.isBinance ? window.ethereum : null) ||
        null;
    }
    if (type === 'Coinbase') {
      return window.coinbaseWalletExtension ||
        (window.ethereum?.isCoinbaseWallet ? window.ethereum : window.ethereum?.providers?.find?.(p => p.isCoinbaseWallet)) ||
        null;
    }
    return null;
  };

  const attemptRehydrate = async (instance, wasLoggedOut) => {
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
          if (account && account.toLowerCase?.() === storedAddress.toLowerCase?.()) {
            connect(account, 'Social', instance.provider);
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
        if (currentPk && currentPk.toLowerCase?.() === storedAddress.toLowerCase?.()) {
          connect(storedAddress, storedType, solProvider);
          return;
        }
        if (typeof solProvider.connect === 'function') {
          try {
            const res = await solProvider.connect({ onlyIfTrusted: true });
            const next = res?.publicKey?.toString?.() || solProvider.publicKey?.toString?.();
            if (next && next.toLowerCase?.() === storedAddress.toLowerCase?.()) {
              connect(next, storedType, solProvider);
              return;
            }
          } catch {}
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
            connect(storedAddress, storedType, evmProvider);
            return;
          }
        } catch {}
      }
      clearStoredWallet();
      return;
    }

    clearStoredWallet();
  };

  const clearStoredWallet = () => {
    safeSessionRemove(STORAGE_KEYS.connected);
    safeSessionRemove(STORAGE_KEYS.address);
    safeSessionRemove(STORAGE_KEYS.type);
  };

  return (
    <WalletContext.Provider value={{ isConnected, address, walletType, isInitializing, connect, disconnect, loginWithSocial, connectEVMWallet, connectWalletConnect, sendTransaction, signMessage }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);
