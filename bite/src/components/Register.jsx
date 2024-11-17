import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert("Passwords don't match!");
      return;
    }
    try {
      const response = await axios.post('http://localhost:5000/api/users/register', formData);
      localStorage.setItem('user', JSON.stringify(response.data));
      navigate('/dashboard');
    } catch (error) {
      console.error('Registration failed:', error.response.data);
    }
  };

  return (
    <div className="min-h-screen p-6 flex flex-col items-center">
      <div className="w-full text-center mb-12 mt-10">
        <h1 className="text-6xl md:text-5xl font-bold mb-4">
          <span className="text-quick-brown">Quick</span>
          <span className="text-black">Bites</span>
        </h1>
        <p className="text-base md:text-lg text-gray-600 max-w-md mx-auto">
          Because good things come to those who plan - morning, noon, and night.
        </p>
      </div>

      <div className="w-full max-w-md">
        <h2 className="text-xl font-semibold mb-2">Sign Up</h2>
        <p className="text-sm text-gray-600 mb-6">Welcome! Please fill in the details to get started.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Name"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-quick-brown"
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />

          <input
            type="email"
            placeholder="Email or Username"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-quick-brown"
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />

          <input
            type="password"
            placeholder="Password"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-quick-brown"
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          />

          <input
            type="password"
            placeholder="Confirm Password"
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-quick-brown"
            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
          />

          <button
            type="submit"
            className="w-full bg-quick-brown text-white p-3 rounded-lg font-semibold hover:bg-amber-700"
          >
            Register
          </button>

          <p className="text-center text-sm text-gray-600">
            Don't you have an account? <Link to="/" className="text-quick-brown font-semibold">Login</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Register;