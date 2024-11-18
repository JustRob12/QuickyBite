import React from 'react';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="p-4">
      <h1>Welcome, {user.name}!</h1>
      <button 
        onClick={handleLogout}
        className="bg-[#B8860B] text-white px-4 py-2 rounded-md"
      >
        Logout
      </button>
    </div>
  );
}

export default Dashboard; 