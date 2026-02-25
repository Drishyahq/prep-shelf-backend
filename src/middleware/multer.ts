import multer, { type FileFilterCallback, type StorageEngine } from "multer";
import type { Request, RequestHandler } from "express";
import path from "path";

// Only pdf is allowed
type AllowedMimeType = "application/pdf";

const ALLOWED_MIME_TYPES: AllowedMimeType[] = ["application/pdf"];
const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024; // 20 MB
const UPLOAD_DESTINATION = "public/uploads";



const storage: StorageEngine = multer.diskStorage({
    destination(_req: Request, _file: Express.Multer.File, cb) {
        cb(null, UPLOAD_DESTINATION);
    },
    filename(_req: Request, file: Express.Multer.File, cb) {
        const ext = path.extname(file.originalname); // e.g. ".pdf"
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
    },
});



const fileFilter = (
    _req: Request,
    file: Express.Multer.File,
    cb: FileFilterCallback
): void => {
    if ((ALLOWED_MIME_TYPES as string[]).includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error(`Invalid file type. Only PDF files are allowed.`));
    }
};

const multerUpload = multer({
    storage,
    limits: {
        fileSize: MAX_FILE_SIZE_BYTES,
    },
    fileFilter,
});



// Use this for single file upload
export const uploadSingle: RequestHandler = multerUpload.single("file");

// Use this for multiple file uploads (up to `maxCount` files).
export const uploadMultiple = (maxCount: number): RequestHandler =>
    multerUpload.array("files", maxCount);