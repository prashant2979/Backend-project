import multer from "multer";
import path from "path";
import fs from "fs";

// Define folder for uploads
const uploadFolder = path.join(process.cwd(), "public", "uploads");

// Ensure folder exists
if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder, { recursive: true });
}

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadFolder);
  },
  filename: (req, file, cb) => {
    // Use original filename plus unique suffix to avoid overwrites
    const timestamp = Date.now();
    const random = Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const safeName = file.originalname
      .replace(/\s+/g, "-")
      .replace(/[^a-zA-Z0-9\-]/g, "");
    cb(null, `${file.fieldname}-${safeName}-${timestamp}-${random}${ext}`);
  },
});

// File filter (only images allowed)
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ["image/jpeg", "image/png", "image/gif"];
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, PNG, and GIF image files are allowed"), false);
  }
};

// Initialize multer
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
});

// Utility function to safely extract uploaded files
const getFilePath = (file) => (file ? `/uploads/${file.filename}` : null);

export { upload, uploadFolder, getFilePath };
