import { Router } from "express";
import { getPlaylists, getPlaylistById } from "../controllers/playCircle.controller.js";

const playCircleRouter = Router();

// ... (keep all the swagger comments exactly as they are)

playCircleRouter.get("/:degreeId/:branchId/:semester", getPlaylists);
playCircleRouter.get("/:id", getPlaylistById);

export default playCircleRouter;