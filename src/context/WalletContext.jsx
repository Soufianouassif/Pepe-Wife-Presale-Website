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
    try {
      const web3authProvider = await web3auth.connectTo(WALLET_ADAPTERS.AUTH, { loginProvider, extraLoginOptions: extraOptions.login_hint ? { login_hint: extraOptions.login_hint } : {} });
      if (!web3authProvider) throw new Error("Provider not returned from Web3Auth");
      
      // Multi-stage account retrieval
      let account = "";
      try {
        const accounts = await web3authProvider.request({ method: "solana_getAccounts" });
        if (Array.isArray(accounts) && accounts.length > 0) account = accounts[0];
      } catch (e) {
        console.warn("solana_getAccounts failed, trying generic getAccounts");
        try {
          const accounts = await web3authProvider.request({ method: "getAccounts" });
          if (Array.isArray(accounts) && accounts.length > 0) account = accounts[0];
        } catch (e2) {
          console.error("All account retrieval methods failed");
        }
      }

      if (!account) throw new Error("No accounts returned");
      connect(accounts[0], 'Social', web3authProvider);
      return accounts[0];
    } catch (error) {
      console.error(`Social login error (${loginProvider}):`, error);
      throw error;
    }
  };

  const connectEVMWallet = async (walletName) => {
    let targetProvider = null;
    if (walletName === 'Binance') {
      targetProvider = window.BinanceChain || window.ethereum?.providers?.find(p => p.isBinance) || (window.ethereum?.isBinance && window.ethereum);
      if (!targetProvider) {
        console.log("Binance extension not found, falling back to WalletConnect.");
        return await connectWalletConnect('Binance');
      }
    } else {
      // Simplified logic for other EVM wallets
    }
    
    try {
      const accounts = await targetProvider.request({ method: 'eth_requestAccounts' });
      
      // Pre-emptive validation to prevent slice errors downstream
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
    // WalletConnect logic remains largely the same
  };

  return (
    <WalletContext.Provider value={{ isConnected, address, walletType, isInitializing, connect, disconnect, loginWithSocial, connectEVMWallet, connectWalletConnect }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);
