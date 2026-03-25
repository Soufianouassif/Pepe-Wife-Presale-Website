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
  const { i18n } = useTranslation();
  console.log("App: i18n language is", i18n.language);
  const isRTL = i18n.language === 'ar';
  const isFrench = i18n.language === 'fr';
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
    // ...
    try {
      localStorage.setItem('viewMode', viewMode);
    } catch (e) {}
    
    // Dispatch a custom event so other components know the view mode changed
    window.dispatchEvent(new Event('viewModeChanged'));
  }, [viewMode]);

  // Listen for view mode changes from other components
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
    return () => window.removeEventListener('viewModeChanged', handleViewChange);
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

