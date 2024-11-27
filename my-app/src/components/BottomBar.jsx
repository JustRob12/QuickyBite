import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { FaCalendarAlt, FaShoppingBasket, FaShareAlt, FaHome } from 'react-icons/fa';

function BottomBar() {
  const location = useLocation();

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 p-2">
      <div className="flex justify-around items-center">
        <Link 
          to="/calendar" 
          className={`flex flex-col items-center p-2 ${
            location.pathname === '/calendar' 
              ? 'text-[#B8860B]' 
              : 'text-gray-400 dark:text-gray-400'
          }`}
        >
          <FaCalendarAlt className="text-xl mb-1" />
          <span className="text-xs">Calendar</span>
        </Link>

        <Link 
          to="/groceries" 
          className={`flex flex-col items-center p-2 ${
            location.pathname === '/groceries' 
              ? 'text-[#B8860B]' 
              : 'text-gray-400 dark:text-gray-400'
          }`}
        >
          <FaShoppingBasket className="text-xl mb-1" />
          <span className="text-xs">Groceries</span>
        </Link>

        <Link 
          to="/share" 
          className={`flex flex-col items-center p-2 ${
            location.pathname === '/share' 
              ? 'text-[#B8860B]' 
              : 'text-gray-400 dark:text-gray-400'
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