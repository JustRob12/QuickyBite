import React from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth } from 'date-fns';

function Calendar({ selectedDate, onSelectDate, onClose }) {
  const monthStart = startOfMonth(selectedDate);
  const monthEnd = endOfMonth(selectedDate);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg w-full max-w-md mx-4">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">
            {format(selectedDate, 'MMMM yyyy')}
          </h2>
          <button onClick={onClose} className="text-gray-500">&times;</button>
        </div>

        <div className="grid grid-cols-7 gap-1">
          {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => (
            <div key={day} className="text-center text-sm font-medium py-2">
              {day}
            </div>
          ))}
          
          {monthDays.map(day => (
            <button
              key={day.toString()}
              onClick={() => {
                onSelectDate(day);
                onClose();
              }}
              className={`
                p-2 text-center rounded-full hover:bg-gray-100
                ${isSameMonth(day, selectedDate) ? 'text-gray-900' : 'text-gray-400'}
                ${format(day, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
                  ? 'bg-[#B8860B] text-white hover:bg-[#B8860B]'
                  : ''}
              `}
            >
              {format(day, 'd')}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Calendar;