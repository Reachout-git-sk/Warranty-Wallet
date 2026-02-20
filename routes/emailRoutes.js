import express from "express";
import connectDB from "../db/connect.js";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const db = await connectDB();
    const settings = await db
      .collection("settings")
      .findOne({ key: "notificationEmail" });
    res.json({ email: settings ? settings.value : "" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const db = await connectDB();
    await db.collection("settings").updateOne(
      { key: "notificationEmail" },
      {
        $set: {
          key: "notificationEmail",
          value: email,
          updatedAt: new Date(),
        },
      },
      { upsert: true }
    );

    res.json({ message: "Notification email saved successfully", email });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/test", async (req, res) => {
  try {
    const { checkWarranties } = await import("../services/reminderJob.js");
    await checkWarranties();
    res.json({ message: "Reminder email triggered successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;