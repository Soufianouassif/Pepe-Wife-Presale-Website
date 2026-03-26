import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { WalletProvider } from './context/WalletContext';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import ConnectPage from './pages/ConnectPage';
import LoadingPage from './pages/LoadingPage';
import AdminPage from './pages/AdminPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  console.log("App: Component rendering...");
  const { i18n, ready } = useTranslation();
  
  if (!ready) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-pepe-black border-t-pepe-yellow rounded-full animate-spin" />
      </div>
    );
  }

  console.log("App: i18n language is", i18n.language);
  const isRTL = i18n.language?.startsWith('ar');
  const [viewMode, setViewMode] = useState(() => {
    try {
      return localStorage.getItem('viewMode') || 'mobile';
    } catch (e) {
      return 'mobile';
    }
  });
  console.log("App: viewMode is", viewMode);

  useEffect(() => {
    // ...
    // Persist language choice
    try {
      localStorage.setItem('i18nextLng', i18n.language);
    } catch (e) {}
  }, [i18n.language, isRTL]);

  useEffect(() => {
    try {
      const storedMode = localStorage.getItem('viewMode');
      if (storedMode !== viewMode) {
        localStorage.setItem('viewMode', viewMode);
        // Only dispatch if it's actually changing to inform OTHER tabs/components
        window.dispatchEvent(new Event('viewModeChanged'));
      }
    } catch (e) {}
  }, [viewMode]);

  // Listen for view mode changes from other components/tabs
  useEffect(() => {
    const handleViewChange = () => {
      try {
        const newMode = localStorage.getItem('viewMode');
        if (newMode && newMode !== viewMode) {
          setViewMode(newMode);
        }
      } catch (e) {}
    };
    window.addEventListener('viewModeChanged', handleViewChange);
    window.addEventListener('storage', handleViewChange); // Also handle storage changes from other tabs
    return () => {
      window.removeEventListener('viewModeChanged', handleViewChange);
      window.removeEventListener('storage', handleViewChange);
    };
  }, [viewMode]);

  return (
    <WalletProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/connect" element={<ConnectPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/loading" element={<ProtectedRoute><LoadingPage /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </WalletProvider>
  );
}

export default App;

