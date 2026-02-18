const express = require("express");
const router = express.Router();

// Jinam's routes will go here
router.get("/test", (req, res) => {
  res.json({ message: "Support routes working ✅" });
});

module.exports = router;