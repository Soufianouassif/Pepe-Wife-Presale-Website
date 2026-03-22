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
  };

  const sendTransaction = async (to, amount, currency) => {
    if (!isConnected) throw new Error('Wallet not connected');

    try {
      if (walletType === 'MetaMask' || walletType === 'Trust') {
        if (!window.ethereum) throw new Error('Ethereum provider not found');
        
        // Convert amount to hex wei
        const value = (parseFloat(amount) * 1e18).toString(16);
        const params = [{
          from: address,
          to: to,
          value: '0x' + value,
        }];

        return await window.ethereum.request({
          method: 'eth_sendTransaction',
          params,
        });
      } else if (walletType === 'Phantom') {
        if (!window.solana) throw new Error('Solana provider not found');
        
        // This is a simplified Solana transfer for demonstration
        // In a real app, you'd use @solana/web3.js to build a transaction
        const { Transaction, SystemProgram, LAMPORTS_PER_SOL, PublicKey } = await import('@solana/web3.js');
        const transaction = new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: new PublicKey(address),
            toPubkey: new PublicKey(to),
            lamports: parseFloat(amount) * LAMPORTS_PER_SOL,
          })
        );

        const { signature } = await window.solana.signAndSendTransaction(transaction);
        return signature;
      }
    } catch (error) {
      console.error('Transaction failed:', error);
      throw error;
    }
  };

  return (
    <ConnectionProvider endpoint={endpoint}>
      <SolanaWalletProvider wallets={wallets} autoConnect>
        <WalletContext.Provider value={{ isConnected, address, walletType, connect, disconnect, sendTransaction }}>
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
