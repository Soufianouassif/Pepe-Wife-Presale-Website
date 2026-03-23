import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { ConnectionProvider, WalletProvider as SolanaWalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl, Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Web3Auth } from "@web3auth/modal";
import { CHAIN_NAMESPACES } from "@web3auth/base";
import { SolanaPrivateKeyProvider } from "@web3auth/solana-provider";
import { EthereumPrivateKeyProvider } from "@web3auth/ethereum-provider";

// Import UI styles if needed
import '@solana/wallet-adapter-react-ui/styles.css';

const WalletContext = createContext();

const WEB3AUTH_CLIENT_ID = "BJILT6B9z2_gOIHCTrovzF2PLAbngM9-mgBSneY6eysUyuU-CU17mfX9_dFpAXGjAuE7bwgezUtOgXgV7ZK3w2E";

export const WalletProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState('');
  const [walletType, setWalletType] = useState('');
  const [web3auth, setWeb3auth] = useState(null);
  const [provider, setProvider] = useState(null);

  // Solana setup
  const network = WalletAdapterNetwork.Mainnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  useEffect(() => {
    const initWeb3Auth = async () => {
      try {
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
          web3AuthNetwork: "cyan", // Use 'cyan' or 'mainnet' based on your project settings
          chainConfig,
          privateKeyProvider: solanaPrivateKeyProvider,
        });

        await web3authInstance.initModal();
        setWeb3auth(web3authInstance);
        
        if (web3authInstance.provider) {
          setProvider(web3authInstance.provider);
        }
      } catch (error) {
        console.error("Web3Auth initialization failed:", error);
      }
    };

    initWeb3Auth();
  }, [endpoint]);

  // Use named functions for event listeners to avoid memory leaks
  const handleEthereumAccounts = (accounts) => {
    if (accounts.length > 0) {
      connect(accounts[0], 'MetaMask');
    } else {
      disconnect();
    }
  };

  const handleEthereumChain = () => window.location.reload();

  const handleSolanaAccount = (publicKey) => {
    if (publicKey) {
      connect(publicKey.toString(), 'Phantom');
    } else {
      disconnect();
    }
  };

  useEffect(() => {
    // Use sessionStorage for temporary session state (more secure than localStorage)
    const connected = sessionStorage.getItem('walletConnected') === 'true';
    const savedAddress = sessionStorage.getItem('walletAddress') || '';
    const savedType = sessionStorage.getItem('walletType') || '';
    
    setIsConnected(connected);
    setAddress(savedAddress);
    setWalletType(savedType);

    // Listen for MetaMask account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleEthereumAccounts);
      window.ethereum.on('chainChanged', handleEthereumChain);
    }

    // Listen for Phantom account changes
    if (window.solana) {
      window.solana.on('accountChanged', handleSolanaAccount);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleEthereumAccounts);
        window.ethereum.removeListener('chainChanged', handleEthereumChain);
      }
      if (window.solana) {
        window.solana.removeListener('accountChanged', handleSolanaAccount);
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
        if (!/^0x[a-fA-F0-9]{40}$/.test(to)) {
          throw new Error('Invalid Ethereum address');
        }

        // Convert amount to hex wei
        const value = (parseFloat(amount) * 1e18).toString(16);
        const params = [{
          from: address,
          to: to,
          value: '0x' + value,
        }];

        return await targetProvider.request({
          method: 'eth_sendTransaction',
          params,
        });
      } else if (walletType === 'Phantom') {
        const phantomProvider = window.phantom?.solana || window.solana;
        if (!phantomProvider) throw new Error('Solana provider not found');
        
        // Basic Solana address validation
        try {
          new PublicKey(to);
        } catch (e) {
          throw new Error('Invalid Solana address');
        }

        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: new PublicKey(address),
            toPubkey: new PublicKey(to),
            lamports: parseFloat(amount) * LAMPORTS_PER_SOL,
          })
        );

        const { signature } = await phantomProvider.signAndSendTransaction(transaction);
        return signature;
      } else if (walletType === 'Social') {
        if (!provider) throw new Error('Social login provider not found');
        
        // Web3Auth Solana Transaction
        const accounts = await provider.request({ method: "getAccounts" });
        const fromPubkey = new PublicKey(accounts[0]);
        
        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey,
            toPubkey: new PublicKey(to),
            lamports: parseFloat(amount) * LAMPORTS_PER_SOL,
          })
        );

        const connection = new Connection(endpoint);
        const { blockhash } = await connection.getLatestBlockhash();
        transaction.recentBlockhash = blockhash;
        transaction.feePayer = fromPubkey;

        const signedTx = await provider.request({
          method: "signTransaction",
          params: { transaction: transaction.serialize({ verifySignatures: false }).toString("base64") },
        });

        const signature = await connection.sendRawTransaction(Buffer.from(signedTx, "base64"));
        return signature;
      }
    } catch (error) {
      // Map common error codes to user-friendly messages
      if (error.code === 4001) {
        throw new Error('USER_REJECTED');
      }
      console.error('Transaction failed:', error);
      throw error;
    }
  };

  const loginWithSocial = async () => {
    if (!web3auth) return;
    try {
      const web3authProvider = await web3auth.connect();
      setProvider(web3authProvider);
      
      const accounts = await web3authProvider.request({ method: "getAccounts" });
      if (accounts && accounts.length > 0) {
        connect(accounts[0], 'Social', web3authProvider);
        return accounts[0];
      }
    } catch (error) {
      console.error("Social login failed:", error);
      throw error;
    }
  };

  return (
    <ConnectionProvider endpoint={endpoint}>
      <SolanaWalletProvider wallets={wallets} autoConnect>
        <WalletContext.Provider value={{ isConnected, address, walletType, provider, connect, disconnect, sendTransaction, loginWithSocial }}>
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
