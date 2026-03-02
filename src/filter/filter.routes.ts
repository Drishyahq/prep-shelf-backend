import { Router } from "express";
import { getBranches, getDegrees, getSubjects, getDegreeBranches, getDegreeBranchSubjectId, getAvailableSubjects, getAvailableYears } from "./filter.controller.js";

const router = Router();

/**
 * @swagger
 * /filters/branches:
 *   get:
 *     summary: Get all branches
 *     description: Returns all branches ordered alphabetically.
 *     tags: [Filters]
 *     responses:
 *       200:
 *         description: List of branches
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
 *                     $ref: '#/components/schemas/Branch'
 *       500:
 *         description: Internal server error
 */
router.get("/branches", getBranches);

/**
 * @swagger
 * /filters/degrees:
 *   get:
 *     summary: Get all degrees
 *     description: Returns all degrees ordered alphabetically.
 *     tags: [Filters]
 *     responses:
 *       200:
 *         description: List of degrees
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
 *                     $ref: '#/components/schemas/Degree'
 *       500:
 *         description: Internal server error
 */
router.get("/degrees", getDegrees);

/**
 * @swagger
 * /filters/subjects:
 *   get:
 *     summary: Get subjects
 *     description: Returns subjects, optionally filtered by degreeId and/or branchId.
 *     tags: [Filters]
 *     parameters:
 *       - in: query
 *         name: degreeId
 *         schema:
 *           type: integer
 *         description: Filter subjects belonging to this degree
 *       - in: query
 *         name: branchId
 *         schema:
 *           type: integer
 *         description: Filter subjects belonging to this branch
 *     responses:
 *       200:
 *         description: List of subjects
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
 *                     $ref: '#/components/schemas/Subject'
 *       500:
 *         description: Internal server error
 */
router.get("/subjects", getSubjects);

/**
 * @swagger
 * /filters/degreeBranchSubjectId:
 *   get:
 *     summary: Get DegreeBranchSubject ID
 *     description: Resolves the junction table ID for a degree + branch + subject combination. Use this ID when uploading notes or PYQs.
 *     tags: [Filters]
 *     parameters:
 *       - in: query
 *         name: degreeId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: branchId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: subjectId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Resolved junction ID
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     degreeBranchSubjectId:
 *                       type: integer
 *                       example: 42
 *       400:
 *         description: Missing required query parameters
 *       404:
 *         description: Degree-Branch or Subject not found
 *       500:
 *         description: Internal server error
 */
router.get("/degree-branches", getDegreeBranches);
router.get("/degreeBranchSubjectId", getDegreeBranchSubjectId);
router.get("/available-subjects", getAvailableSubjects);
router.get("/available-years", getAvailableYears);

export default router;
