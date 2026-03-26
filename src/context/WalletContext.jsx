import React, { createContext, useState, useEffect, useContext, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CHAIN_NAMESPACES, WALLET_ADAPTERS } from "@web3auth/base";
import { EthereumProvider } from "@walletconnect/ethereum-provider";
import web3AuthService from '../services/web3authService';

const WalletContext = createContext();
const WALLETCONNECT_PROJECT_ID = "90be08cc5b7174d4051d2de451af0d9b";

export const WalletProvider = ({ children }) => {
  const { i18n } = useTranslation();
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState('');
  const [walletType, setWalletType] = useState('');
  const [provider, setProvider] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const web3auth = web3AuthService.getInstance();

  useEffect(() => {
    const init = async () => {
      try {
        await web3AuthService.init();
        const wasLoggedOut = sessionStorage.getItem('explicit_logout') === 'true';
        if (web3auth.status === "connected" && !wasLoggedOut) {
          const web3authProvider = web3auth.provider;
          const accounts = await web3authProvider.request({ method: "solana_getAccounts" });
          if (accounts && accounts.length > 0) {
            connect(accounts[0], 'Social', web3authProvider);
          }
        }
      } catch (error) {
        console.error("WalletProvider: Critical initialization error:", error);
      } finally {
        setIsInitializing(false);
      }
    };
    init();
  }, [web3auth]);

  const connect = (addr, type, customProvider = null) => {
    if (!addr || typeof addr !== 'string' || addr.length < 10) {
      console.error("WalletProvider: Invalid address received:", addr);
      return;
    }
    sessionStorage.setItem('walletConnected', 'true');
    sessionStorage.setItem('walletAddress', addr);
    sessionStorage.setItem('walletType', type);
    sessionStorage.removeItem('explicit_logout');
    setAddress(addr);
    setWalletType(type);
    setProvider(customProvider);
    setIsConnected(true);
  };

  const disconnect = async () => {
    console.log("WalletProvider: Strict logout initiated...");
    try {
      if (web3auth && web3auth.status === "connected") {
        await web3auth.logout({ cleanup: true });
      }
    } catch (error) {
      console.error("WalletProvider: Web3Auth logout error:", error);
    } finally {
      setIsConnected(false);
      setAddress('');
      setWalletType('');
      setProvider(null);
      sessionStorage.clear();
      localStorage.clear();
      sessionStorage.setItem('explicit_logout', 'true');
      document.cookie.split(";").forEach(c => { document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); });
      console.log("WalletProvider: Logout complete. Forcing reload.");
      window.location.replace('/connect');
    }
  };

  const loginWithSocial = async (loginProvider, extraOptions = {}) => {
    console.log(`WalletProvider: Attempting social login with ${loginProvider}.`);
    try {
      // If already connected, it can cause issues. Best to logout first.
      if (web3auth.status === "connected") {
        console.log("WalletProvider: Already connected, logging out before new social login.");
        await web3auth.logout();
      }

      // connectTo will open the popup
      const web3authProvider = await web3auth.connectTo(WALLET_ADAPTERS.AUTH, {
        loginProvider,
        extraLoginOptions: extraOptions.login_hint ? { login_hint: extraOptions.login_hint } : {},
      });

      if (!web3authProvider) {
        throw new Error("Web3Auth `connectTo` did not return a provider.");
      }

      // After a successful connection, the main web3auth instance has the provider.
      // It's often more reliable to use this instance's provider.
      const provider = web3auth.provider;
      if (!provider) {
        throw new Error("web3auth.provider is null after a successful connection.");
      }

      console.log("WalletProvider: Provider obtained. Requesting accounts...");
      const accounts = await provider.request({ method: "solana_getAccounts" });

      if (!accounts || accounts.length === 0) {
        throw new Error("Could not retrieve Solana accounts from the provider.");
      }

      const account = accounts[0];
      console.log(`WalletProvider: Social login successful! Account: ${account}`);
      
      // Set the state of the application
      connect(account, 'Social', provider);
      
      return account;

    } catch (error) {
      console.error(`WalletProvider: Social login failed for ${loginProvider}.`, error);
      
      // Web3Auth specific error code for user closing the modal.
      if (error.code === 4011) {
        console.log("User cancelled the login process.");
        // Return null to indicate a non-error cancellation.
        return null;
      }
      
      // Re-throw other errors to be caught by the UI.
      throw error;
    }
  };

  const connectEVMWallet = async (walletName) => {
    let targetProvider = null;
    console.log(`WalletProvider: Connecting to ${walletName}...`);

    if (walletName === 'Binance') {
      // 1. Check for Binance Extension
      targetProvider = window.BinanceChain;
      
      // 2. Check for Binance in multi-provider ethereum object
      if (!targetProvider && window.ethereum?.providers) {
        targetProvider = window.ethereum.providers.find(p => p.isBinance);
      }
      
      // 3. Check if current window.ethereum is Binance
      if (!targetProvider && window.ethereum?.isBinance) {
        targetProvider = window.ethereum;
      }

      if (!targetProvider) {
        console.log("Binance extension not found, falling back to WalletConnect.");
        return await connectWalletConnect('Binance');
      }
    } else if (walletName === 'MetaMask') {
      targetProvider = window.ethereum?.isMetaMask ? window.ethereum : window.ethereum?.providers?.find(p => p.isMetaMask);
      if (!targetProvider) {
        window.open('https://metamask.io/download/', '_blank');
        throw new Error("MetaMask not found");
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
      console.error(`Error connecting to ${walletName}:`, error);
      throw error;
    }
  };

  const connectWalletConnect = async (preferredWallet) => {
    try {
      console.log("WalletProvider: Initializing WalletConnect for", preferredWallet);
      
      const wcProvider = await EthereumProvider.init({
        projectId: WALLETCONNECT_PROJECT_ID,
        showQrModal: true,
        qrModalOptions: {
          themeMode: "light",
          // If Binance is preferred, we can try to hint it, though WC modal usually handles this
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
      console.error("WalletConnect error:", error);
      throw error;
    }
  };

  return (
    <WalletContext.Provider value={{ isConnected, address, walletType, isInitializing, connect, disconnect, loginWithSocial, connectEVMWallet, connectWalletConnect }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);
