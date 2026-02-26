import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import {
  createBranch, updateBranch, deleteBranch,
  createDegree, updateDegree, deleteDegree,
  createSubject, updateSubject, deleteSubject,
  createDegreeBranch, deleteDegreeBranch,
  createDegreeBranchSubject, deleteDegreeBranchSubject,
} from "./catalog.controller.js";

const router = Router();

// All catalog routes require admin auth
router.use(authenticate);

// ── Branches ──────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /catalog/branches:
 *   post:
 *     summary: Create a branch
 *     tags: [Catalog]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Computer Science
 *               degreeIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Optional. Degree IDs to link this branch to immediately.
 *                 example: [1, 2]
 *     responses:
 *       201:
 *         description: Branch created (with degree links if degreeIds provided)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Branch'
 *       400:
 *         description: Missing name
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: One or more degrees not found
 *       409:
 *         description: Branch already exists
 */
router.post("/branches", createBranch);

/**
 * @swagger
 * /catalog/branches/{id}:
 *   patch:
 *     summary: Update a branch name
 *     tags: [Catalog]
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
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Branch updated
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Branch not found
 *       409:
 *         description: Name already taken
 *   delete:
 *     summary: Delete a branch
 *     tags: [Catalog]
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
 *         description: Branch deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Branch not found
 */
router.patch("/branches/:id", updateBranch);
router.delete("/branches/:id", deleteBranch);

// ── Degrees ───────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /catalog/degrees:
 *   post:
 *     summary: Create a degree
 *     tags: [Catalog]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, semesters]
 *             properties:
 *               name:
 *                 type: string
 *                 example: B.Tech
 *               semesters:
 *                 type: integer
 *                 example: 8
 *     responses:
 *       201:
 *         description: Degree created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Degree'
 *       400:
 *         description: Missing fields
 *       401:
 *         description: Unauthorized
 *       409:
 *         description: Degree already exists
 */
router.post("/degrees", createDegree);

/**
 * @swagger
 * /catalog/degrees/{id}:
 *   patch:
 *     summary: Update a degree
 *     tags: [Catalog]
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
 *               name:
 *                 type: string
 *               semesters:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Degree updated
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Degree not found
 *   delete:
 *     summary: Delete a degree
 *     tags: [Catalog]
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
 *         description: Degree deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Degree not found
 */
router.patch("/degrees/:id", updateDegree);
router.delete("/degrees/:id", deleteDegree);

// ── Subjects ──────────────────────────────────────────────────────────────────

/**
 * @swagger
 * /catalog/subjects:
 *   post:
 *     summary: Create a subject
 *     tags: [Catalog]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 example: Data Structures
 *               degreeBranchIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Optional. DegreeBranch IDs to link this subject to immediately.
 *                 example: [1, 3]
 *     responses:
 *       201:
 *         description: Subject created (with degree-branch links if degreeBranchIds provided)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Subject'
 *       400:
 *         description: Missing name
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: One or more degree-branches not found
 *       409:
 *         description: Subject already exists
 */
router.post("/subjects", createSubject);

/**
 * @swagger
 * /catalog/subjects/{id}:
 *   patch:
 *     summary: Update a subject name
 *     tags: [Catalog]
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
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Subject updated
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Subject not found
 *   delete:
 *     summary: Delete a subject
 *     tags: [Catalog]
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
 *         description: Subject deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Subject not found
 */
router.patch("/subjects/:id", updateSubject);
router.delete("/subjects/:id", deleteSubject);

// ── Degree-Branch links ───────────────────────────────────────────────────────

/**
 * @swagger
 * /catalog/degree-branches:
 *   post:
 *     summary: Link a degree to a branch
 *     tags: [Catalog]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [degreeId, branchId]
 *             properties:
 *               degreeId:
 *                 type: integer
 *               branchId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Link created
 *       400:
 *         description: Missing fields
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Degree or Branch not found
 *       409:
 *         description: Link already exists
 */
router.post("/degree-branches", createDegreeBranch);

/**
 * @swagger
 * /catalog/degree-branches/{id}:
 *   delete:
 *     summary: Remove a degree-branch link
 *     tags: [Catalog]
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
 *         description: Link deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Link not found
 */
router.delete("/degree-branches/:id", deleteDegreeBranch);

// ── Degree-Branch-Subject links ───────────────────────────────────────────────

/**
 * @swagger
 * /catalog/degree-branch-subjects:
 *   post:
 *     summary: Link a subject to a degree-branch
 *     tags: [Catalog]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [degreeBranchId, subjectId]
 *             properties:
 *               degreeBranchId:
 *                 type: integer
 *               subjectId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Link created
 *       400:
 *         description: Missing fields
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: DegreeBranch or Subject not found
 *       409:
 *         description: Link already exists
 */
router.post("/degree-branch-subjects", createDegreeBranchSubject);

/**
 * @swagger
 * /catalog/degree-branch-subjects/{id}:
 *   delete:
 *     summary: Remove a degree-branch-subject link
 *     tags: [Catalog]
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
 *         description: Link deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Link not found
 */
router.delete("/degree-branch-subjects/:id", deleteDegreeBranchSubject);

export default router;
