// src/pages/SendOtp.jsx
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const SendOtp = () => {
  const [email, setEmail] = useState('');
  const navigate = useNavigate();

  const sendOtp = async () => {
    const BASE_URL = import.meta.env.MODE === 'production' 
  ? 'https://prehome-prospect-dashboard-6cya.onrender.com' 
  : 'http://localhost:5000';
    try {
      await axios.post(`${BASE_URL}/api/auth/send-otp`, { email });
      // await axios.post('http://localhost:5000/api/auth/send-otp', { email });
      alert('OTP sent to your email');
      navigate('/verify', { state: { email } });
    } catch (error) {
      console.error('Error sending OTP:', error);
      alert('Failed to send OTP');
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100">
      <div className="bg-white p-8 rounded shadow-md w-96">
        <h2 className="text-2xl mb-4 text-center font-bold">Sign Up</h2>
        <input
          type="email"
          placeholder="Enter your email"
          className="w-full border p-2 mb-4"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button
          className="w-full bg-blue-500 text-white py-2 rounded"
          onClick={sendOtp}
        >
          Send OTP
        </button>
      </div>
    </div>
  );
};

export default SendOtp;
