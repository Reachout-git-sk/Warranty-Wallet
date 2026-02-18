const express = require("express");
const router = express.Router();

// Sanket's routes will go here
router.get("/test", (req, res) => {
  res.json({ message: "Wallet routes working ✅" });
});

module.exports = router;