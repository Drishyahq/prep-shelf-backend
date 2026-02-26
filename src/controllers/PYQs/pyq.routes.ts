import { Router } from 'express';
import { getPYQs, getPYQById, uploadPYQPaper, togglePublish, deletePYQ } from '../controllers/pyq.controller';
import { uploadPYQ } from '../config/cloudinary';
const router = Router();
router.get('/', getPYQs);
router.get('/:id', getPYQById);
router.post('/upload', uploadPYQ.single('file'), uploadPYQPaper);
router.patch('/:id/publish', togglePublish);
router.delete('/:id', deletePYQ);

export default router;