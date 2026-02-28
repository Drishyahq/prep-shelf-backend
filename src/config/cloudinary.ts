import { v2 as cloudinary } from "cloudinary";
import multer from "multer";

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
});



export async function uploadToCloudinary(buffer: Buffer, folder: string, fileName: string): Promise<string> {

  const safeName = fileName.replace(/\s+/g, "-");

  const dataUri = `data:application/pdf;base64,${buffer.toString("base64")}`;

  const result = await cloudinary.uploader.upload(dataUri, {
    folder,
    resource_type: "raw",
    public_id: `${Date.now()}-${safeName}`,
    access_mode: "public"
  });

  return result.secure_url;
}

export { cloudinary };
