const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const { rateLimit, ipKeyGenerator } = require("express-rate-limit");
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

if (process.env.NODE_ENV === "production") {
  app.set("trust proxy", 1); // 1 = one proxy (nginx / load balancer)
} else {
  app.set("trust proxy", false);
}

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

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  keyGenerator: ipKeyGenerator
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

const adminMetrics = require("./routes/adminMetrics");
app.use("/api/admin/metrics", adminMetrics);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});