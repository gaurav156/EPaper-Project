const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected ✅"))
  .catch((err) => console.error(err));

// Test route
app.get("/", (req, res) => {
  res.send("E-Paper Backend is running 🚀");
});

const authRoutes = require("./routes/auth");
app.use("/api/auth", authRoutes);

const uploadRoutes = require("./routes/upload");
app.use("/api/upload", uploadRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});