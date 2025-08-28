import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) throw new Error("No file path provided");

    // Upload file to Cloudinary
    const response = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
      use_filename: true,     // keep original filename
      unique_filename: true,  // ensure uniqueness
      overwrite: false,       // prevent overwriting existing files
    });

    // Remove local file after upload
    if (fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);

    return response;  // still returning full response as before
  } catch (error) {
    // Remove local file only if it exists
    if (fs.existsSync(localFilePath)) fs.unlinkSync(localFilePath);
    console.error("Cloudinary upload failed:", error.message || error);
    return null;
  }
};

export default uploadOnCloudinary;
