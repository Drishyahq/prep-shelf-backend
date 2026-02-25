import { Router } from "express";
import { getPlaylists, getPlaylistById } from "./playCircle.controller";

const playCircleRouter = Router();

/**
 * @swagger
 * /playcircle/{degreeId}/{branchId}/{semester}:
 *   get:
 *     summary: Get playlists by program and semester
 *     description: >
 *       Returns published playlists for a degree, branch, and semester.
 *       Optionally filter by a specific subject using the `subjectId` query param.
 *       If omitted, playlists from all subjects in the branch are returned.
 *     tags: [Playcircle]
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
 *         description: ID of the subject (optional — omit to get playlists for all subjects)
 *     responses:
 *       200:
 *         description: Playlists fetched successfully
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
playCircleRouter.get("/:degreeId/:branchId/:semester", getPlaylists);

/**
 * @swagger
 * /playcircle/{id}:
 *   get:
 *     summary: Get a playlist by ID
 *     description: Returns a single playlist along with its degree, branch, and subject context.
 *     tags: [Playcircle]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID of the playlist
 *     responses:
 *       200:
 *         description: Playlist fetched successfully
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
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiError'
 *       404:
 *         description: Playlist not found
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
playCircleRouter.get("/:id", getPlaylistById);

export default playCircleRouter;
