import React from 'react';
import { FaSun, FaMoon, FaLaptop } from 'react-icons/fa';

function AppearanceModal({ isOpen, onClose, onThemeChange, currentTheme }) {
  if (!isOpen) return null;

  const themes = [
    { id: 'light', name: 'Light', icon: <FaSun /> },
    { id: 'dark', name: 'Dark', icon: <FaMoon /> },
    { id: 'system', name: 'System', icon: <FaLaptop /> }
  ];

  return (
    <>
      {/* Modal Overlay */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 rounded-lg shadow-xl z-50 w-80">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Appearance</h2>
        </div>
        
        <div className="p-4 space-y-2">
          {themes.map((theme) => (
            <button
              key={theme.id}
              onClick={() => {
                onThemeChange(theme.id);
                onClose();
              }}
              className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors
                ${currentTheme === theme.id 
                  ? 'bg-[#B8860B] text-white' 
                  : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200'
                }`}
            >
              <span className="text-xl">{theme.icon}</span>
              <span>{theme.name}</span>
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

export default AppearanceModal;