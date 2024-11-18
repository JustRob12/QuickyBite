import React, { useState, useEffect } from 'react';
import BottomBar from './BottomBar';
import Header from './Header';
import { FaCalendarAlt, FaCoffee, FaUtensils, FaWineGlass, FaCookie, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import Calendar from './Calendar';
import { addWeeks, subWeeks, format, startOfWeek, endOfWeek } from 'date-fns';
import AddMealModal from './AddMealModal';
import { useNavigate } from 'react-router-dom';

function FoodCalendar() {
  const [showFullCalendar, setShowFullCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentWeekStart, setCurrentWeekStart] = useState(new Date());
  const [displayMonth, setDisplayMonth] = useState('');
  const [showMealModal, setShowMealModal] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState('');
  const navigate = useNavigate();
  const [meals, setMeals] = useState([]);
  const [error, setError] = useState(null);

  // Generate week dates starting from currentWeekStart
  const getWeekDates = (startDate) => {
    const dates = [];
    const firstDay = new Date(startDate);
    firstDay.setDate(firstDay.getDate() - firstDay.getDay()); // Start from Sunday
    
    for (let i = 0; i < 7; i++) {
      const date = new Date(firstDay);
      date.setDate(firstDay.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  // Update display month based on current week
  useEffect(() => {
    const start = startOfWeek(currentWeekStart);
    const end = endOfWeek(currentWeekStart);
    const startMonth = format(start, 'MMMM');
    const endMonth = format(end, 'MMMM');
    const year = format(currentWeekStart, 'yyyy');

    if (startMonth === endMonth) {
      setDisplayMonth(`${startMonth} ${year}`);
    } else {
      setDisplayMonth(`${startMonth} - ${endMonth} ${year}`);
    }
  }, [currentWeekStart]);

  const weekDates = getWeekDates(currentWeekStart);

  const handlePrevWeek = () => {
    const newDate = subWeeks(currentWeekStart, 1);
    setCurrentWeekStart(newDate);
    // Update selected date if it's outside the new week range
    if (selectedDate < startOfWeek(newDate) || selectedDate > endOfWeek(newDate)) {
      setSelectedDate(newDate);
    }
  };

  const handleNextWeek = () => {
    const newDate = addWeeks(currentWeekStart, 1);
    setCurrentWeekStart(newDate);
    // Update selected date if it's outside the new week range
    if (selectedDate < startOfWeek(newDate) || selectedDate > endOfWeek(newDate)) {
      setSelectedDate(newDate);
    }
  };

  // Fetch meals for selected date
  const fetchMeals = async (date) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/food/${format(date, 'yyyy-MM-dd')}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
          return;
        }
        throw new Error('Failed to fetch meals');
      }

      const data = await response.json();
      setMeals(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching meals:', error);
      setError(error.message);
      setMeals([]);
    }
  };

  // Fetch meals when date changes
  useEffect(() => {
    fetchMeals(selectedDate);
  }, [selectedDate]);

  const handleSaveMeal = async (mealData) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/food`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...mealData,
          date: format(selectedDate, 'yyyy-MM-dd')
        })
      });

      if (!response.ok) {
        if (response.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
          return;
        }
        throw new Error('Failed to save meal');
      }

      const savedMeal = await response.json();
      console.log('Meal saved:', savedMeal);
      
      // Update the meals state
      await fetchMeals(selectedDate);
      setShowMealModal(false);
    } catch (error) {
      console.error('Error saving meal:', error);
      setError(error.message);
    }
  };

  // Update renderMealSection to show saved meals
  const renderMealSection = (icon, type) => {
    const mealOfType = Array.isArray(meals) ? meals.find(meal => meal.type === type) : null;

    return (
      <div className="bg-[#FFF8DC] p-4 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            {icon}
            <span className="font-medium">{type}</span>
          </div>
          <button 
            onClick={() => {
              setSelectedMealType(type);
              setShowMealModal(true);
            }} 
            className="text-[#B8860B] text-xl"
          >
            +
          </button>
        </div>
        {mealOfType ? (
          <div className="text-sm">
            <p className="font-medium">{mealOfType.mealName}</p>
            {mealOfType.additionalDish && (
              <p className="text-gray-600">+ {mealOfType.additionalDish}</p>
            )}
            {mealOfType.sideDish && (
              <p className="text-gray-600">+ {mealOfType.sideDish}</p>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-600">Add {type.toLowerCase()}</p>
        )}
      </div>
    );
  };

  return (
    <div className="pb-20">
      <Header />
      <div className="p-4">
        {/* Calendar Toggle */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">
            {displayMonth}
          </h2>
          <button 
            onClick={() => setShowFullCalendar(!showFullCalendar)}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <FaCalendarAlt className="text-[#B8860B] text-xl" />
          </button>
        </div>

        {/* Week View with Navigation */}
        <div className="relative mb-6">
          <button 
            onClick={handlePrevWeek}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white rounded-full shadow-md hover:bg-gray-50"
          >
            <FaChevronLeft className="text-[#B8860B]" />
          </button>

          <div className="flex justify-between px-8">
            {weekDates.map((date, index) => (
              <button
                key={index}
                onClick={() => setSelectedDate(date)}
                className={`flex flex-col items-center w-10 py-2 rounded-xl transition-all
                  ${date.toDateString() === selectedDate.toDateString() 
                    ? 'bg-[#B8860B] text-white scale-110' 
                    : 'hover:bg-gray-100'}`}
              >
                <span className="text-xs">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'][date.getDay()]}
                </span>
                <span className="text-sm font-medium mt-1">{date.getDate()}</span>
              </button>
            ))}
          </div>

          <button 
            onClick={handleNextWeek}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white rounded-full shadow-md hover:bg-gray-50"
          >
            <FaChevronRight className="text-[#B8860B]" />
          </button>
        </div>

        {/* Meal Sections */}
        <div className="space-y-3">
          {renderMealSection(<FaCoffee className="text-[#B8860B]" />, "Breakfast")}
          {renderMealSection(<FaUtensils className="text-[#B8860B]" />, "Lunch")}
          {renderMealSection(<FaWineGlass className="text-[#B8860B]" />, "Dinner")}
          {renderMealSection(<FaCookie className="text-[#B8860B]" />, "Snack")}
        </div>

        {/* Save Button */}
        <button className="w-full bg-[#B8860B] text-white py-2 rounded-lg mt-4">
          Save
        </button>
      </div>
      <BottomBar />
      {showFullCalendar && (
        <Calendar
          selectedDate={selectedDate}
          onSelectDate={(date) => {
            setSelectedDate(date);
            setCurrentWeekStart(date);
          }}
          onClose={() => setShowFullCalendar(false)}
        />
      )}

      {/* Add Meal Modal */}
      <AddMealModal
        isOpen={showMealModal}
        onClose={() => setShowMealModal(false)}
        mealType={selectedMealType}
        onSave={handleSaveMeal}
      />
    </div>
  );
}

export default FoodCalendar; 