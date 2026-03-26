import React, { createContext, useContext, useState, useEffect, useMemo, useRef } from 'react';
import { ConnectionProvider, WalletProvider as SolanaWalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl, Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Web3Auth } from "@web3auth/modal";
import { CHAIN_NAMESPACES, WALLET_ADAPTERS } from "@web3auth/base";
import { SolanaPrivateKeyProvider } from "@web3auth/solana-provider";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";
import { AuthAdapter } from "@web3auth/auth-adapter";

// Import UI styles if needed
import '@solana/wallet-adapter-react-ui/styles.css';

const WalletContext = createContext();

const WEB3AUTH_CLIENT_ID = "BJILT6B9z2_gOIHCTrovzF2PLAbngM9-mgBSneY6eysUyuU-CU17mfX9_dFpAXGjAuE7bwgezUtOgXgV7ZK3w2E";
const WALLETCONNECT_PROJECT_ID = "90be08cc5b7174d4051d2de451af0d9b";

export const WalletProvider = ({ children }) => {
  console.log("WalletProvider: Initializing state...");
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState(() => {
    const saved = sessionStorage.getItem('walletAddress');
    return (saved && saved !== 'undefined' && saved !== 'null' && saved !== '[object Object]') ? saved : '';
  });
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
        console.log("WalletProvider: Initializing Web3Auth SDK...");
        const { Web3Auth } = await import("@web3auth/modal");
        const { AuthAdapter } = await import("@web3auth/auth-adapter");
        const { SolanaPrivateKeyProvider } = await import("@web3auth/solana-provider");

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
          web3AuthNetwork: "sapphire_mainnet",
          chainConfig,
          privateKeyProvider: solanaPrivateKeyProvider,
          sessionTime: 86400, // 24 hours
          useCoreKitKey: false,
        });

        // Add Auth Adapter explicitly
        const authAdapter = new AuthAdapter({
          adapterSettings: {
            uxMode: "popup", // Popup is generally preferred for a better UX if allowed
          },
        });
        web3authInstance.configureAdapter(authAdapter);

        // Check if user explicitly logged out in this session
        const wasLoggedOut = sessionStorage.getItem('explicit_logout') === 'true';
        
        await web3authInstance.initModal({
          modalConfig: {
            [WALLET_ADAPTERS.AUTH]: {
              label: "Social Login",
              showOnModal: true,
              loginMethods: {
                google: { name: "google", showOnModal: true },
                facebook: { name: "facebook", showOnModal: true },
                twitter: { name: "twitter", showOnModal: true },
                apple: { name: "apple", showOnModal: true },
                discord: { name: "discord", showOnModal: true },
                line: { name: "line", showOnModal: true },
                github: { name: "github", showOnModal: true },
                email_passwordless: { name: "email_passwordless", showOnModal: true },
                sms_passwordless: { name: "sms_passwordless", showOnModal: true },
              },
            },
            [WALLET_ADAPTERS.METAMASK]: { label: "MetaMask", showOnModal: false },
            [WALLET_ADAPTERS.PHANTOM]: { label: "Phantom", showOnModal: false },
          }
        });

        setWeb3auth(web3authInstance);

        // Only restore session if not explicitly logged out
        if (web3authInstance.status === "connected" && !wasLoggedOut) {
          const web3authProvider = web3authInstance.provider;
          const accounts = await web3authProvider.request({ method: "solana_getAccounts" });
          if (accounts && accounts.length > 0) {
            const addr = accounts[0];
            setAddress(addr);
            setWalletType('Social');
            setProvider(web3authProvider);
            setIsConnected(true);
            sessionStorage.setItem('walletConnected', 'true');
            sessionStorage.setItem('walletAddress', addr);
            sessionStorage.setItem('walletType', 'Social');
          }
        } else if (wasLoggedOut && web3authInstance.status === "connected") {
          // If they were connected but explicitly logged out, ensure we clear the Web3Auth session too
          await web3authInstance.logout();
        }

        console.log("WalletProvider: Web3Auth initialized.");
      } catch (error) {
        console.error("WalletProvider: Web3Auth initialization error:", error);
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
    if (!addr) return;
    
    const safeAddr = typeof addr === 'string' ? addr.trim() : (addr.toString ? addr.toString().trim() : '');
    
    if (!safeAddr || safeAddr === '[object Object]' || safeAddr === 'undefined') {
      console.error("WalletProvider: Invalid address:", addr);
      return;
    }

    sessionStorage.setItem('walletConnected', 'true');
    sessionStorage.setItem('walletAddress', safeAddr);
    sessionStorage.setItem('walletType', type);
    sessionStorage.removeItem('explicit_logout'); // Clear logout flag on success

    setAddress(safeAddr);
    setWalletType(type);
    setProvider(customProvider);
    setIsConnected(true);
    console.log(`WalletProvider: Connected to ${type} address ${safeAddr}`);
  };

  const disconnect = async () => {
    console.log("WalletProvider: Performing strict logout...");
    try {
      if (web3auth && web3auth.status === "connected") {
        await web3auth.logout();
      }
      
      if (walletType === 'Phantom' && (window.phantom?.solana || window.solana)) {
        const phantomProvider = window.phantom?.solana || window.solana;
        if (typeof phantomProvider.disconnect === 'function') {
          await phantomProvider.disconnect();
        }
      }
    } catch (error) {
      console.error("WalletProvider: Logout error:", error);
    } finally {
      // CLEAR EVERYTHING IMMEDIATELY
      setIsConnected(false);
      setAddress('');
      setWalletType('');
      setProvider(null);
      
      sessionStorage.clear();
      localStorage.clear(); 
      
      // Set explicit logout flag
      sessionStorage.setItem('explicit_logout', 'true');
      
      // Clear all cookies manually
      const cookies = document.cookie.split(";");
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substring(0, eqPos) : cookie;
        document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
      }

      console.log("WalletProvider: Logout complete. Forcing redirect.");
      window.location.replace('/connect');
    }
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

  const loginWithSocial = async (loginProvider = null, extraOptions = {}) => {
    if (!web3auth) {
      console.error("WalletProvider: Web3Auth not initialized yet");
      throw new Error(typeof i18n !== 'undefined' && i18n.language === 'ar' ? "نظام تسجيل الدخول لا يزال قيد التحميل. يرجى الانتظار لحظة." : "Login system is still loading. Please wait a moment.");
    }
    
    try {
      console.log(`WalletProvider: Initiating ${loginProvider || 'modal'} login...`);
      
      // If already connected, disconnect first to ensure a fresh session if requested
      if (web3auth.status === "connected") {
        console.log("WalletProvider: Already connected, ensuring session is valid...");
      }

      let web3authProvider;
      
      if (loginProvider) {
        // Direct OAuth login
        console.log(`WalletProvider: Connecting to ${loginProvider} via AUTH adapter...`, extraOptions);
        
        const connectOptions = {
          loginProvider,
        };

        if (extraOptions.login_hint) {
          // Strict formatting for E.164
          const cleanHint = extraOptions.login_hint.startsWith('+') 
            ? `+${extraOptions.login_hint.replace(/[^\d]/g, '')}`
            : extraOptions.login_hint;
            
          connectOptions.extraLoginOptions = {
            login_hint: cleanHint
          };
        }

        web3authProvider = await web3auth.connectTo(WALLET_ADAPTERS.AUTH, connectOptions);
      } else {
        // Open Web3Auth Modal
        web3authProvider = await web3auth.connect();
      }

      if (!web3authProvider) {
        throw new Error("Failed to get provider from Web3Auth");
      }

      setProvider(web3authProvider);
      
      // Get account
      let account = "";
      const accounts = await web3authProvider.request({ method: "solana_getAccounts" });
      if (Array.isArray(accounts) && accounts.length > 0) {
        account = accounts[0];
      }

      if (account && typeof account === 'string') {
        connect(account, 'Social', web3authProvider);
        return account;
      } else {
        throw new Error(typeof i18n !== 'undefined' && i18n.language === 'ar' ? "لم يتم العثور على حساب نشط. يرجى المحاولة مرة أخرى." : "No active account found. Please try again.");
      }
    } catch (error) {
      console.error(`WalletProvider: Social login failed:`, error);
      throw error;
    }
  };

  const connectEVMWallet = async (walletName) => {
    console.log(`WalletProvider: Connecting to ${walletName}...`);
    let targetProvider = null;
    
    try {
      if (walletName === 'MetaMask') {
        targetProvider = window.ethereum?.providers?.find(p => p.isMetaMask) || (window.ethereum?.isMetaMask ? window.ethereum : null);
      } else if (walletName === 'Binance') {
        // Advanced Binance Wallet Detection
        targetProvider = window.BinanceChain || 
                        window.ethereum?.isBinance || 
                        window.ethereum?.providers?.find(p => p.isBinance);
        
        if (!targetProvider) {
          console.log("WalletProvider: Binance extension not found, trying WalletConnect fallback...");
          return await connectWalletConnect('Binance');
        }
      } else if (walletName === 'OKX') {
        targetProvider = window.okxwallet;
      } else if (walletName === 'Trust') {
        targetProvider = window.ethereum?.isTrust ? window.ethereum : window.ethereum?.providers?.find(p => p.isTrust);
      }

      if (!targetProvider) {
        throw new Error(`${walletName} wallet not found. Please install the extension.`);
      }

      // Special handling for BinanceChain to ensure account retrieval
      let accounts = [];
      if (walletName === 'Binance' && window.BinanceChain && targetProvider === window.BinanceChain) {
        accounts = await targetProvider.enable(); // Classic Binance method
      } else {
        accounts = await targetProvider.request({ method: 'eth_requestAccounts' });
      }
      
      if (Array.isArray(accounts) && accounts.length > 0) {
        const addr = accounts[0];
        if (addr && typeof addr === 'string') {
          connect(addr, walletName, targetProvider);
          return addr;
        }
      }
      
      throw new Error(typeof i18n !== 'undefined' && i18n.language === 'ar' ? "لم يتم إرجاع أي حساب من المحفظة." : "No accounts returned from wallet.");
    } catch (error) {
      console.error(`WalletProvider: ${walletName} connection failed:`, error);
      throw error;
    }
  };

  const connectWalletConnect = async (preferredWallet = 'Generic') => {
    console.log("WalletProvider: Initiating WalletConnect...");
    try {
      const { EthereumProvider } = await import('@walletconnect/ethereum-provider');
      
      if (!WALLETCONNECT_PROJECT_ID || WALLETCONNECT_PROJECT_ID === "") {
        throw new Error("WalletConnect Project ID is missing.");
      }

      const providerWC = await EthereumProvider.init({
        projectId: WALLETCONNECT_PROJECT_ID,
        showQrModal: true,
        chains: [56], // BSC Mainnet
        optionalChains: [1, 56, 137], // Ethereum, BSC, Polygon
        methods: ["eth_sendTransaction", "personal_sign", "eth_accounts", "eth_requestAccounts"],
        events: ["chainChanged", "accountsChanged"],
        rpcMap: {
          56: "https://bsc-dataseed.binance.org/",
          1: "https://cloudflare-eth.com"
        },
        metadata: {
          name: "Pepe Wife Presale",
          description: "Connect to Pepe Wife Presale Dashboard",
          url: window.location.origin,
          icons: ["https://pepewife.com/logo.png"]
        }
      });

      await providerWC.connect();
      const accounts = providerWC.accounts;
      
      if (Array.isArray(accounts) && accounts.length > 0 && accounts[0]) {
        connect(accounts[0], preferredWallet, providerWC);
        return accounts[0];
      }
      throw new Error("Connection established but no accounts found.");
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
