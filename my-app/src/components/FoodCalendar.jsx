import React, { useState, useEffect } from 'react';
import BottomBar from './BottomBar';
import Header from './Header';
import { FaCalendarAlt, FaCoffee, FaUtensils, FaWineGlass, FaCookie, FaChevronLeft, FaChevronRight, FaTrash } from 'react-icons/fa';
import Calendar from './Calendar';
import { addWeeks, subWeeks, format, startOfWeek, endOfWeek, addDays } from 'date-fns';
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
  const [editingMeal, setEditingMeal] = useState(null);

  // Generate week dates starting from currentWeekStart
  const getWeekDates = (startDate) => {
    const start = startOfWeek(startDate, { weekStartsOn: 0 }); // 0 = Sunday
    const dates = [];
    
    for (let i = 0; i < 7; i++) {
      dates.push(addDays(start, i));
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

      const method = editingMeal ? 'PUT' : 'POST';
      const url = editingMeal 
        ? `${import.meta.env.VITE_API_URL}/api/food/${editingMeal._id}`
        : `${import.meta.env.VITE_API_URL}/api/food`;

      const response = await fetch(url, {
        method,
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
        throw new Error(`Failed to ${editingMeal ? 'update' : 'save'} meal`);
      }

      // Refresh meals
      await fetchMeals(selectedDate);
      setShowMealModal(false);
      setEditingMeal(null);
    } catch (error) {
      console.error('Error saving meal:', error);
      setError(error.message);
    }
  };

  // Add delete handler
  const handleDeleteMeal = async (mealId) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/food/${mealId}`, {
        method: 'DELETE',
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
        throw new Error('Failed to delete meal');
      }

      // Refresh meals after deletion
      await fetchMeals(selectedDate);
    } catch (error) {
      console.error('Error deleting meal:', error);
      setError(error.message);
    }
  };

  // Update renderMealSection
  const renderMealSection = (icon, type) => {
    const mealOfType = Array.isArray(meals) ? meals.find(meal => meal.type === type) : null;

    const handleMealClick = (meal) => {
      setEditingMeal(meal);
      setSelectedMealType(type);
      setShowMealModal(true);
    };

    return (
      <div className="bg-[#FFF8DC] dark:bg-gray-800 p-4 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            {icon}
            <span className="font-medium dark:text-white">{type}</span>
          </div>
          {mealOfType ? (
            <button 
              onClick={() => handleDeleteMeal(mealOfType._id)}
              className="text-red-500 hover:text-red-700 p-2"
              title="Delete meal"
            >
              <FaTrash size={16} />
            </button>
          ) : (
            <button 
              onClick={() => {
                setEditingMeal(null);
                setSelectedMealType(type);
                setShowMealModal(true);
              }} 
              className="text-[#B8860B] text-xl"
            >
              +
            </button>
          )}
        </div>
        {mealOfType ? (
          <div 
            className="text-sm cursor-pointer hover:bg-[#FFF3D6] dark:hover:bg-gray-700 p-2 rounded-lg"
            onClick={() => handleMealClick(mealOfType)}
          >
            <p className="font-medium dark:text-white">{mealOfType.mealName}</p>
            {mealOfType.additionalDish && (
              <p className="text-gray-600 dark:text-gray-400">+ {mealOfType.additionalDish}</p>
            )}
            {mealOfType.sideDish && (
              <p className="text-gray-600 dark:text-gray-400">+ {mealOfType.sideDish}</p>
            )}
            {mealOfType.additionalInfo && (
              <p className="text-gray-500 dark:text-gray-400 text-xs mt-1">{mealOfType.additionalInfo}</p>
            )}
          </div>
        ) : (
          <p className="text-sm text-gray-600 dark:text-gray-400">Add {type.toLowerCase()}</p>
        )}
      </div>
    );
  };

  // Add function to render dots for week view
  const renderWeekDayDots = (date) => {
    const dayMeals = meals.filter(meal => 
      format(new Date(meal.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );

    // Sort meals by type to ensure consistent dot order
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

  return (
    <div className="pb-20 dark:bg-gray-900">
      <Header />
      <div className="p-4">
        {/* Calendar Toggle */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold dark:text-white">
            {displayMonth}
          </h2>
          <button 
            onClick={() => setShowFullCalendar(!showFullCalendar)}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full"
          >
            <FaCalendarAlt className="text-[#B8860B]" />
          </button>
        </div>

        {/* Week View with Navigation */}
        <div className="relative mb-6">
          <button 
            onClick={handlePrevWeek}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white dark:bg-gray-800 rounded-full shadow-md hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <FaChevronLeft className="text-[#B8860B]" />
          </button>

          <div className="flex justify-between px-8">
            {weekDates.map((date, index) => (
              <div
                key={index}
                className="flex flex-col items-center"
              >
                <button
                  onClick={() => setSelectedDate(date)}
                  className={`flex flex-col items-center w-10 py-2 rounded-xl transition-all
                    ${format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
                      ? 'bg-[#B8860B] text-white' 
                      : 'hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-white'}`}
                >
                  <span className="text-xs">
                    {format(date, 'EEE')}
                  </span>
                  <span className="text-sm font-medium mt-1">
                    {format(date, 'd')}
                  </span>
                </button>
                {renderWeekDayDots(date)}
              </div>
            ))}
          </div>

          <button 
            onClick={handleNextWeek}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-2 bg-white dark:bg-gray-800 rounded-full shadow-md hover:bg-gray-50 dark:hover:bg-gray-700"
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
          meals={meals}
        />
      )}

      {/* Add Meal Modal */}
      <AddMealModal
        isOpen={showMealModal}
        onClose={() => {
          setShowMealModal(false);
          setEditingMeal(null);
        }}
        mealType={selectedMealType}
        onSave={handleSaveMeal}
        existingMeal={editingMeal}
      />
    </div>
  );
}

export default FoodCalendar; 