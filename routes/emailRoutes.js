const express = require("express");
const router = express.Router();
const connectDB = require("../db/connect");

// GET current notification email
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

// POST save notification email
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

// POST test email — must be before any /:param routes
router.post("/test", async (req, res) => {
  try {
    const { checkWarranties } = require("../services/reminderJob");
    await checkWarranties();
    res.json({ message: "Test email triggered successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;