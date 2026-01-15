// src/pages/AdminLogin.jsx
import { useState } from "react";
// import axios from "axios";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  // const handleAdminLogin = async () => {
  //   try {
  //     const res = await axios.post("http://localhost:5000/api/admin/auth/login", { email, password });
  //     localStorage.setItem("admin_token", res.data.token);
  //     navigate("/admin-panel");
  //   } catch (error) {
  //     alert(error.response?.data?.message || "Admin Login Failed");
  //   }
  // };
  const handleAdminLogin = async () => {
  try {
    // 2. Remove the full URL. Use the relative path instead.
    // The baseURL from your axios.js handles the rest!
    const res = await API.post("/admin/auth/login", { email, password });
    
    localStorage.setItem("admin_token", res.data.token);
    navigate("/admin-panel");
  } catch (error) {
    alert(error.response?.data?.message || "Admin Login Failed");
  }
};

  return (
    <div className="auth-container">
      <h2>Admin Login</h2>
      <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleAdminLogin}>Login</button>
    </div>
  );
};

export default AdminLogin;
