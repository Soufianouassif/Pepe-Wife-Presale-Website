import React from 'react';
import { Navigate } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';

const ProtectedRoute = ({ children }) => {
  const { isConnected } = useWallet();
  const [isChecking, setIsChecking] = React.useState(true);

  React.useEffect(() => {
    // Small delay to allow session to be read from storage
    const timer = setTimeout(() => setIsChecking(false), 100);
    return () => clearTimeout(timer);
  }, []);

  if (isChecking) {
    return null; // Or a loading spinner
  }

  // If the wallet is not connected, redirect to the connect page
  if (!isConnected) {
    return <Navigate to="/connect" replace />;
  }

  // If connected, render the child component (e.g., Dashboard)
  return children;
};

export default ProtectedRoute;
