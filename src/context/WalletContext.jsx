import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
import { ConnectionProvider, WalletProvider as SolanaWalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl, Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Web3Auth } from "@web3auth/modal";
import { CHAIN_NAMESPACES, WALLET_ADAPTERS } from "@web3auth/base";
import { SolanaPrivateKeyProvider } from "@web3auth/solana-provider";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";

// Import UI styles if needed
import '@solana/wallet-adapter-react-ui/styles.css';

const WalletContext = createContext();

const WEB3AUTH_CLIENT_ID = "BJILT6B9z2_gOIHCTrovzF2PLAbngM9-mgBSneY6eysUyuU-CU17mfX9_dFpAXGjAuE7bwgezUtOgXgV7ZK3w2E";
const WALLETCONNECT_PROJECT_ID = "90be08cc5b7174d4051d2de451af0d9b";

export const WalletProvider = ({ children }) => {
  console.log("WalletProvider: Initializing state...");
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState('');
  const [walletType, setWalletType] = useState('');
  const [web3auth, setWeb3auth] = useState(null);
  const [provider, setProvider] = useState(null);
  const [isInitializing, setIsInitializing] = useState(true);

  // Refs for stable event handlers
  const addressRef = useRef('');
  const isConnectedRef = useRef(false);

  useEffect(() => {
    addressRef.current = address;
    isConnectedRef.current = isConnected;
  }, [address, isConnected]);

  // Solana setup
  const network = WalletAdapterNetwork.Mainnet;
  const endpoint = useMemo(() => {
    try {
      return clusterApiUrl(network);
    } catch (e) {
      console.error("WalletProvider: Failed to get cluster API URL", e);
      return "";
    }
  }, [network]);

  const wallets = useMemo(() => {
    try {
      return [new PhantomWalletAdapter()];
    } catch (e) {
      console.error("WalletProvider: Failed to initialize Phantom adapter", e);
      return [];
    }
  }, []);

  useEffect(() => {
    const initWeb3Auth = async () => {
      try {
        setIsInitializing(true);
        console.log("WalletProvider: Initializing Web3Auth...");
        const chainConfig = {
          chainNamespace: CHAIN_NAMESPACES.SOLANA,
          chainId: "0x1", // Mainnet
          rpcTarget: endpoint,
          displayName: "Solana Mainnet",
          blockExplorer: "https://explorer.solana.com",
          ticker: "SOL",
          tickerName: "Solana",
        };

        const solanaPrivateKeyProvider = new SolanaPrivateKeyProvider({
          config: { chainConfig },
        });

        const web3authInstance = new Web3Auth({
          clientId: WEB3AUTH_CLIENT_ID,
          web3AuthNetwork: "cyan",
          chainConfig,
          privateKeyProvider: solanaPrivateKeyProvider,
        });

        await web3authInstance.initModal();
        setWeb3auth(web3authInstance);
        
        if (web3authInstance.provider) {
          setProvider(web3authInstance.provider);
        }
        console.log("WalletProvider: Web3Auth initialized.");
      } catch (error) {
        console.error("WalletProvider: Web3Auth initialization failed:", error);
      } finally {
        setIsInitializing(false);
      }
    };

    if (endpoint) initWeb3Auth();
  }, [endpoint]);

  const handleEthereumAccounts = (accounts) => {
    console.log("Ethereum accounts changed:", accounts);
    if (Array.isArray(accounts) && accounts.length > 0) {
      if (addressRef.current !== accounts[0]) {
        connect(accounts[0], 'MetaMask');
      }
    } else {
      if (isConnectedRef.current) {
        disconnect();
      }
    }
  };

  const handleEthereumChain = (chainId) => {
    console.log("Ethereum chain changed:", chainId);
    const lastChainId = sessionStorage.getItem('lastChainId');
    if (lastChainId && lastChainId !== chainId) {
      sessionStorage.setItem('lastChainId', chainId);
      window.location.reload();
    } else if (!lastChainId) {
      sessionStorage.setItem('lastChainId', chainId);
    }
  };

  const handleSolanaAccount = (publicKey) => {
    console.log("Solana account changed:", publicKey?.toString());
    const pubKeyStr = publicKey?.toString();
    if (pubKeyStr) {
      if (addressRef.current !== pubKeyStr) {
        connect(pubKeyStr, 'Phantom');
      }
    } else {
      if (isConnectedRef.current) {
        disconnect();
      }
    }
  };

  useEffect(() => {
    // Use sessionStorage for temporary session state (more secure than localStorage)
    let connected = false;
    let savedAddress = '';
    let savedType = '';
    
    try {
      connected = sessionStorage.getItem('walletConnected') === 'true';
      savedAddress = sessionStorage.getItem('walletAddress') || '';
      savedType = sessionStorage.getItem('walletType') || '';
    } catch (e) {
      console.warn("Storage access failed:", e);
    }
    
    setIsConnected(connected);
    setAddress(savedAddress);
    setWalletType(savedType);

    // Safe MetaMask/Ethereum event listeners
    const registerEthereumEvents = (ethProvider) => {
      if (ethProvider && typeof ethProvider.on === 'function') {
        try {
          // Check if it's already registered to avoid duplicates
          ethProvider.on('accountsChanged', handleEthereumAccounts);
          ethProvider.on('chainChanged', handleEthereumChain);
        } catch (e) {
          console.warn("Failed to register Ethereum events for provider:", e);
        }
      }
    };

    const unregisterEthereumEvents = (ethProvider) => {
      if (ethProvider && typeof ethProvider.removeListener === 'function') {
        try {
          ethProvider.removeListener('accountsChanged', handleEthereumAccounts);
          ethProvider.removeListener('chainChanged', handleEthereumChain);
        } catch (e) {
          console.warn("Failed to unregister Ethereum events for provider:", e);
        }
      }
    };

    const eth = window.ethereum;
    if (eth) {
      if (Array.isArray(eth.providers)) {
        eth.providers.forEach(registerEthereumEvents);
      } else {
        registerEthereumEvents(eth);
      }
    }

    // Listen for Phantom account changes
    if (window.solana && typeof window.solana.on === 'function') {
      try {
        window.solana.on('accountChanged', handleSolanaAccount);
      } catch (e) {
        console.warn("Failed to register Solana events:", e);
      }
    }

    return () => {
      if (window.ethereum) {
        if (window.ethereum.providers) {
          window.ethereum.providers.forEach(unregisterEthereumEvents);
        } else {
          unregisterEthereumEvents(window.ethereum);
        }
      }
      if (window.solana && typeof window.solana.removeListener === 'function') {
        try {
          window.solana.removeListener('accountChanged', handleSolanaAccount);
        } catch (e) {
          console.warn("Failed to unregister Solana events:", e);
        }
      }
    };
  }, []);

  const connect = (addr, type, customProvider = null) => {
    sessionStorage.setItem('walletConnected', 'true');
    sessionStorage.setItem('walletAddress', addr);
    sessionStorage.setItem('walletType', type);
    setIsConnected(true);
    setAddress(addr);
    setWalletType(type);
    if (customProvider) setProvider(customProvider);
  };

  const disconnect = async () => {
    if (web3auth && web3auth.connected) {
      await web3auth.logout();
    }
    sessionStorage.removeItem('walletConnected');
    sessionStorage.removeItem('walletAddress');
    sessionStorage.removeItem('walletType');
    setIsConnected(false);
    setAddress('');
    setWalletType('');
    setProvider(null);
  };

  const sendTransaction = async (to, amount, currency) => {
    if (!isConnected) throw new Error('Wallet not connected');

    try {
      if (walletType === 'MetaMask' || walletType === 'Trust' || walletType === 'Binance' || walletType === 'OKX') {
        const targetProvider = walletType === 'OKX' ? window.okxwallet : (walletType === 'Binance' ? window.BinanceChain : window.ethereum);
        if (!targetProvider) throw new Error(`${walletType} provider not found`);
        
        // Basic Ethereum address validation
        if (!to || typeof to !== 'string' || !/^0x[a-fA-F0-9]{40}$/.test(to)) {
          throw new Error('Invalid Ethereum address');
        }

        // Convert amount to hex wei
        const parsedAmount = parseFloat(amount || '0');
        const value = isNaN(parsedAmount) ? '0' : (parsedAmount * 1e18).toString(16);
        const params = [{
          from: address,
          to: to,
          value: '0x' + value,
        }];

        await targetProvider.request({
          method: 'eth_sendTransaction',
          params,
        });
      } else if (walletType === 'Phantom') {
        const phantomProvider = window.phantom?.solana || window.solana;
        if (!phantomProvider) throw new Error('Phantom provider not found');

        const connection = new Connection(endpoint, 'confirmed');
        const fromPubkey = address ? new PublicKey(address) : null;
        if (!fromPubkey) throw new Error('Source address not found');
        
        const toPubkey = to ? new PublicKey(to) : null;
        if (!toPubkey) throw new Error('Invalid recipient address');

        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey,
            toPubkey,
            lamports: parseFloat(amount) * LAMPORTS_PER_SOL,
          })
        );

        const { blockhash } = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = fromPubkey;

        const { signature } = await phantomProvider.signAndSendTransaction(transaction);
        await connection.confirmTransaction(signature);
      } else if (walletType === 'Social' && provider) {
        // Handle social wallet transaction via provider
        console.log("Social wallet transaction not fully implemented in this demo");
      }
    } catch (error) {
      console.error('Transaction failed:', error);
      throw error;
    }
  };

  const loginWithSocial = async (loginProvider = null) => {
    if (!web3auth) {
      console.error("WalletProvider: Web3Auth not initialized yet");
      throw new Error("Login system is still loading. Please wait a moment.");
    }
    
    try {
      console.log(`WalletProvider: Initiating ${loginProvider || 'modal'} login...`);
      let web3authProvider;
      
      if (loginProvider) {
        // Direct OAuth login (e.g., 'google', 'twitter')
        web3authProvider = await web3auth.connectTo(WALLET_ADAPTERS.OPENLOGIN, {
          loginSettings: {
            loginProvider,
          },
        });
      } else {
        // Open Web3Auth Modal
        web3authProvider = await web3auth.connect();
      }

      if (!web3authProvider) {
        throw new Error("Failed to get provider from Web3Auth");
      }

      setProvider(web3authProvider);
      
      // Get accounts - handle both SOL and ETH namespaces if needed
      // For now, sticking to the initialized namespace (Solana)
      const accounts = await web3authProvider.request({ method: "getAccounts" });
      console.log("WalletProvider: Social login accounts:", accounts);
      
      if (accounts && accounts.length > 0) {
        connect(accounts[0], 'Social', web3authProvider);
        return accounts[0];
      } else {
        throw new Error("No accounts found for this social login");
      }
    } catch (error) {
      console.error(`WalletProvider: Social login (${loginProvider || 'modal'}) failed:`, error);
      throw error;
    }
  };

  const connectEVMWallet = async (walletName) => {
    console.log(`WalletProvider: Connecting to ${walletName}...`);
    let targetProvider = null;
    
    if (walletName === 'MetaMask') {
      targetProvider = window.ethereum?.providers?.find(p => p.isMetaMask) || window.ethereum;
    } else if (walletName === 'Binance') {
      // If Binance extension exists (legacy)
      targetProvider = window.BinanceChain || window.ethereum?.isBinance || window.ethereum?.providers?.find(p => p.isBinance);
    } else if (walletName === 'OKX') {
      targetProvider = window.okxwallet;
    } else if (walletName === 'Trust') {
      targetProvider = window.ethereum?.isTrust || window.ethereum?.providers?.find(p => p.isTrust);
    }

    if (!targetProvider) {
      // If it's Binance and no extension, we suggest WalletConnect
      if (walletName === 'Binance') {
        return await connectWalletConnect('Binance');
      }
      throw new Error(`${walletName} wallet not found. Please install the extension.`);
    }

    try {
      const accounts = await targetProvider.request({ method: 'eth_requestAccounts' });
      if (accounts && accounts.length > 0) {
        connect(accounts[0], walletName, targetProvider);
        return accounts[0];
      }
      throw new Error("No accounts returned from wallet");
    } catch (error) {
      console.error(`WalletProvider: ${walletName} connection failed:`, error);
      throw error;
    }
  };

  const connectWalletConnect = async (preferredWallet = 'Generic') => {
    console.log("WalletProvider: Initiating WalletConnect...");
    try {
      // Dynamic import to avoid build errors and optimize bundle
      const { EthereumProvider } = await import('@walletconnect/ethereum-provider');
      
      const providerWC = await EthereumProvider.init({
        projectId: WALLETCONNECT_PROJECT_ID,
        showQrModal: true,
        chains: [56], // BSC Mainnet for Binance
        methods: ["eth_sendTransaction", "personal_sign"],
        events: ["chainChanged", "accountsChanged"],
      });

      await providerWC.connect();
      const accounts = providerWC.accounts;
      
      if (accounts && accounts.length > 0) {
        connect(accounts[0], preferredWallet, providerWC);
        return accounts[0];
      }
    } catch (error) {
      console.error("WalletProvider: WalletConnect error:", error);
      throw error;
    }
  };

  return (
    <ConnectionProvider endpoint={endpoint}>
      <SolanaWalletProvider wallets={wallets} autoConnect>
        <WalletContext.Provider value={{ 
          isConnected, 
          address, 
          walletType, 
          provider, 
          isInitializing,
          connect, 
          disconnect, 
          sendTransaction, 
          loginWithSocial,
          connectEVMWallet,
          connectWalletConnect
        }}>
          {children}
        </WalletContext.Provider>
      </SolanaWalletProvider>
    </ConnectionProvider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
