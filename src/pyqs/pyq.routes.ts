import { Router } from "express";
import { getPYQs, getPYQById, uploadPYQPaper, togglePublish, deletePYQ, updatePYQ } from "./pyq.controller.js";
import { upload } from "../config/cloudinary.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

/**
 * @swagger
 * /pyqs:
 *   get:
 *     summary: Get published PYQ papers
 *     description: Returns all published PYQ papers (excluding solutions). Optionally filter by degree, branch, subject, exam year, and semester.
 *     tags: [PYQs]
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
 *         name: examYear
 *         schema:
 *           type: integer
 *         description: Filter by exam year (e.g. 2023)
 *       - in: query
 *         name: semester
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of PYQ papers
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
 *                     $ref: '#/components/schemas/PYQPaper'
 *       500:
 *         description: Internal server error
 */
router.get("/", getPYQs);

/**
 * @swagger
 * /pyqs/{id}:
 *   get:
 *     summary: Get a PYQ paper by ID
 *     tags: [PYQs]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: PYQ paper details with solutions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/PYQPaper'
 *       404:
 *         description: PYQ paper not found
 *       500:
 *         description: Internal server error
 */
router.get("/:id", getPYQById);

/**
 * @swagger
 * /pyqs/upload:
 *   post:
 *     summary: Upload a PYQ paper
 *     description: Uploads a PDF PYQ paper to Cloudinary. The paper is created with isPublished set to false.
 *     tags: [PYQs]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [title, degreeBranchSubjectId, examYear, semester, file]
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               degreeBranchSubjectId:
 *                 type: integer
 *               examYear:
 *                 type: integer
 *                 example: 2023
 *               semester:
 *                 type: integer
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: PYQ paper uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/PYQPaper'
 *       400:
 *         description: No file uploaded
 *       500:
 *         description: Internal server error
 */
router.post("/upload", upload.single("file"), uploadPYQPaper);

/**
 * @swagger
 * /pyqs/{id}:
 *   patch:
 *     summary: Update PYQ metadata (Admin)
 *     tags: [PYQs]
 *     security:
 *       - BearerAuth: []
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
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               examYear:
 *                 type: integer
 *               semester:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Updated PYQ paper
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/PYQPaper'
 *       400:
 *         description: No fields provided
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: PYQ paper not found
 *       500:
 *         description: Internal server error
 */
router.patch("/:id", authenticate, updatePYQ);

/**
 * @swagger
 * /pyqs/{id}/publish:
 *   patch:
 *     summary: Toggle PYQ publish status (Admin)
 *     tags: [PYQs]
 *     security:
 *       - BearerAuth: []
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
 *         description: Updated PYQ paper
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/PYQPaper'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.patch("/:id/publish", authenticate, togglePublish);

/**
 * @swagger
 * /pyqs/{id}:
 *   delete:
 *     summary: Delete a PYQ paper (Admin)
 *     description: Deletes the PYQ paper and removes the associated file from Cloudinary.
 *     tags: [PYQs]
 *     security:
 *       - BearerAuth: []
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
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: PYQ paper not found
 *       500:
 *         description: Internal server error
 */
router.delete("/:id", authenticate, deletePYQ);

export default router;
