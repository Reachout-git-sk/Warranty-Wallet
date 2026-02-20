import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";
import dotenv from "dotenv";

dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const receiptStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "warranty-wallet/receipts",
    allowed_formats: ["jpg", "jpeg", "png", "pdf"],
    resource_type: "auto",
  },
});

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

export { cloudinary, uploadReceipt, uploadManual };