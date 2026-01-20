require('dotenv').config();

const User = require('../models/userModel');
const Otp = require('../models/otpModel');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');

const JWT_SECRET = process.env.JWT_SECRET || 'prehome_secret_key';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS
  }
});

// ====================== Send OTP ======================
const sendOtp = async (req, res) => {
  const { email } = req.body;
  const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

  try {
    await Otp.create({ email, otp: otpCode });

    await transporter.sendMail({
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP code is ${otpCode}`,
    });

    res.status(200).json({ message: 'OTP sent to email' });
  } catch (err) {
    console.error('Error sending OTP:', err);
    res.status(500).json({ message: 'Failed to send OTP' });
  }
};

// ====================== Verify OTP ======================
const verifyOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const validOtp = await Otp.findOne({ email, otp });
    if (!validOtp) return res.status(400).json({ message: 'Invalid or expired OTP' });

    await Otp.deleteMany({ email });

    res.status(200).json({ message: 'OTP verified, you can now set your password' });
  } catch (err) {
    console.error('Error verifying OTP:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ====================== Register User ======================
const registerUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ email, password: hashedPassword });

    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ====================== Login User (with block check) ======================
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    if (user.isBlocked) {
      return res.status(403).json({ message: 'Your account has been blocked. Please contact support.' });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ message: 'Login successful', token, userId: user._id });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ====================== Google Login (with block check) ======================
const googleLogin = async (req, res) => {
  const { email } = req.body;

  try {
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({ email, isGoogleUser: true });
    }

    if (user.isBlocked) {
      return res.status(403).json({ message: 'Your account has been blocked. Please contact support.' });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ message: 'Google login successful', token, userId: user._id });
  } catch (err) {
    console.error('Google login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ====================== Facebook Login (with block check) ======================
const facebookLogin = async (req, res) => {
  const { userID } = req.body;

  try {
    if (!userID) return res.status(400).json({ message: 'Facebook userID is required' });

    let user = await User.findOne({ facebookId: userID });
    if (!user) {
      user = await User.create({ facebookId: userID });
    }

    if (user.isBlocked) {
      return res.status(403).json({ message: 'Your account has been blocked. Please contact support.' });
    }

    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: '1h' });

    res.status(200).json({ message: 'Facebook login successful', token, userId: user._id });
  } catch (err) {
    console.error('Facebook login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ====================== Set Password ======================
const setPassword = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.updateOne({ email }, { $set: { password: hashedPassword } });

    res.status(200).json({ message: 'Password set successfully' });
  } catch (err) {
    console.error('Error setting password:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// ====================== Forgot Password: Send OTP ======================
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "Email not found" });

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    await Otp.create({ email, otp: otpCode });

    await transporter.sendMail({
      to: email,
      subject: "Password Reset OTP",
      text: `Your password reset OTP is ${otpCode}. It will expire shortly.`,
    });

    res.status(200).json({ message: "OTP sent to email" });
  } catch (err) {
    console.error("Error sending forgot-password OTP:", err);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};

// ====================== Verify Reset OTP ======================
const verifyResetOtp = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const validOtp = await Otp.findOne({ email, otp });
    if (!validOtp) return res.status(400).json({ message: "Invalid or expired OTP" });

    await Otp.deleteMany({ email });
    res.status(200).json({ message: "OTP verified. You can now reset your password." });
  } catch (err) {
    console.error("Error verifying reset OTP:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ====================== Reset Password ======================
const resetPassword = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const hashedPassword = await bcrypt.hash(password, 10);
    await User.updateOne({ email }, { $set: { password: hashedPassword } });

    res.status(200).json({ message: "Password reset successfully" });
  } catch (err) {
    console.error("Error resetting password:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  sendOtp,
  verifyOtp,
  registerUser,
  loginUser,
  googleLogin,
  facebookLogin,
  setPassword,
  forgotPassword,
  verifyResetOtp,
  resetPassword,
};
