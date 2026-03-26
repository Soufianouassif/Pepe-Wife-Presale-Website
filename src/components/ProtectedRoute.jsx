import React from 'react';
import { Navigate } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';

const ProtectedRoute = ({ children }) => {
  const { isConnected, isInitializing } = useWallet();

  if (isInitializing) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-pepe-black border-t-pepe-pink rounded-full animate-spin" />
      </div>
    );
  }

  // If the wallet is not connected, redirect to the connect page
  if (!isConnected) {
    return <Navigate to="/connect" replace />;
  }

  // If connected, render the child component (e.g., Dashboard)
  return children;
};

export default ProtectedRoute;
