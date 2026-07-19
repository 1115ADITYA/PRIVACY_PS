import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import ClientPage from './pages/ClientPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ClientPage />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
