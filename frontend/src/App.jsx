import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
<Router>
  <Routes>
    <Route path="/login" element={<Login />} />
    <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
    <Route path="/" element={<Navigate to="/dashboard" replace />} />
  </Routes>
</Router>

  );
}

export default App;