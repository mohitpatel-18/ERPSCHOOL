// backend/server.js
const path = require("path");
const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");

// Core utils
const connectDB = require("./config/db");
const errorHandler = require("./middleware/errorHandler");
const seedAdmin = require("./utils/seedAdmin");

// ================= LOAD ENV =================
dotenv.config();

// ================= CONNECT DB =================
connectDB();

const app = express();

// ================= GLOBAL MIDDLEWARE =================
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  })
);

// ================= API ROUTES =================
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
app.use("/receipts", express.static("receipts"));
app.use("/api/fees", require("./routes/feeRoutes"));
app.use("/api/academic-years", require("./routes/academicYearRoutes"));

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

  await seedAdmin();
});

// ================= GLOBAL ERROR =================
process.on("unhandledRejection", (err) => {
  console.error("❌ Unhandled Rejection:", err.message);
  server.close(() => process.exit(1));
});

process.on("uncaughtException", (err) => {
  console.error("❌ Uncaught Exception:", err.message);
  process.exit(1);
});

module.exports = app;
