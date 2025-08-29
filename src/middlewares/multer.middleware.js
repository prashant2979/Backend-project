import multer from "multer";
import path from "path";
import fs from "fs";

const uploadFolder = path.resolve("public", "uploads");

// Ensure folder exists
fs.mkdirSync(uploadFolder, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadFolder,
  filename: (req, file, cb) => {
    const unique = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const types = ["image/jpeg", "image/png", "image/gif"];
    cb(null, types.includes(file.mimetype));
  },
});

// Helper: return file path if uploaded
const getFilePath = (file) => (file ? `/uploads/${file.filename}` : null);

export { upload, uploadFolder, getFilePath };
