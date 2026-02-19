const express = require("express");
const router = express.Router();
const { ObjectId } = require("mongodb");
const connectDB = require("../db/connect");
const { uploadReceipt } = require("../db/cloudinary");
const { verifyToken } = require("../middleware/auth");

// GET all purchases (current user only)
router.get("/", verifyToken, async (req, res) => {
  try {
    const db = await connectDB();
    const purchases = await db
      .collection("purchases")
      .find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .toArray();
    res.json(purchases);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET stats summary (current user only)
router.get("/stats/summary", verifyToken, async (req, res) => {
  try {
    const db = await connectDB();
    const purchases = await db
      .collection("purchases")
      .find({ userId: req.user.id })
      .toArray();
    const total = purchases.reduce((sum, p) => sum + p.price, 0);
    const byCategory = purchases.reduce((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + p.price;
      return acc;
    }, {});
    res.json({ totalSpent: total.toFixed(2), byCategory, count: purchases.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single purchase
router.get("/:id", verifyToken, async (req, res) => {
  try {
    const db = await connectDB();
    const purchase = await db
      .collection("purchases")
      .findOne({ _id: new ObjectId(req.params.id), userId: req.user.id });
    if (!purchase) return res.status(404).json({ error: "Not found" });
    res.json(purchase);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create purchase
router.post("/", verifyToken, uploadReceipt.single("receipt"), async (req, res) => {
  try {
    const { itemName, storeName, price, purchaseDate, category, notes } = req.body;

    if (!itemName || !storeName || !price || !purchaseDate || !category) {
      return res.status(400).json({ error: "All required fields must be filled" });
    }

    const db = await connectDB();
    const newPurchase = {
      userId: req.user.id,
      itemName,
      storeName,
      price: parseFloat(price),
      purchaseDate: new Date(purchaseDate),
      category,
      notes: notes || "",
      receiptFile: req.file ? req.file.path : null,
      createdAt: new Date(),
    };

    const result = await db.collection("purchases").insertOne(newPurchase);
    res.status(201).json({ ...newPurchase, _id: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update purchase
router.put("/:id", verifyToken, uploadReceipt.single("receipt"), async (req, res) => {
  try {
    const { itemName, storeName, price, purchaseDate, category, notes } = req.body;
    const db = await connectDB();

    const updateData = {
      itemName,
      storeName,
      price: parseFloat(price),
      purchaseDate: new Date(purchaseDate),
      category,
      notes: notes || "",
      updatedAt: new Date(),
    };

    if (req.file) updateData.receiptFile = req.file.path;

    const result = await db
      .collection("purchases")
      .updateOne(
        { _id: new ObjectId(req.params.id), userId: req.user.id },
        { $set: updateData }
      );

    if (result.matchedCount === 0)
      return res.status(404).json({ error: "Not found" });
    res.json({ message: "Purchase updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE purchase
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const db = await connectDB();
    const result = await db
      .collection("purchases")
      .deleteOne({ _id: new ObjectId(req.params.id), userId: req.user.id });
    if (result.deletedCount === 0)
      return res.status(404).json({ error: "Not found" });
    res.json({ message: "Purchase deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;