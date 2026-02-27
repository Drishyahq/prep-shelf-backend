import { v2 as cloudinary } from "cloudinary";
import multer from "multer";

export const upload = multer({ storage: multer.memoryStorage() });

export async function uploadToCloudinary(buffer: Buffer, folder: string): Promise<string> {
  const dataUri = `data:application/octet-stream;base64,${buffer.toString("base64")}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: "raw",
  });

  return result.secure_url;
}

export { cloudinary };
