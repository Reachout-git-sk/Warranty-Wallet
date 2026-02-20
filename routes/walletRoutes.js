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

// GET stats summary
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
router.post("/", uploadReceipt.single("receipt"), async (req, res) => {
  try {
    const {
      itemName,
      storeName,
      price,
      purchaseDate,
      category,
      notes,
    } = req.body;

    if (!itemName || !storeName || !price || !purchaseDate || !category) {
      return res
        .status(400)
        .json({ error: "All required fields must be filled" });
    }

    const db = await connectDB();

    const warrantyDate = warrantyExpiry ? new Date(warrantyExpiry) : null;
    const today = new Date();
    let warrantyStatus = "No Warranty";
    if (warrantyDate) {
      const daysLeft = Math.ceil((warrantyDate - today) / (1000 * 60 * 60 * 24));
      if (daysLeft <= 0) warrantyStatus = "Expired";
      else if (daysLeft <= 30) warrantyStatus = "Expiring Soon";
      else warrantyStatus = "Active";
    }

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
    const {
      itemName,
      storeName,
      price,
      purchaseDate,
      category,
      notes,
      warrantyExpiry,
    } = req.body;

    const db = await connectDB();

    const warrantyDate = warrantyExpiry ? new Date(warrantyExpiry) : null;
    const today = new Date();
    let warrantyStatus = "No Warranty";
    if (warrantyDate) {
      const daysLeft = Math.ceil((warrantyDate - today) / (1000 * 60 * 60 * 24));
      if (daysLeft <= 0) warrantyStatus = "Expired";
      else if (daysLeft <= 30) warrantyStatus = "Expiring Soon";
      else warrantyStatus = "Active";
    }

    const updateData = {
      itemName,
      storeName,
      price: parseFloat(price),
      purchaseDate: new Date(purchaseDate),
      category,
      notes: notes || "",
      warrantyExpiry: warrantyDate,
      warrantyStatus,
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
  try {
    // Try deleting as image first
    const result = await cloudinary.uploader.destroy(purchase.receiptPublicId);
    // If not found as image, try as raw (PDF)
    if (result.result === "not found") {
      await cloudinary.uploader.destroy(purchase.receiptPublicId, {
        resource_type: "raw",
      });
    }
  } catch (cloudErr) {
    console.error("Cloudinary delete error:", cloudErr.message);
    // Continue with MongoDB delete even if Cloudinary fails
  }
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