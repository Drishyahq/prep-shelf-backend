import { Router } from "express";
import { getNotes, getNoteById, uploadNote, toggleNotePublish, deleteNote } from "../controllers/note.controller.js";
import { uploadNote as uploadNoteFile } from "../config/cloudinary.js";

const router = Router();

router.get("/", getNotes);
router.get("/:id", getNoteById);
router.post("/upload", uploadNoteFile.single("file"), uploadNote);
router.patch("/:id/publish", toggleNotePublish);
router.delete("/:id", deleteNote);

export default router;