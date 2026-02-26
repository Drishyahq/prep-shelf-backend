import { Router } from "express";
import { getNotes, getNoteById, uploadNote, toggleNotePublish, deleteNote } from "./note.controller.js";
import { uploadNote as uploadNoteFile } from "../config/cloudinary.js";

const router = Router();

/**
 * @swagger
 * /notes:
 *   get:
 *     summary: Get published notes
 *     description: Returns all published notes. Optionally filter by degree, branch, subject, and semester.
 *     tags: [Notes]
 *     parameters:
 *       - in: query
 *         name: degreeId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: branchId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: subjectId
 *         schema:
 *           type: integer
 *       - in: query
 *         name: semester
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of notes
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Note'
 *       500:
 *         description: Internal server error
 */
router.get("/", getNotes);

/**
 * @swagger
 * /notes/{id}:
 *   get:
 *     summary: Get a note by ID
 *     tags: [Notes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Note details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Note'
 *       404:
 *         description: Note not found
 *       500:
 *         description: Internal server error
 */
router.get("/:id", getNoteById);

/**
 * @swagger
 * /notes/upload:
 *   post:
 *     summary: Upload a note
 *     description: Uploads a PDF note to Cloudinary. The note is created with isPublished set to false.
 *     tags: [Notes]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [title, degreeBranchSubjectId, semester, file]
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               degreeBranchSubjectId:
 *                 type: integer
 *               semester:
 *                 type: integer
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Note uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Note'
 *       400:
 *         description: No file uploaded
 *       500:
 *         description: Internal server error
 */
router.post("/upload", uploadNoteFile.single("file"), uploadNote);

/**
 * @swagger
 * /notes/{id}/publish:
 *   patch:
 *     summary: Toggle note publish status
 *     tags: [Notes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [isPublished]
 *             properties:
 *               isPublished:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Updated note
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Note'
 *       500:
 *         description: Internal server error
 */
router.patch("/:id/publish", toggleNotePublish);

/**
 * @swagger
 * /notes/{id}:
 *   delete:
 *     summary: Delete a note
 *     description: Deletes the note and removes the associated file from Cloudinary.
 *     tags: [Notes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *       404:
 *         description: Note not found
 *       500:
 *         description: Internal server error
 */
router.delete("/:id", deleteNote);

export default router;
