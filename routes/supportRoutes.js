import express from "express";
import { ObjectId } from "mongodb";
import connectDB from "../db/connect.js";
import { uploadManual, cloudinary } from "../db/cloudinary.js";

const router = express.Router();

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

router.get("/stats/summary", async (req, res) => {
  try {
    const db = await connectDB();
    const docs = await db.collection("support_docs").find().toArray();
    const today = new Date();

    const active = docs.filter(
      (d) => new Date(d.warrantyExpiry) > today
    ).length;
    const expired = docs.filter(
      (d) => new Date(d.warrantyExpiry) <= today
    ).length;
    const expiringSoon = docs.filter((d) => {
      const days = Math.ceil(
        (new Date(d.warrantyExpiry) - today) / (1000 * 60 * 60 * 24)
      );
      return days > 0 && days <= 30;
    }).length;

    res.json({ total: docs.length, active, expired, expiringSoon });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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

router.post("/", uploadManual.single("manual"), async (req, res) => {
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
      return res.status(400).json({
        error: "Product name, brand, and warranty expiry are required",
      });
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
      manualFile: req.file ? req.file.path : null,
      manualPublicId: req.file ? req.file.filename : null,
      createdAt: new Date(),
    };

    const result = await db.collection("support_docs").insertOne(newDoc);
    res.status(201).json({ ...newDoc, _id: result.insertedId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/:id", uploadManual.single("manual"), async (req, res) => {
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

    if (req.file) {
      updateData.manualFile = req.file.path;
      updateData.manualPublicId = req.file.filename;
    }

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

router.delete("/:id", async (req, res) => {
  try {
    const db = await connectDB();

    const doc = await db
      .collection("support_docs")
      .findOne({ _id: new ObjectId(req.params.id) });

    if (doc && doc.manualPublicId) {
      try {
        const deleteResult = await cloudinary.uploader.destroy(
          doc.manualPublicId
        );
        if (deleteResult.result === "not found") {
          await cloudinary.uploader.destroy(doc.manualPublicId, {
            resource_type: "raw",
          });
        }
      } catch (cloudErr) {
        console.error("Cloudinary delete error:", cloudErr.message);
      }
    }

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

export default router;