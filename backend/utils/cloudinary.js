import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
const uploadOnCloudinary = async (file) => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  try {
    const result = await cloudinary.uploader.upload(file); // upload file image on cloudinary
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
    } // once uplaoded on cloudinary the temp stored file image will be deleted from that folder using unlinksync and fs
    return result.secure_url;
  } catch (error) {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
    } // if file uplod fails temp file still exist so unlink it
    throw error;
  }
};

export default uploadOnCloudinary;
