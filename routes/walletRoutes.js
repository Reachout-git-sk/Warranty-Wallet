const express = require("express");
const router = express.Router();
const { ObjectId } = require("mongodb");
const connectDB = require("../db/connect");
const { uploadReceipt } = require("../db/cloudinary");

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

// GET stats summary — MUST be before /:id
router.get("/stats/summary", async (req, res) => {
  try {
    const db = await connectDB();
    const purchases = await db.collection("purchases").find().toArray();
    const total = purchases.reduce((sum, p) => sum + p.price, 0);
    const byCategory = purchases.reduce((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + p.price;
      return acc;
    }, {});
    res.json({
      totalSpent: total.toFixed(2),
      byCategory,
      count: purchases.length,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single purchase — MUST be after /stats/summary
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
router.post("/", uploadReceipt.single("receipt"), async (req, res) => {
  try {
    const { itemName, storeName, price, purchaseDate, category, notes } =
      req.body;

    if (!itemName || !storeName || !price || !purchaseDate || !category) {
      return res
        .status(400)
        .json({ error: "All required fields must be filled" });
    }

    const db = await connectDB();
    const newPurchase = {
      itemName,
      storeName,
      price: parseFloat(price),
      purchaseDate: new Date(purchaseDate),
      category,
      notes: notes || "",
      receiptFile: req.file ? req.file.path : null,
      receiptPublicId: req.file ? req.file.filename : null,
      createdAt: new Date(),
    };

    const result = await db.collection("purchases").insertOne(newPurchase);
    res.status(201).json({ ...newPurchase, _id: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update purchase
router.put("/:id", uploadReceipt.single("receipt"), async (req, res) => {
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

    if (req.file) {
      updateData.receiptFile = req.file.path;
      updateData.receiptPublicId = req.file.filename;
    }

    const result = await db
      .collection("purchases")
      .updateOne(
        { _id: new ObjectId(req.params.id) },
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
router.delete("/:id", async (req, res) => {
  try {
    const db = await connectDB();
    const { cloudinary } = require("../db/cloudinary");

    const purchase = await db
      .collection("purchases")
      .findOne({ _id: new ObjectId(req.params.id) });

    if (purchase && purchase.receiptPublicId) {
      await cloudinary.uploader.destroy(purchase.receiptPublicId, {
        resource_type: "auto",
      });
    }

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

module.exports = router;