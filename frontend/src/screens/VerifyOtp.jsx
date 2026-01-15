// src/pages/VerifyOtp.jsx
import { useState } from 'react';
import axios from 'axios';
import { useLocation, useNavigate } from 'react-router-dom';

const VerifyOtp = () => {
  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state?.email;

  const BASE_URL = import.meta.env.MODE === 'production' 
  ? 'https://prehome-prospect-dashboard-6cya.onrender.com' 
  : 'http://localhost:5000';

  const verifyOtp = async () => {
    try {
      await axios.post(`${BASE_URL}/api/auth/verify-otp`, {
        email,
        otp,
        password,
      });
      alert('Signup successful! Please login.');
      navigate('/login');
    } catch (error) {
      console.error('Error verifying OTP:', error);
      alert('Failed to verify OTP');
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl mb-4 text-center font-bold">Verify OTP</h2>
        <input
          type="text"
          placeholder="Enter OTP"
          className="w-full border p-2 mb-4"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
        />
        <input
          type="password"
          placeholder="Set Password"
          className="w-full border p-2 mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          className="w-full bg-green-500 text-white py-2 rounded"
          onClick={verifyOtp}
        >
          Verify & Signup
        </button>
      </div>
    </div>
  );
};

export default VerifyOtp;
