import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

function Login() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [emailError, setEmailError] = useState('');
  const navigate = useNavigate();

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleEmailChange = (e) => {
    const email = e.target.value;
    setFormData({ ...formData, email: email });
    
    if (!email) {
      setEmailError('');
    }
    else if (!validateEmail(email)) {
      setEmailError('Please enter a Valid Email or Correct Username');
    } else {
      setEmailError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/users/login', formData);
      localStorage.setItem('user', JSON.stringify(response.data));
      navigate('/dashboard');
    } catch (error) {
      console.error('Login failed:', error.response.data);
      if (error.response?.data?.message?.includes('email')) {
        setEmailError('Email not found');
      }
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
        <h2 className="text-xl font-semibold mb-2">Login</h2>
        <p className="text-sm text-gray-600 mb-6">Welcome! Please fill in the details to get started.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="email"
              placeholder="Email or Username"
              className={`w-full p-3 border ${
                emailError ? 'border-red-500' : 'border-gray-300'
              } rounded-lg focus:outline-none focus:border-quick-brown`}
              onChange={handleEmailChange}
              value={formData.email}
            />
            {emailError && (
              <p className="text-red-500 text-xs mt-1">{emailError}</p>
            )}
          </div>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:border-quick-brown"
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              value={formData.password}
            />
            <button
              type="button"
              className="absolute right-3 top-3"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "👁️" : "👁️‍🗨️"}
            </button>
          </div>

          <button
            type="submit"
            className="w-full bg-quick-brown text-white p-3 rounded-lg font-semibold hover:bg-amber-700"
          >
            Login
          </button>

          <div className="text-center text-sm text-gray-500">
            <p className="my-4">or</p>
            <button className="w-full mb-3 p-3 border border-gray-300 rounded-lg flex items-center justify-center gap-2">
              <img src="/google-icon.png" alt="Google" className="w-5 h-5" />
              Continue with Google
            </button>
            <button className="w-full p-3 border border-gray-300 rounded-lg flex items-center justify-center gap-2">
              <img src="/facebook-icon.png" alt="Facebook" className="w-5 h-5" />
              Continue with Facebook
            </button>
          </div>

          <p className="text-center text-sm text-gray-600">
            Don't have an account? <Link to="/register" className="text-quick-brown font-semibold">Sign up</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;