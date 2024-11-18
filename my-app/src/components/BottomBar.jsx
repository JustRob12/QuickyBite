import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaCalendarAlt, FaShoppingBasket, FaShareAlt, FaHome } from 'react-icons/fa';

function BottomBar() {
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2">
      <div className="flex justify-around items-center">
        <Link 
          to="/dashboard" 
          className={`flex flex-col items-center p-2 ${
            location.pathname === '/dashboard' ? 'text-[#B8860B]' : 'text-gray-600'
          }`}
        >
          <FaHome className="text-xl mb-1" />
          <span className="text-xs">Home</span>
        </Link>
        
        <Link 
          to="/calendar" 
          className={`flex flex-col items-center p-2 ${
            location.pathname === '/calendar' ? 'text-[#B8860B]' : 'text-gray-600'
          }`}
        >
          <FaCalendarAlt className="text-xl mb-1" />
          <span className="text-xs">Calendar</span>
        </Link>

        <Link 
          to="/groceries" 
          className={`flex flex-col items-center p-2 ${
            location.pathname === '/groceries' ? 'text-[#B8860B]' : 'text-gray-600'
          }`}
        >
          <FaShoppingBasket className="text-xl mb-1" />
          <span className="text-xs">Groceries</span>
        </Link>

        <Link 
          to="/share" 
          className={`flex flex-col items-center p-2 ${
            location.pathname === '/share' ? 'text-[#B8860B]' : 'text-gray-600'
          }`}
        >
          <FaShareAlt className="text-xl mb-1" />
          <span className="text-xs">Share</span>
        </Link>
      </div>
    </div>
  );
}

export default BottomBar; 