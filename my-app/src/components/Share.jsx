import React from 'react';
import BottomBar from './BottomBar';
import Header from './Header';

function Share() {
  const shareOptions = [
    { id: 1, title: 'Share via Email', icon: '📧' },
    { id: 2, title: 'Share to WhatsApp', icon: '📱' },
    { id: 3, title: 'Copy Link', icon: '🔗' },
    { id: 4, title: 'Export as PDF', icon: '📄' },
  ];

  return (
    <div className="pb-20">
      <Header />
      <div className="p-4">
        <div className="space-y-3">
          {shareOptions.map(option => (
            <button
              key={option.id}
              className="w-full flex items-center p-3 bg-white rounded-lg shadow hover:bg-gray-50"
            >
              <span className="text-2xl mr-3">{option.icon}</span>
              <span>{option.title}</span>
            </button>
          ))}
        </div>
      </div>
      <BottomBar />
    </div>
  );
}

export default Share; 