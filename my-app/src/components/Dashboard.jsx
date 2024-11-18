import React from 'react';
import { useNavigate } from 'react-router-dom';
import BottomBar from './BottomBar';
import Header from './Header';

function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div className="pb-20">
      <Header />
      <div className="p-4">
        <button 
          onClick={handleLogout}
          className="bg-[#B8860B] text-white px-4 py-2 rounded-md"
        >
          Logout
        </button>
      </div>
      <BottomBar />
    </div>
  );
}

export default Dashboard; 