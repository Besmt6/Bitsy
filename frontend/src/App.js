import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Toaster } from './components/ui/sonner';
import './App.css';

// Pages
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import Rooms from './pages/Rooms';
import Wallets from './pages/Wallets';
import Widget from './pages/Widget';
import Stats from './pages/Stats';
import Analytics from './pages/Analytics';
import WidgetMockup from './pages/WidgetMockup';
import MetaMaskMockup from './pages/MetaMaskMockup';
import ChatGPTMockup from './pages/ChatGPTMockup';

// Layout
import DashboardLayout from './components/layout/DashboardLayout';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      
      {/* Video Mockup Routes */}
      <Route path="/mockup/widget" element={<WidgetMockup />} />
      <Route path="/mockup/metamask" element={<MetaMaskMockup />} />
      <Route path="/mockup/chatgpt" element={<ChatGPTMockup />} />
      
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/dashboard/stats" replace />} />
        <Route path="stats" element={<Stats />} />
        <Route path="analytics" element={<Analytics />} />
        <Route path="settings" element={<Settings />} />
        <Route path="rooms" element={<Rooms />} />
        <Route path="wallets" element={<Wallets />} />
        <Route path="widget" element={<Widget />} />
      </Route>
      
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
        <Toaster />
      </Router>
    </AuthProvider>
  );
}

export default App;
