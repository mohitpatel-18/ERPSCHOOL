// backend/server.js
const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const compression = require("compression");
const mongoSanitize = require("express-mongo-sanitize");

// Core utils
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");
const apiResponse = require("./utils/apiResponse");
const seedAdmin = require("./utils/seedAdmin");

// ================= LOAD ENV =================
dotenv.config();

// ================= CONNECT DB =================
connectDB();

const app = express();

// ================= SECURITY HEADERS (helmet) =================
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
    contentSecurityPolicy: false, // disable CSP for API (frontend handles it)
  })
);

// ================= GZIP COMPRESSION =================
app.use(compression());

// ================= GLOBAL RATE LIMITER =================
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === 'production' ? 200 : 10000, // Much higher limit in development
  message: { success: false, message: "Too many requests. Please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// ================= STRICT RATE LIMITER (auth routes) =================
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: process.env.NODE_ENV === 'production' ? 20 : 1000, // More lenient in development
  message: { success: false, message: "Too many auth attempts. Please wait 15 minutes." },
  standardHeaders: true,
  legacyHeaders: false,
});

// Apply global limiter to all routes
app.use(globalLimiter);

// ================= GLOBAL MIDDLEWARE =================
app.use(express.json({ limit: "5mb" }));
app.use(express.urlencoded({ extended: true, limit: "5mb" }));
app.use(cookieParser());

// ================= MONGO SANITIZE (NoSQL injection prevention) =================
app.use(mongoSanitize());

// ================= PAGINATION MIDDLEWARE =================
const { pagination } = require("./middleware/pagination");
app.use(pagination);

// ================= AUDIT LOGGING MIDDLEWARE =================
const { auditLogger } = require("./middleware/auditLogger");
app.use(auditLogger({ actions: ['CREATE', 'UPDATE', 'DELETE'] }));

// ================= CORS =================
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

// ================= API RESPONSE HELPERS =================
app.use(apiResponse);

// ================= HEALTH CHECK =================
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    status: "healthy",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// ================= API ROUTES =================
// Apply strict rate limiting to auth endpoints
app.use("/api/auth/login", authLimiter);
app.use("/api/auth/register", authLimiter);
app.use("/api/auth/verify-otp", authLimiter);
app.use("/api/auth/forgot-password", authLimiter);

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/teacher", require("./routes/teacherRoutes"));
app.use("/api/student", require("./routes/studentRoutes"));
app.use("/api/attendance", require("./routes/attendanceRoutes"));
app.use("/api/class", require("./routes/classRoutes"));
app.use("/api/contact", require("./routes/contactRoutes"));
app.use("/api/announcements", require("./routes/announcementRoutes"));
app.use("/api/leaves", require("./routes/leaveRoutes"));
app.use("/api/payments", require("./routes/paymentRoutes"));
app.use("/api/fees", require("./routes/feeRoutes"));
app.use("/api/academic-years", require("./routes/academicYearRoutes"));
app.use("/api/audit", require("./routes/auditRoutes"));
app.use("/api/permissions", require("./routes/permissionRoutes"));
app.use("/api/roles", require("./routes/roleRoutes"));
app.use("/api/exams", require("./routes/examRoutes"));
app.use("/api/homework", require("./routes/homeworkRoutes"));
app.use("/api/timetable", require("./routes/timetableRoutes"));
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/profile", require("./routes/profileRoutes"));

// Fee Management Routes
app.use("/api/fees", require("./routes/feeRoutes"));
app.use("/api/fees/payments/razorpay", require("./routes/razorpayRoutes"));

// Serve receipts (still local for now — Phase 2 moves to Cloudinary)
app.use("/receipts", express.static("receipts"));

// ================= ERROR HANDLER =================
app.use(errorHandler);

// ================= SERVE FRONTEND (PRODUCTION) =================
if (process.env.NODE_ENV === "production") {
  const buildPath = path.join(__dirname, "../frontend/build");
  app.use(express.static(buildPath));
  app.get("*", (req, res) => {
    res.sendFile(path.join(buildPath, "index.html"));
  });
}

// ================= START SERVER =================
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, async () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
  console.log(`🛡️  Security: helmet + rate limiting enabled`);
  await seedAdmin();
});

// ================= GLOBAL ERROR HANDLING =================
process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Rejection:", err.message);
  server.close(() => process.exit(1));
});

process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err.message);
  process.exit(1);
});

module.exports = app;