import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { WalletProvider } from './context/WalletContext';
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import ConnectPage from './pages/ConnectPage';
import LoadingPage from './pages/LoadingPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';
  const isFrench = i18n.language === 'fr';
  const [viewMode, setViewMode] = useState(localStorage.getItem('viewMode') || 'mobile');

  useEffect(() => {
    // Update HTML attributes for SEO and styling
    document.documentElement.lang = i18n.language;
    document.documentElement.dir = isRTL ? 'rtl' : 'ltr';
    
    // Update body classes
    document.body.className = `lang-${i18n.language} ${isRTL ? 'rtl' : 'ltr'}`;
    
    // Persist language choice
    localStorage.setItem('i18nextLng', i18n.language);
  }, [i18n.language, isRTL]);

  useEffect(() => {
    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      if (viewMode === 'desktop') {
        // Force desktop width - 1280px is a standard desktop breakpoint
        viewport.setAttribute('content', 'width=1280, initial-scale=0.1');
        document.documentElement.classList.add('forced-desktop');
      } else {
        // Standard mobile viewport
        viewport.setAttribute('content', 'width=device-width, initial-scale=1.0');
        document.documentElement.classList.remove('forced-desktop');
      }
    }
    localStorage.setItem('viewMode', viewMode);
    
    // Dispatch a custom event so other components know the view mode changed
    window.dispatchEvent(new Event('viewModeChanged'));
  }, [viewMode]);

  // Listen for view mode changes from other components
  useEffect(() => {
    const handleViewChange = () => {
      const newMode = localStorage.getItem('viewMode');
      if (newMode && newMode !== viewMode) {
        setViewMode(newMode);
      }
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
          <Route path="/loading" element={<ProtectedRoute><LoadingPage /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </WalletProvider>
  );
}

export default App;

