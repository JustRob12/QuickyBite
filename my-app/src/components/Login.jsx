import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';
import burger from '../assets/burger-blur.png';
import pizza from '../assets/pizza-blur.png';
import salad from '../assets/fries-blur.png';

function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        email: formData.email,
        password: formData.password
      });

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/calendar');
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-white dark:bg-gray-900 overflow-hidden relative">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[15%] w-32 h-32 opacity-20 dark:opacity-10 animate-float-slow">
          <img src={burger} alt="" className="w-full h-full object-contain blur-sm" />
        </div>
        <div className="absolute top-[5%] right-[20%] w-28 h-28 opacity-15 dark:opacity-10 animate-float-medium">
          <img src={burger} alt="" className="w-full h-full object-contain blur-sm" />
        </div>
        <div className="absolute top-[40%] right-[10%] w-40 h-40 opacity-20 dark:opacity-10 animate-float-medium">
          <img src={pizza} alt="" className="w-full h-full object-contain blur-sm" />
        </div>
        <div className="absolute top-[45%] left-[25%] w-36 h-36 opacity-15 dark:opacity-10 animate-float-slow">
          <img src={pizza} alt="" className="w-full h-full object-contain blur-sm rotate-45" />
        </div>
        <div className="absolute bottom-[15%] left-[20%] w-36 h-36 opacity-20 dark:opacity-10 animate-float-fast">
          <img src={salad} alt="" className="w-full h-full object-contain blur-sm" />
        </div>
        <div className="absolute bottom-[20%] right-[15%] w-32 h-32 opacity-15 dark:opacity-10 animate-float-medium">
          <img src={salad} alt="" className="w-full h-full object-contain blur-sm -rotate-45" />
        </div>
      </div>

      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 flex flex-col items-center">
            <div className="w-12 h-12 mb-4 border-4 border-gray-200 border-t-[#B8860B] rounded-full animate-spin dark:border-gray-700 dark:border-t-[#B8860B]"></div>
            <p className="text-gray-700 dark:text-gray-300 animate-pulse">Logging in...</p>
          </div>
        </div>
      )}

      <div className="w-full max-w-md animate-fade-in relative z-10">
        <div className="text-center mb-8 animate-fade-in-up">
          <h1 className="text-6xl font-bold">
            <span className="text-[#B8860B]">Quick</span>
            <span className="text-black dark:text-white">Bites</span>
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">Because good things come to those who plan – morning, noon, and night.</p>
        </div>
        
        <div className="mb-6 animate-fade-in-up delay-150">
          <h2 className="text-2xl font-bold mb-2 dark:text-white">Login</h2>
          <p className="text-gray-600 dark:text-gray-400">Welcome back! Please enter your details.</p>
        </div>

        <form className="space-y-4 animate-fade-in-up delay-300" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm mb-2 dark:text-gray-300">Email or Username</label>
            <input 
              type="email" 
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-2 dark:text-gray-300">Password</label>
            <input 
              type="password" 
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              required
            />
          </div>

          <button 
            type="submit" 
            className="w-full bg-[#B8860B] text-white py-2 rounded-md mt-4 
              hover:bg-[#9B7506] transition-colors duration-200 
              disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={isLoading}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>

          <p className="text-center text-gray-600 mt-4">
            Don't have an account? <Link to="/register" className="text-gray-600">Register</Link>
          </p>
        </form>
        {error && (
          <div className="text-red-500 text-center mb-4 animate-fade-in">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;
