import React from 'react';
import { Navigate } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';

const ProtectedRoute = ({ children }) => {
  const { isConnected } = useWallet();

  // If the wallet is not connected, redirect to the connect page
  if (!isConnected) {
    return <Navigate to="/connect" replace />;
  }

  // If connected, render the child component (e.g., Dashboard)
  return children;
};

export default ProtectedRoute;
