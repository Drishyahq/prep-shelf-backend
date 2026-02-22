import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME!,
  api_key: process.env.CLOUDINARY_API_KEY!,
  api_secret: process.env.CLOUDINARY_API_SECRET!,
});

const pyqStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'pyqs',
    resource_type: 'raw',
    allowed_formats: ['pdf'],
  } as any,
});

const assignmentStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'assignments',
    resource_type: 'raw',
    allowed_formats: ['pdf'],
  } as any,
});

const noteStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'notes',
    resource_type: 'raw',
    allowed_formats: ['pdf'],
  } as any,
});

export const uploadPYQ = multer({ storage: pyqStorage });
export const uploadAssignment = multer({ storage: assignmentStorage });
export const uploadNote = multer({ storage: noteStorage });
export { cloudinary };