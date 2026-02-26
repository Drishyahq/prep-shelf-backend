import { Router } from "express";
import { getPlaylists, getPlaylistById } from "./playCircle.controller.js";

const playCircleRouter = Router();

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
 *                   example: Successfully fetched playlists
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
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Successfully fetched playlist
 *                 playcircle:
 *                   $ref: '#/components/schemas/Playcircle'
 *       400:
 *         description: Invalid playlist ID
 *       404:
 *         description: Playlist not found
 *       500:
 *         description: Internal server error
 */
playCircleRouter.get("/:id", getPlaylistById);

export default playCircleRouter;
