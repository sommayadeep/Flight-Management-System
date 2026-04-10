import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import App from './App';
import AuthCallback from './pages/AuthCallback';

export default function RootRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/*" element={<App />} />
      </Routes>
    </BrowserRouter>
  );
}
