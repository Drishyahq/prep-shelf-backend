import { v2 as cloudinary } from "cloudinary";
import fs from "fs/promises";


// CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET

export interface CloudinaryUploadResult {
    url: string;       // Secure HTTPS URL (save this in DB)
    publicId: string;  // Cloudinary public_id (use this to delete the file)
}

// Uploads a local file to Cloudinary, then deletes it from disk.
// by finally the file is always deleted from the local storage.
export async function uploadToCloudinary(
    localFilePath: string,
    folder: string = "uploads"
): Promise<CloudinaryUploadResult> {
    try {
        const result = await cloudinary.uploader.upload(localFilePath, {
            folder,
            resource_type: "raw", // "raw" is required for PDFs and non-image files
        });

        return {
            url: result.secure_url,
            publicId: result.public_id,
        };
    } finally {
        // Always delete the local temp file — whether upload succeeded or threw
        await fs.unlink(localFilePath).catch((err) => {
            console.error(`Failed to delete local temp file at ${localFilePath}:`, err);
        });
    }
}


// Deletes a previously uploaded file from Cloudinary.
// Delete the file from Cloudinary if the DB write fails
export async function deleteFromCloudinary(publicId: string): Promise<void> {
    await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });
}
