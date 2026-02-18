const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const { ObjectId } = require("mongodb");
const connectDB = require("../db/connect");

// Multer storage config for PDF manuals
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
    const allowedTypes = /pdf|jpeg|jpg|png/;
    const ext = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    if (ext) return cb(null, true);
    cb(new Error("Only PDFs and images allowed"));
  },
});

// GET all support docs
router.get("/", async (req, res) => {
  try {
    const db = await connectDB();
    const docs = await db
      .collection("support_docs")
      .find()
      .sort({ createdAt: -1 })
      .toArray();
    res.json(docs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET single support doc
router.get("/:id", async (req, res) => {
  try {
    const db = await connectDB();
    const doc = await db
      .collection("support_docs")
      .findOne({ _id: new ObjectId(req.params.id) });
    if (!doc) return res.status(404).json({ error: "Not found" });
    res.json(doc);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST create support doc
router.post("/", upload.single("manual"), async (req, res) => {
  try {
    const {
      productName,
      brand,
      supportPhone,
      supportEmail,
      supportWebsite,
      warrantyExpiry,
      notes,
    } = req.body;

    if (!productName || !brand || !warrantyExpiry) {
      return res.status(400).json({ error: "Product name, brand, and warranty expiry are required" });
    }

    const db = await connectDB();
    const expiryDate = new Date(warrantyExpiry);
    const today = new Date();
    const daysLeft = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));

    const newDoc = {
      productName,
      brand,
      supportPhone: supportPhone || "",
      supportEmail: supportEmail || "",
      supportWebsite: supportWebsite || "",
      warrantyExpiry: expiryDate,
      daysLeft: daysLeft,
      status: daysLeft > 0 ? "Active" : "Expired",
      notes: notes || "",
      manualFile: req.file ? req.file.filename : null,
      createdAt: new Date(),
    };

    const result = await db.collection("support_docs").insertOne(newDoc);
    res.status(201).json({ ...newDoc, _id: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT update support doc
router.put("/:id", upload.single("manual"), async (req, res) => {
  try {
    const {
      productName,
      brand,
      supportPhone,
      supportEmail,
      supportWebsite,
      warrantyExpiry,
      notes,
    } = req.body;

    const db = await connectDB();
    const expiryDate = new Date(warrantyExpiry);
    const today = new Date();
    const daysLeft = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));

    const updateData = {
      productName,
      brand,
      supportPhone: supportPhone || "",
      supportEmail: supportEmail || "",
      supportWebsite: supportWebsite || "",
      warrantyExpiry: expiryDate,
      daysLeft: daysLeft,
      status: daysLeft > 0 ? "Active" : "Expired",
      notes: notes || "",
      updatedAt: new Date(),
    };

    if (req.file) updateData.manualFile = req.file.filename;

    const result = await db
      .collection("support_docs")
      .updateOne({ _id: new ObjectId(req.params.id) }, { $set: updateData });

    if (result.matchedCount === 0)
      return res.status(404).json({ error: "Not found" });
    res.json({ message: "Support doc updated successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE support doc
router.delete("/:id", async (req, res) => {
  try {
    const db = await connectDB();
    const result = await db
      .collection("support_docs")
      .deleteOne({ _id: new ObjectId(req.params.id) });
    if (result.deletedCount === 0)
      return res.status(404).json({ error: "Not found" });
    res.json({ message: "Support doc deleted successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET warranty status summary
router.get("/stats/summary", async (req, res) => {
  try {
    const db = await connectDB();
    const docs = await db.collection("support_docs").find().toArray();
    const today = new Date();

    const active = docs.filter((d) => new Date(d.warrantyExpiry) > today).length;
    const expired = docs.filter((d) => new Date(d.warrantyExpiry) <= today).length;
    const expiringSoon = docs.filter((d) => {
      const days = Math.ceil((new Date(d.warrantyExpiry) - today) / (1000 * 60 * 60 * 24));
      return days > 0 && days <= 30;
    }).length;

    res.json({ total: docs.length, active, expired, expiringSoon });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET search by brand
router.get("/search/:brand", async (req, res) => {
  try {
    const db = await connectDB();
    const docs = await db
      .collection("support_docs")
      .find({ brand: { $regex: req.params.brand, $options: "i" } })
      .toArray();
    res.json(docs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;