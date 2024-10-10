import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary, { CloudinaryParams } from "./cloudnary";

// Configure Cloudinary storage.
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "user_photos",
    allowed_formats: ["png", "jpg", "jpeg"],
    transformation: [{ width: 300, height: 300, crop: "limit" }],
  } as CloudinaryParams,
});

const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 1 }, // limit file size to 2MB
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith("image/")) {
      cb(new Error("Only image file are allowed") as any, false);
    } else {
      cb(null, true);
    }
  },
});

export default upload;
