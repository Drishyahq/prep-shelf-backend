import { Router } from "express";
import { getBranches, getDegrees, getSubjects, getDegreeBranchSubjectId } from "../controllers/filter.controller.js";

const router = Router();

router.get("/branches", getBranches);
router.get("/degrees", getDegrees);
router.get("/subjects", getSubjects);
router.get("/degreeBranchSubjectId", getDegreeBranchSubjectId);

export default router;