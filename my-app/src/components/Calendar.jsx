import React from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths
} from 'date-fns';
import { FaChevronLeft, FaChevronRight, FaTimes } from 'react-icons/fa';

function Calendar({ selectedDate, onSelectDate, onClose, meals = [] }) {
  const [currentMonth, setCurrentMonth] = React.useState(new Date(selectedDate));

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  });

  // Get day names
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Calculate the starting empty cells
  const firstDayOfMonth = startOfMonth(currentMonth).getDay();
  const emptyDays = Array(firstDayOfMonth).fill(null);

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  // Add function to get meals for a specific date
  const getMealsForDate = (date) => {
    if (!meals) return [];
    return meals.filter(meal => 
      format(new Date(meal.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
  };

  // Add function to render dots
  const renderMealDots = (date) => {
    const dayMeals = getMealsForDate(date);
    const mealTypes = ['Breakfast', 'Lunch', 'Dinner', 'Snack'];
    const existingMealTypes = mealTypes.filter(type => 
      dayMeals.some(meal => meal.type === type)
    );

    return (
      <div className="flex justify-center gap-0.5 mt-1">
        {existingMealTypes.map((_, index) => (
          <div
            key={index}
            className="w-1 h-1 rounded-full bg-[#B8860B]"
          />
        ))}
      </div>
    );
  };

  // Add click handler for the overlay
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleOverlayClick}
    >
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg w-full max-w-md relative">
        {/* Close button in the corner */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 
            dark:text-gray-400 dark:hover:text-gray-200 p-2 rounded-full
            hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
        >
          <FaTimes className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <button 
            onClick={handlePrevMonth}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <FaChevronLeft className="text-[#B8860B]" />
          </button>
          <h2 className="text-lg font-semibold dark:text-white">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <button 
            onClick={handleNextMonth}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          >
            <FaChevronRight className="text-[#B8860B]" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1 mb-4">
          {/* Week day headers */}
          {weekDays.map(day => (
            <div 
              key={day} 
              className="text-center text-sm font-medium text-gray-600 dark:text-gray-400 p-2"
            >
              {day}
            </div>
          ))}

          {/* Empty days */}
          {emptyDays.map((_, index) => (
            <div key={`empty-${index}`} className="p-2" />
          ))}

          {/* Calendar days */}
          {daysInMonth.map(day => (
            <div
              key={day.toString()}
              className="flex flex-col items-center"
            >
              <button
                onClick={() => {
                  onSelectDate(day);
                  onClose();
                }}
                className={`w-10 h-10 flex items-center justify-center rounded-full 
                  hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors
                  ${isSameDay(day, selectedDate) ? 'bg-[#B8860B] text-white hover:bg-[#9B7506]' : 'dark:text-white'}
                  ${!isSameMonth(day, currentMonth) ? 'text-gray-300 dark:text-gray-600' : ''}`}
              >
                {format(day, 'd')}
              </button>
              {renderMealDots(day)}
            </div>
          ))}
        </div>

        {/* Done button */}
        <button
          onClick={onClose}
          className="w-full bg-[#B8860B] text-white py-2 rounded-lg 
            hover:bg-[#9B7506] transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  );
}

export default Calendar;