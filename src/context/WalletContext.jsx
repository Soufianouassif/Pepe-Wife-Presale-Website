import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { ConnectionProvider, WalletProvider as SolanaWalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';

// Import UI styles if needed
import '@solana/wallet-adapter-react-ui/styles.css';

const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState('');
  const [walletType, setWalletType] = useState('');

  // Solana setup
  const network = WalletAdapterNetwork.Mainnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const wallets = useMemo(() => [new PhantomWalletAdapter()], []);

  useEffect(() => {
    const connected = localStorage.getItem('walletConnected') === 'true';
    const savedAddress = localStorage.getItem('walletAddress') || '';
    const savedType = localStorage.getItem('walletType') || '';
    
    setIsConnected(connected);
    setAddress(savedAddress);
    setWalletType(savedType);

    // Listen for MetaMask account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length > 0) {
          connect(accounts[0], 'MetaMask');
        } else {
          disconnect();
        }
      });
      window.ethereum.on('chainChanged', () => window.location.reload());
    }

    // Listen for Phantom account changes
    if (window.solana) {
      window.solana.on('accountChanged', (publicKey) => {
        if (publicKey) {
          connect(publicKey.toString(), 'Phantom');
        } else {
          disconnect();
        }
      });
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', () => {});
        window.ethereum.removeListener('chainChanged', () => {});
      }
      if (window.solana) {
        window.solana.removeListener('accountChanged', () => {});
      }
    };
  }, []);

  const connect = (addr, type) => {
    localStorage.setItem('walletConnected', 'true');
    localStorage.setItem('walletAddress', addr);
    localStorage.setItem('walletType', type);
    setIsConnected(true);
    setAddress(addr);
    setWalletType(type);
  };

  const disconnect = () => {
    localStorage.removeItem('walletConnected');
    localStorage.removeItem('walletAddress');
    localStorage.removeItem('walletType');
    setIsConnected(false);
    setAddress('');
    setWalletType('');
    
    // If Phantom is connected via window object, we can't easily force disconnect 
    // without the adapter, but for our app state we clear it.
  };

  return (
    <ConnectionProvider endpoint={endpoint}>
      <SolanaWalletProvider wallets={wallets} autoConnect>
        <WalletContext.Provider value={{ isConnected, address, walletType, connect, disconnect }}>
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
