import React, { useState } from "react";
import axios from "axios";
import AuthInput from "../components/AuthInput";
import AuthButton from "../components/AuthButton";
import { useNavigate } from "react-router-dom";
import {
  Typography,
  Box,
  
} from "@mui/material";
import icon from "../assets/logo.png";

const steps = ["Enter Email", "Verify OTP", "Set Password"];

const Signup = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const BASE_URL = import.meta.env.MODE === 'production' 
  ? 'https://prehome-prospect-dashboard-6cya.onrender.com' 
  : 'http://localhost:5000';

  const sendOtp = async () => {
    setLoading(true);
    try {
      
      await axios.post(`${BASE_URL}/api/auth/send-otp`, { email });
      setActiveStep(1);
      setError("");
      alert("OTP sent to your email");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    setLoading(true);
    try {
      await axios.post(`${BASE_URL}/api/auth/verify-otp`, { email, otp });
      setActiveStep(2);
      setError("");
      alert("OTP verified! Set your password.");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const setNewPassword = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setLoading(true);
    try {
      await axios.post(`${BASE_URL}/api/auth/set-password`, { email, password });
      setError("");
      alert("Signup successful!");
      // Reset state or navigate to login
      setActiveStep(0);
      setEmail("");
      setOtp("");
      setPassword("");
      setConfirmPassword("");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <>
          <h6 className="login-mail-text">Email Id</h6>
            <AuthInput
              type="email"
              placeholder="Enter Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <AuthButton
              text={loading ? "Sending..." : "Send OTP"}
              onClick={sendOtp}
              disabled={!email || loading}
              type="button"
              
            />
          </>
        );
      case 1:
        return (
          <>
            <AuthInput
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
            />
            <AuthButton
              text={loading ? "Verifying..." : "Verify OTP"}
              onClick={verifyOtp}
              disabled={!otp || loading}
              type="button"
            />
          </>
        );
      case 2:
        return (
          <form onSubmit={setNewPassword}>
            <AuthInput
              type="password"
              placeholder="Enter Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <AuthInput
              type="password"
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
            <AuthButton
              text={loading ? "Creating..." : "Create Account"}
              disabled={!password || !confirmPassword || loading}
            />
          </form>
        );
      default:
        return null;
    }
  };

  return (
    <div className="auth-container">
        <Box className="img-container" sx={{ textAlign: "center",display:{xs:"block",md:"none"} }}>
                <img src={icon} alt="logo" style={{ height: "100px", margin: "5% 0" }} />
              </Box>
              <Typography variant="h5" sx={{ fontFamily:"Poppins", fontSize:{xs:"20px",lg:"32px"},fontWeight:"600",marginBottom:"10%" }} gutterBottom textAlign="center">
      Sign Up With Prehome
                </Typography>
      
      {renderStepContent()}
      {error && (
        <p style={{ color: "red", textAlign: "center", marginTop: "1rem" }}>
          {error}
        </p>
      )}
    </div>
  );
};

export default Signup;
