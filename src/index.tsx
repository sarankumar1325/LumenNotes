import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './auth/AuthContext';
import App from './App';
import { LandingPage } from './components/LandingPage';
import { ResetPasswordPage } from './components/ResetPasswordPage';

const ProtectedApp: React.FC = () => {
  const { session, loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-screen bg-[#FAFAF9] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#292524] rounded-full opacity-20 animate-pulse" />
      </div>
    );
  }

  if (!session) {
    return <LandingPage />;
  }

  return <App />;
};

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<ProtectedApp />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);
