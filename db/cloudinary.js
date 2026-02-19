const cloudinary = require("cloudinary").v2;
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const multer = require("multer");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage for receipt images (Sanket's module)
const receiptStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "warranty-wallet/receipts",
    allowed_formats: ["jpg", "jpeg", "png", "pdf"],
    resource_type: "auto",
  },
});

// Storage for manual PDFs (Jinam's module)
const manualStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "warranty-wallet/manuals",
    allowed_formats: ["jpg", "jpeg", "png", "pdf"],
    resource_type: "auto",
  },
});

const uploadReceipt = multer({ storage: receiptStorage });
const uploadManual = multer({ storage: manualStorage });

module.exports = { cloudinary, uploadReceipt, uploadManual };