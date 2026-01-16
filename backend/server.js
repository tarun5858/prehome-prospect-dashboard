require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
// const { fileURLToPath } = require('url');

const app = express();


const allowedOrigins = [
  "http://localhost:5173", // Vite default
  "http://localhost:5174", // Vite default
  "https://prehome-prospect-dashboard-6cya.onrender.com" // Your Live URL
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));


// ✅ Step 1: Setup CORS and JSON body parsing
// app.use(cors({
//   origin: process.env.NODE_ENV === 'production' 
//     ? true // true allows the origin of the request (same-origin)
//     : "http://localhost:5174", 
//   credentials: true
// }));
app.use(express.json());

// 🚨 Fix for COOP blocking issue
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "unsafe-none");
  res.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none");
  next();
});

// ✅ Step 2: Import and use routes (AFTER middleware setup)
const adminAuthRoutes = require('./routes/adminAuth');
const adminRoutes = require("./routes/adminRoutes");
const propertyRoutes = require("./routes/propertyRoutes");
const authRoutes = require("./routes/auth");
const sessionRoutes = require("./routes/sessionRoutes");
const chatRoutes = require("./routes/chatRoutes");
const formRoutes = require("./routes/formRoutes");
const activityRoutes = require("./routes/activityRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const uploadRoutes = require("./routes/uploadRoutes");

app.use("/api/admin/auth", adminAuthRoutes);
app.use("/api/properties", propertyRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/session", sessionRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/form", formRoutes);
app.use("/api/activity", activityRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/admin", adminRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
// Add this line to register the upload route
app.use("/api/upload", uploadRoutes);

// ✅ Step 3: Connect MongoDB
mongoose
  .connect("mongodb+srv://pre_home:pre1234home@cluster0.qsxrc.mongodb.net/prehome", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));



// 1. Point to the 'dist' folder inside the frontend directory
// __dirname is the current folder (backend), so we go up one level to find frontend
// const frontendPath = path.join(__dirname, '..', 'frontend', 'dist');
const frontendPath = path.resolve(__dirname, "..", "frontend", "dist");

// app.use(express.static(frontendPath));
// Check if the path exists before using it to avoid weird errors
const fs = require('fs');
if (fs.existsSync(frontendPath)) {
    app.use("/", express.static(frontendPath));
} else {
    console.warn("⚠️ Warning: Frontend dist folder not found. Run 'npm run build' in frontend.");
}

// The "Catch-All" for React Router
app.get(/^\/(?!api).*/, (req, res) => {
  // If the request starts with /api, don't send index.html (send 404 instead)
  if (req.url.startsWith('/api')) {
    return res.status(404).json({ message: "API route not found" });
  }
  res.sendFile(path.join(frontendPath, 'index.html'));
})


// ✅ Step 4: Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
