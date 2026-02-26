import { Router } from "express";
import {
  getAssignments, getAssignmentById, uploadAssignment, uploadAssignmentSolution,
  toggleAssignmentPublish, deleteAssignment, updateAssignment,
} from "./assignment.controller.js";
import { upload } from "../config/cloudinary.js";
import { authenticate } from "../middleware/auth.js";

const router = Router();

/**
 * @swagger
 * /assignments:
 *   get:
 *     summary: Get published assignments
 *     description: Returns all published assignments (excluding solutions). Optionally filter by degree, branch, subject, and semester.
 *     tags: [Assignments]
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
 *         description: List of assignments
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
 *                     $ref: '#/components/schemas/Assignment'
 *       500:
 *         description: Internal server error
 */
router.get("/", getAssignments);

/**
 * @swagger
 * /assignments/{id}:
 *   get:
 *     summary: Get an assignment by ID
 *     tags: [Assignments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Assignment details with solutions
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Assignment'
 *       404:
 *         description: Assignment not found
 *       500:
 *         description: Internal server error
 */
router.get("/:id", getAssignmentById);

/**
 * @swagger
 * /assignments/upload:
 *   post:
 *     summary: Upload an assignment
 *     description: Uploads a PDF assignment to Cloudinary. Created with isPublished set to false.
 *     tags: [Assignments]
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
 *         description: Assignment uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Assignment'
 *       400:
 *         description: No file uploaded
 *       500:
 *         description: Internal server error
 */
router.post("/upload", upload.single("file"), uploadAssignment);

/**
 * @swagger
 * /assignments/{id}:
 *   patch:
 *     summary: Update assignment metadata (Admin)
 *     tags: [Assignments]
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
 *               semester:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Updated assignment
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Assignment'
 *       400:
 *         description: No fields provided
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Assignment not found
 *       500:
 *         description: Internal server error
 */
router.patch("/:id", authenticate, updateAssignment);

/**
 * @swagger
 * /assignments/{id}/publish:
 *   patch:
 *     summary: Toggle assignment publish status (Admin)
 *     tags: [Assignments]
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
 *         description: Updated assignment
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Assignment'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.patch("/:id/publish", authenticate, toggleAssignmentPublish);

/**
 * @swagger
 * /assignments/{id}:
 *   delete:
 *     summary: Delete an assignment (Admin)
 *     description: Deletes the assignment and removes the associated file from Cloudinary.
 *     tags: [Assignments]
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
 *         description: Assignment not found
 *       500:
 *         description: Internal server error
 */
router.delete("/:id", authenticate, deleteAssignment);

/**
 * @swagger
 * /assignments/{id}/solution:
 *   post:
 *     summary: Upload a solution for an assignment
 *     description: Uploads a PDF solution for the given assignment. Created with isPublished set to false. Title defaults to "Solution - <parent title>" if not provided.
 *     tags: [Assignments]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the assignment this solution belongs to
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required: [file]
 *             properties:
 *               title:
 *                 type: string
 *                 description: Optional. Defaults to "Solution - <parent title>"
 *               description:
 *                 type: string
 *               file:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Solution uploaded successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   $ref: '#/components/schemas/Assignment'
 *       400:
 *         description: No file uploaded or target is already a solution
 *       404:
 *         description: Assignment not found
 *       500:
 *         description: Internal server error
 */
router.post("/:id/solution", upload.single("file"), uploadAssignmentSolution);

export default router;
