const express = require("express");
const path = require("path");
const cors = require("cors");
require("dotenv").config();

const walletRoutes = require("./routes/walletRoutes");
const supportRoutes = require("./routes/supportRoutes");
const emailRoutes = require("./routes/emailRoutes");
const { startReminderJob } = require("./services/reminderJob");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/api/purchases", walletRoutes);
app.use("/api/support", supportRoutes);
app.use("/api/email", emailRoutes);

// Serve frontend
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  startReminderJob();
});