import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios';

function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
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

    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        email: formData.email,
        password: formData.password
      });

      // Store the token in localStorage
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      
      // Navigate to home or dashboard
      navigate('/calendar'); // You'll need to create this route
    } catch (error) {
      setError(error.response?.data?.message || 'Login failed');
      console.error('Login error:', error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-white dark:bg-gray-900">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold">
            <span className="text-[#B8860B]">Quick</span>
            <span className="text-black dark:text-white">Bites</span>
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">Because good things come to those who plan – morning, noon, and night.</p>
        </div>
        
        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-2 dark:text-white">Login</h2>
          <p className="text-gray-600 dark:text-gray-400">Welcome back! Please enter your details.</p>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
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
            className="w-full bg-[#B8860B] text-white py-2 rounded-md mt-4"
          >
            Login
          </button>

          <p className="text-center text-gray-600 mt-4">
            Don't have an account? <Link to="/register" className="text-gray-600">Register</Link>
          </p>
        </form>
        {error && (
          <div className="text-red-500 text-center mb-4">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

export default Login;
