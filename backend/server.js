const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();
require("./utils/imageCleanupScheduler");

const app = express();
const cookieParser = require("cookie-parser");

app.use(
  cors({
    origin: process.env.FRONTEND_BASE_URL || "http://localhost:3000",
    credentials: true
  })
);

app.use(express.json());

app.use(cookieParser());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected ✅"))
  .catch((err) => console.error(err));

// Test route
app.get("/", (req, res) => {
  res.send("E-Paper Backend is running 🚀");
});

const rateLimit = require("express-rate-limit");

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300
});

app.use("/api", apiLimiter);

const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10
});

app.use("/api/auth/login", authLimiter);

const uploadRoutes = require("./routes/upload");
app.use("/api/upload", uploadRoutes);

const maskRoutes = require("./routes/masks");
app.use("/api/masks", maskRoutes);

const pageRoutes = require("./routes/pages");
app.use("/api/pages", pageRoutes);

const articleRoutes = require("./routes/articles");
app.use("/api/articles", articleRoutes);

const editionRoutes = require("./routes/editions");
app.use("/api/editions", editionRoutes);

const adminRoutes = require("./routes/admin");
app.use("/api/admin", adminRoutes);

const adminAuditRoutes = require("./routes/adminAudit");
app.use("/api/admin/audit", adminAuditRoutes);

const adminSessions = require("./routes/adminSessions");
app.use("/api/admin/sessions", adminSessions);

const adminMetrics = require("./routes/adminMetrics");
app.use("/api/admin/metrics", adminMetrics);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});