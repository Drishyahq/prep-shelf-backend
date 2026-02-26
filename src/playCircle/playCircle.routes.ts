import { Router } from "express";
import {
  getPlaylists, getPlaylistById,
  createPlaylist, updatePlaylist, togglePlaylistPublish, deletePlaylist,
} from "./playCircle.controller.js";
import { authenticate } from "../middleware/auth.js";

const playCircleRouter = Router();

/**
 * @swagger
 * /playcircle:
 *   post:
 *     summary: Create a playlist (Admin)
 *     tags: [PlayCircle]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [title, playlistUrl, degreeBranchSubjectId, semester]
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               playlistUrl:
 *                 type: string
 *                 example: https://youtube.com/playlist?list=...
 *               degreeBranchSubjectId:
 *                 type: integer
 *               semester:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Playlist created (unpublished)
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Playcircle'
 *       400:
 *         description: Missing required fields
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
playCircleRouter.post("/", authenticate, createPlaylist);

/**
 * @swagger
 * /playcircle/{degreeId}/{branchId}/{semester}:
 *   get:
 *     summary: Get playlists for a degree, branch, and semester
 *     description: Returns all published playlists for the given degree, branch, and semester. Optionally filter by a specific subject.
 *     tags: [PlayCircle]
 *     parameters:
 *       - in: path
 *         name: degreeId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: branchId
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: semester
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: subjectId
 *         schema:
 *           type: integer
 *         description: Optional. Filter playlists by a specific subject.
 *     responses:
 *       200:
 *         description: List of playlists
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
 *                 playcircles:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Playcircle'
 *       400:
 *         description: Invalid path parameters or semester out of range
 *       404:
 *         description: Degree, branch, or subject not found
 *       500:
 *         description: Internal server error
 */
playCircleRouter.get("/:degreeId/:branchId/:semester", getPlaylists);

/**
 * @swagger
 * /playcircle/{id}:
 *   get:
 *     summary: Get a playlist by ID
 *     tags: [PlayCircle]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Playlist details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 playcircle:
 *                   $ref: '#/components/schemas/Playcircle'
 *       400:
 *         description: Invalid playlist ID
 *       404:
 *         description: Playlist not found
 *       500:
 *         description: Internal server error
 *   patch:
 *     summary: Update playlist metadata (Admin)
 *     tags: [PlayCircle]
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
 *               playlistUrl:
 *                 type: string
 *               semester:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Updated playlist
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Playcircle'
 *       400:
 *         description: No fields provided
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Playlist not found
 *   delete:
 *     summary: Delete a playlist (Admin)
 *     tags: [PlayCircle]
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
 *         description: Playlist deleted
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Playlist not found
 *       500:
 *         description: Internal server error
 */
playCircleRouter.get("/:id", getPlaylistById);
playCircleRouter.patch("/:id", authenticate, updatePlaylist);
playCircleRouter.delete("/:id", authenticate, deletePlaylist);

/**
 * @swagger
 * /playcircle/{id}/publish:
 *   patch:
 *     summary: Toggle playlist publish status (Admin)
 *     tags: [PlayCircle]
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
 *         description: Updated playlist
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   $ref: '#/components/schemas/Playcircle'
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Playlist not found
 *       500:
 *         description: Internal server error
 */
playCircleRouter.patch("/:id/publish", authenticate, togglePlaylistPublish);

export default playCircleRouter;
