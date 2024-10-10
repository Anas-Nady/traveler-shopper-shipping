import { v2 as cloudinary } from "cloudinary";

// types/cloudinary.ts

export interface CloudinaryParams {
  folder: string;
  allowed_formats: string[];
  transformation: object[];
}

// setup cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME as string,
  api_key: process.env.CLOUDINARY_API_KEY as string,
  api_secret: process.env.CLOUDINARY_API_SECRET as string,
});

export default cloudinary;
