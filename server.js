import express from "express";
import path from "path";
import cors from "cors";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import walletRoutes from "./routes/walletRoutes.js";
import supportRoutes from "./routes/supportRoutes.js";
import emailRoutes from "./routes/emailRoutes.js";
import { startReminderJob } from "./services/reminderJob.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/api/purchases", walletRoutes);
app.use("/api/support", supportRoutes);
app.use("/api/email", emailRoutes);

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  startReminderJob();
});