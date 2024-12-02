import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import FoodCalendar from './components/FoodCalendar';
import Groceries from './components/Groceries';
import Share from './components/Share';
import EditProfile from './components/EditProfile';
import IntroSlider from './components/IntroSlider';
import Friends from './components/Friends';

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
  const hasSeenIntro = localStorage.getItem('hasSeenIntro');

  return (
    <Router>
      <Routes>
        {/* Redirect root based on token and intro status */}
        <Route 
          path="/" 
          element={
            token 
              ? <Navigate to="/calendar" /> 
              : hasSeenIntro 
                ? <Navigate to="/login" />
                : <IntroSlider />
          } 
        />
        
        <Route path="/intro" element={<IntroSlider />} />
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
        <Route 
          path="/friends" 
          element={
            <ProtectedRoute>
              <Friends />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
