import { Router } from "express";
import { login, logout, getDashboardStats, getAllPYQs, getAllNotes, getAllAssignments, getAllPlaycircle } from "./admin.controller.js";
import { authenticate } from "../middleware/auth.js";

const adminRouter = Router();

/**
 * @swagger
 * /admin/login:
 *   post:
 *     summary: Admin login
 *     description: Authenticate an admin and receive a JWT token. A session is created in the database.
 *     tags: [Admin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdminLoginBody'
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdminLoginResponse'
 *       400:
 *         description: Missing email or password
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
adminRouter.post("/login", login);

/**
 * @swagger
 * /admin/logout:
 *   post:
 *     summary: Admin logout
 *     description: Revoke the current session by deleting the token from the database.
 *     tags: [Admin]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Logged out successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/MessageResponse'
 *       400:
 *         description: Token not provided
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 */
adminRouter.post("/logout", authenticate, logout);

// ─── Dashboard stats ────────────────────────────────────────────────────────
adminRouter.get("/stats", authenticate, getDashboardStats);

// ─── Admin-only resource listing (all items, including unpublished) ──────────
adminRouter.get("/pyqs", authenticate, getAllPYQs);
adminRouter.get("/notes", authenticate, getAllNotes);
adminRouter.get("/assignments", authenticate, getAllAssignments);
adminRouter.get("/playcircle", authenticate, getAllPlaycircle);

export default adminRouter;
