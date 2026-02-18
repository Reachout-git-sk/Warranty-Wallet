const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { ObjectId } = require("mongodb");
const connectDB = require("../db/connect");

// Multer storage config for receipt images
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const ext = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    if (ext) return cb(null, true);
    cb(new Error("Only images and PDFs allowed"));
  },
});

// GET all purchases
router.get("/", async (req, res) => {
  try {
    const db = await connectDB();
    const purchases = await db
      .collection("purchases")
      .find()
      .sort({ createdAt: -1 })
      .toArray();
    res.json(purchases);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single purchase
router.get("/:id", async (req, res) => {
  try {
    const db = await connectDB();
    const purchase = await db
      .collection("purchases")
      .findOne({ _id: new ObjectId(req.params.id) });
    if (!purchase) return res.status(404).json({ error: "Not found" });
    res.json(purchase);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create purchase
router.post("/", upload.single("receipt"), async (req, res) => {
  try {
    const { itemName, storeName, price, purchaseDate, category, notes } =
      req.body;

    if (!itemName || !storeName || !price || !purchaseDate || !category) {
      return res.status(400).json({ error: "All required fields must be filled" });
    }

    const db = await connectDB();
    const newPurchase = {
      itemName,
      storeName,
      price: parseFloat(price),
      purchaseDate: new Date(purchaseDate),
      category,
      notes: notes || "",
      receiptFile: req.file ? req.file.filename : null,
      createdAt: new Date(),
    };

    const result = await db.collection("purchases").insertOne(newPurchase);
    res.status(201).json({ ...newPurchase, _id: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update purchase
router.put("/:id", upload.single("receipt"), async (req, res) => {
  try {
    const { itemName, storeName, price, purchaseDate, category, notes } =
      req.body;
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

    if (req.file) updateData.receiptFile = req.file.filename;

    const result = await db
      .collection("purchases")
      .updateOne({ _id: new ObjectId(req.params.id) }, { $set: updateData });

    if (result.matchedCount === 0)
      return res.status(404).json({ error: "Not found" });
    res.json({ message: "Purchase updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE purchase
router.delete("/:id", async (req, res) => {
  try {
    const db = await connectDB();
    const result = await db
      .collection("purchases")
      .deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0)
      return res.status(404).json({ error: "Not found" });
    res.json({ message: "Purchase deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET total spending summary
router.get("/stats/summary", async (req, res) => {
  try {
    const db = await connectDB();
    const purchases = await db.collection("purchases").find().toArray();
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

module.exports = router;