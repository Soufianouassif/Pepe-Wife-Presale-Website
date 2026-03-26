import React from 'react';
import { Navigate } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';

const ProtectedRoute = ({ children }) => {
  const { isConnected, isInitializing } = useWallet();
  const [isChecking, setIsChecking] = React.useState(true);

  React.useEffect(() => {
    // Wait for context to finish initializing OR timeout
    if (!isInitializing) {
      setIsChecking(false);
    }
    
    // Fallback timer just in case
    const timer = setTimeout(() => setIsChecking(false), 2000);
    return () => clearTimeout(timer);
  }, [isInitializing]);

  if (isChecking || isInitializing) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-pepe-black border-t-pepe-pink rounded-full animate-spin" />
      </div>
    );
  }

  // Double check with storage to prevent flickering
  const isStoredConnected = sessionStorage.getItem('walletConnected') === 'true';

  // If the wallet is not connected, redirect to the connect page
  if (!isConnected && !isStoredConnected) {
    return <Navigate to="/connect" replace />;
  }

  // If connected, render the child component (e.g., Dashboard)
  return children;
};

export default ProtectedRoute;
