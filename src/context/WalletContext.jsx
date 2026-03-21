import React, { createContext, useContext, useState, useEffect } from 'react';

const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState('');
  const [walletType, setWalletType] = useState('');

  useEffect(() => {
    const connected = localStorage.getItem('walletConnected') === 'true';
    const savedAddress = localStorage.getItem('walletAddress') || '';
    const savedType = localStorage.getItem('walletType') || '';
    
    setIsConnected(connected);
    setAddress(savedAddress);
    setWalletType(savedType);
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

  return (
    <WalletContext.Provider value={{ isConnected, address, walletType, connect, disconnect }}>
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};
