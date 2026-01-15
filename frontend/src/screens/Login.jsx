import {
  Divider,
  Typography,
  Container,
  IconButton,
  Box,
  TextField,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import { FcGoogle } from "react-icons/fc";
import { FaFacebook } from "react-icons/fa";
import { useState } from "react";
import axios from "axios";
import { useGoogleLogin } from "@react-oauth/google";

import { jwtDecode } from "jwt-decode";
import { LoginSocialFacebook } from "reactjs-social-login";
import { FacebookLoginButton } from "react-social-login-buttons";
import icon from "../assets/logo.png";
import ViewPropButton from "../components/ViewPropButton";

const LoginSignup = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotMessage, setForgotMessage] = useState("");

  const navigate = useNavigate();
const loginWithGoogle = useGoogleLogin({
  onSuccess: async (tokenResponse) => {
    try {
      const userInfoResponse = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: {
          Authorization: `Bearer ${tokenResponse.access_token}`,
        },
      });

      const userEmail = userInfoResponse.data.email;

      const response = await axios.post(`${apiBase}/google-login`, {
        email: userEmail,
      });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user_id", response.data.userId);
      localStorage.setItem("user_email", userEmail);

      if (response.data.isGoogleAccount) {
        navigate("/set-password");
      } else {
        navigate("/application-screen");
      }
    } catch (err) {
      alert("Google Login failed");
    }
  },
  onError: () => alert("Google login failed"),
});

const BASE_URL = import.meta.env.MODE === 'production' 
  ? 'https://prehome-prospect-dashboard-6cya.onrender.com' 
  : 'http://localhost:5000';
  const apiBase = `${BASE_URL}/api/auth`;
  // const apiBase = "http://localhost:5000/api/auth";

  const handleLogin = async () => {
    try {
      const response = await axios.post(`${apiBase}/login`, { email, password });
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user_id", response.data.userId);
      navigate("/application-screen");
    } catch (error) {
      alert(error?.response?.data?.message || "Login failed");
    }
  };

  const handleGoogleLoginSuccess = async (credentialResponse) => {
    try {
      const decoded = jwtDecode(credentialResponse.credential);
      const response = await axios.post(`${apiBase}/google-login`, {
        email: decoded.email,
      });
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user_id", response.data.userId);
      localStorage.setItem("user_email", decoded.email);
      if (response.data.isGoogleAccount) {
        navigate("/set-password");
      } else {
        navigate("/application-screen");
      }
    } catch {
      alert("Google Login failed");
    }
  };

  const handleFacebookResponse = async ({ data }) => {
    try {
      const fbResponse = await axios.post(`${apiBase}/facebook-login`, {
        userID: data.id,
      });
      localStorage.setItem("token", fbResponse.data.token);
      localStorage.setItem("user_id", fbResponse.data.userId);
      navigate("/application-screen");
    } catch {
      alert("Facebook Login Failed");
    }
  };

  const handleForgotSubmit = async () => {
    try {
      const res = await axios.post(`${apiBase}/forgot-password`, {
        email: forgotEmail,
      });
      setForgotMessage(res.data.message || "OTP sent to email");
      setForgotStep(2);
    } catch {
      setForgotMessage("Failed to send OTP");
    }
  };

  const handleVerifyOtp = async () => {
    try {
      const res = await axios.post(`${apiBase}/verify-reset-otp`, {
        email: forgotEmail,
        otp,
      });
      setForgotMessage(res.data.message || "OTP verified");
      setForgotStep(3);
    } catch {
      setForgotMessage("Invalid OTP");
    }
  };

  const handleResetPassword = async () => {
    try {
      const res = await axios.post(`${apiBase}/reset-password`, {
        email: forgotEmail,
        password: newPassword,
      });
      setForgotMessage(res.data.message || "Password reset successfully");
      setTimeout(() => {
        setShowForgot(false);
        setForgotStep(1);
        setForgotMessage("");
        setForgotEmail("");
        setOtp("");
        setNewPassword("");
      }, 2000);
    } catch {
      setForgotMessage("Failed to reset password");
    }
  };

  return (
    <Box className="main-box-login" sx={{ backgroundColor: "#f5f5f5", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center"}}>
      <Container maxWidth="xs" className="login-container" sx={{ padding: {xs:1,md:4},  borderRadius: "16px" }}>
        <Box className="img-container" sx={{ textAlign: "center",display:{xs:"block",md:"none"} }}>
          <img src={icon} alt="logo" style={{ height: "100px", margin: "5% 0" }} />
        </Box>
        <Typography variant="h5" sx={{ fontFamily:"Poppins", fontSize:{xs:"20",md:"32px"},fontWeight:"600",marginBottom:"5%" }} gutterBottom textAlign="center">
          {showForgot ? "Forgot Password" : "Log In or Sign Up With Prehome"}
        </Typography>

        {!showForgot ? (
          <>
           <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
  {/* Custom Google Button */}
  {/* <Box
    onClick={() => document.getElementById("custom-google-btn").click()}
    sx={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: 1,
      border: "1px solid #000",
      borderRadius: "30px",
      padding: "10px 20px",
      width: "100%",
      cursor: "pointer",
      backgroundColor: "#fff",
    }}
  >
    <FcGoogle size={24} />
    <span style={{ fontWeight: 500 }}>Continue With Google</span>
  </Box>

  <Box sx={{ display: "none" }}>
    <GoogleLogin
      onSuccess={handleGoogleLoginSuccess}
      onError={() => alert("Google login failed")}
      useOneTap
      auto_select
      id="custom-google-btn"
    />
  </Box> */}
<Box
  onClick={loginWithGoogle}
  sx={{
    display: "flex",
    alignItems: "center",
    justifyContent: "space-evenly",
    gap: 1,
    border: "1px solid #000",
    borderRadius: "30px",
    padding: "10px 20px",
    width: "358px",
    height:"56px",
    cursor: "pointer",
    backgroundColor: "#fff",
    fontFamily: "Poppins, sans-serif",
    "&:hover": { backgroundColor: "#f0f0f0" },
  }}
>
  <FcGoogle size={24} />
  <span style={{ fontWeight: 500 ,fontSize:16,}}>Continue With Google</span>
</Box>

  {/* Custom Facebook Button */}
  <LoginSocialFacebook
    appId="997130395950749"
    onResolve={handleFacebookResponse}
    onReject={() => alert("Facebook Login Failed")}
  >
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-evenly",
        gap: 1,
        border: "1px solid #000",
        borderRadius: "30px",
        padding: "10px 20px",
        width: "358px",
        height:"56px",
        cursor: "pointer",
        backgroundColor: "#fff",
    "&:hover": { backgroundColor: "#f0f0f0" },

      }}
    >
      <FaFacebook size={24} />
      <span style={{ fontWeight: 500 ,fontSize:16}}>Continue With Facebook</span>
    </Box>
  </LoginSocialFacebook>
</Box>


            <Divider sx={{ my: 3 ,color:"grey"}}>Or</Divider>
<Box display="flex" flexDirection="column" alignItems="center" gap={2}>
  <Box>

            <p className="login-mail-text">Email Id</p>
            <input
              // fullWidth
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              // sx={{ mb: 2,borderRadius:"8px" }}
              className="auth-input"
            />
  </Box>
<Box>

            <p className="login-mail-text">Password</p>
           
            <input
              // fullWidth
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              // sx={{ mb: 1,borderRadius:"8px" }}
               className="auth-input"
            />
</Box>
</Box>
            <Box textAlign="right">
              <Link onClick={() => setShowForgot(true)} className="login-link">
                Forgot Password?
              </Link>
            </Box>
<Box  display="flex" flexDirection="column" alignItems="center" gap={2}>

            <ViewPropButton text="Continue" onClick={handleLogin} style={{ width: "358px",height:"56px" }} />
</Box>

            <Typography textAlign="center" mt={2}>
              Don&apos;t have an account?{" "}
              <Link to="/signup" className="signup-link">
                Sign Up
              </Link>
            </Typography>
          </>
        ) : (
          <>
            {forgotStep === 1 && (
              <>
                {/* <Typography className="login-mail-text">Enter your email</Typography> */}
<Box display="flex" flexDirection="column" alignItems="center" gap={2}>
  <Box>

                 <h6 className="login-mail-text">Email Id</h6>
                {/* <TextField
                  fullWidth
                  type="email"
                  placeholder="Email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  sx={{ mb: 2 }}
                /> */}
                 <input
              // fullWidth
              type="email"
              placeholder="Email"
                value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
              // sx={{ mb: 2,borderRadius:"8px" }}
              className="auth-input"
            />
  </Box>
                <ViewPropButton text="Send OTP" onClick={handleForgotSubmit} style={{ width: "358px",height:"56px"}} />
</Box>
              </>
            )}
            {forgotStep === 2 && (
              <>
                <Typography className="login-mail-text">Enter OTP</Typography>
                <TextField
                  fullWidth
                  placeholder="OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  sx={{ mb: 2 }}
                />
                <ViewPropButton text="Verify OTP" onClick={handleVerifyOtp} style={{ width: "100%" }} />
              </>
            )}
            {forgotStep === 3 && (
              <>
                <Typography className="login-mail-text">Enter New Password</Typography>
                <TextField
                  fullWidth
                  type="password"
                  placeholder="Enter New Password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  sx={{ mb: 2 }}
                />
                <ViewPropButton text="Reset Password" onClick={handleResetPassword} style={{ width: "100%" }} />
              </>
            )}

            <Typography textAlign="center" mt={2} color="primary">{forgotMessage}</Typography>

            <Typography textAlign="center" mt={2}>
              <span
                onClick={() => {
                  setShowForgot(false);
                  setForgotStep(1);
                  setForgotEmail("");
                  setOtp("");
                  setNewPassword("");
                  setForgotMessage("");
                }}
                style={{ color: "#1976d2", cursor: "pointer", textDecoration: "underline" }}
              >
                Back to Login
              </span>
            </Typography>
          </>
        )}
      </Container>
    </Box>
  );
};

export default LoginSignup;
