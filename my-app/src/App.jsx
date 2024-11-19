import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import FoodCalendar from './components/FoodCalendar';
import Groceries from './components/Groceries';
import Share from './components/Share';
import EditProfile from './components/EditProfile';

// Protected Route component
const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" />;
  }
  return children;
};

function App() {
  const token = localStorage.getItem('token');

  return (
    <Router>
      <Routes>
        {/* Redirect root to calendar if logged in, otherwise to login */}
        <Route 
          path="/" 
          element={token ? <Navigate to="/calendar" /> : <Navigate to="/login" />} 
        />
        
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/calendar" 
          element={
            <ProtectedRoute>
              <FoodCalendar />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/groceries" 
          element={
            <ProtectedRoute>
              <Groceries />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/share" 
          element={
            <ProtectedRoute>
              <Share />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/edit-profile" 
          element={
            <ProtectedRoute>
              <EditProfile />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
