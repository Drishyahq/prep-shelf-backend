import { Router } from "express";
import { getNotes, getNoteById, submitNote } from "./notes.controller";
import { uploadSingle } from "../middleware/multer";

const notesRouter = Router();

/**
 * @swagger
 * /notes/{degreeId}/{branchId}/{semester}:
 *   get:
 *     summary: Get notes by program and semester
 *     description: >
 *       Returns published notes for a degree, branch, and semester.
 *       Optionally filter by a specific subject using the `subjectId` query param.
 *       If omitted, notes from all subjects in the branch are returned.
 *     tags: [Notes]
 *     parameters:
 *       - in: path
 *         name: degreeId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the degree
 *       - in: path
 *         name: branchId
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the branch
 *       - in: path
 *         name: semester
 *         required: true
 *         schema:
 *           type: integer
 *         description: Semester number
 *       - in: query
 *         name: subjectId
 *         required: false
 *         schema:
 *           type: integer
 *         description: ID of the subject (optional — omit to get notes for all subjects)
 *     responses:
 *       200:
 *         description: Notes fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Successfully fetched notes
 *                 notes:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Note'
 *       400:
 *         description: Invalid params or semester out of range
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       404:
 *         description: Degree, branch, or subject not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
notesRouter.get("/:degreeId/:branchId/:semester", getNotes);

/**
 * @swagger
 * /notes/{id}:
 *   get:
 *     summary: Get a note by ID
 *     description: Returns a single note along with its degree, branch, and subject context.
 *     tags: [Notes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the note
 *     responses:
 *       200:
 *         description: Note fetched successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Successfully fetched note
 *                 note:
 *                   $ref: '#/components/schemas/Note'
 *       400:
 *         description: Invalid note ID
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       404:
 *         description: Note not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
notesRouter.get("/:id", getNoteById);

/**
 * @swagger
 * /notes:
 *   post:
 *     summary: Upload a new note
 *     description: Upload a PDF note for a specific degree, branch, semester, and subject. Requires multipart/form-data.
 *     tags: [Notes]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - degreeId
 *               - branchId
 *               - semester
 *               - subjectId
 *               - title
 *               - file
 *             properties:
 *               degreeId:
 *                 type: string
 *               branchId:
 *                 type: string
 *               semester:
 *                 type: string
 *               subjectId:
 *                 type: string
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               file:
 *                 type: string
 *                 format: binary
 *                 description: PDF file (max 20MB)
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
 *                 message:
 *                   type: string
 *                   example: Successfully uploaded note
 *                 note:
 *                   $ref: '#/components/schemas/Note'
 *       400:
 *         description: Missing fields, invalid params, or no file uploaded
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       404:
 *         description: Degree, branch, or subject not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
notesRouter.post("/", uploadSingle, submitNote);

export default notesRouter;