import type { Request, Response } from "express";
import prisma from "../config/db";
import type { GetPlaylistParams, GetPlaylistByIdParams, GetPlaylistQuery } from "./playCircle.types";

// GET /playcircle/:degreeId/:branchId/:semester?subjectId=<optional>
export const getPlaylists = async (
    req: Request<GetPlaylistParams, unknown, unknown, GetPlaylistQuery>,
    res: Response
) => {
    try {
        const { degreeId, branchId, semester } = req.params;
        const { subjectId } = req.query; // optional

        // Parse and validate required path params
        const degreeIdNum = Number(degreeId);
        const branchIdNum = Number(branchId);
        const semesterNum = Number(semester);

        if (
            Number.isNaN(degreeIdNum) ||
            Number.isNaN(branchIdNum) ||
            Number.isNaN(semesterNum)
        ) {
            return res.status(400).json({ message: "degreeId, branchId, and semester must be valid numbers" });
        }

        // Validate optional subjectId if provided
        const subjectIdNum = subjectId !== undefined ? Number(subjectId) : undefined;
        if (subjectIdNum !== undefined && Number.isNaN(subjectIdNum)) {
            return res.status(400).json({ message: "subjectId must be a valid number" });
        }

        // 1. Check that the Degree exists
        const degree = await prisma.degree.findUnique({
            where: { id: degreeIdNum },
        });

        if (!degree) {
            return res.status(404).json({ message: "Degree not found" });
        }

        // 2. Check that the semester is within range for this degree
        if (semesterNum < 1 || semesterNum > degree.semesters) {
            return res.status(400).json({
                message: `Semester must be between 1 and ${degree.semesters} for this degree`,
            });
        }

        // 3. Check that the DegreeBranch (degree ↔ branch link) exists
        const degreeBranch = await prisma.degreeBranch.findUnique({
            where: {
                degreeId_branchId: {
                    degreeId: degreeIdNum,
                    branchId: branchIdNum,
                },
            },
        });

        if (!degreeBranch) {
            return res.status(404).json({ message: "Branch not found in this degree" });
        }

        // 4a. subjectId provided — validate it belongs to this branch, then filter by it
        if (subjectIdNum !== undefined) {
            const degreeBranchSubject = await prisma.degreeBranchSubject.findUnique({
                where: {
                    degreeBranchId_subjectId: {
                        degreeBranchId: degreeBranch.id,
                        subjectId: subjectIdNum,
                    },
                },
            });

            if (!degreeBranchSubject) {
                return res.status(404).json({ message: "Subject not found in this branch" });
            }

            const playcircles = await prisma.playcircle.findMany({
                where: {
                    degreeBranchSubjectId: degreeBranchSubject.id,
                    semester: semesterNum,
                    isPublished: true,
                },
                orderBy: { createdAt: "desc" },
            });

            return res.status(200).json({
                success: true,
                message: "Successfully fetched playlists",
                playcircles,
            });
        }

        // 4b. No subjectId — fetch playlists across ALL subjects in this branch + semester
        const playcircles = await prisma.playcircle.findMany({
            where: {
                semester: semesterNum,
                isPublished: true,
                degreeBranchSubject: {
                    degreeBranchId: degreeBranch.id,
                },
            },
            orderBy: { createdAt: "desc" },
        });

        return res.status(200).json({
            success: true,
            message: "Successfully fetched playlists",
            playcircles,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// GET /playcircle/:id
export const getPlaylistById = async (req: Request<GetPlaylistByIdParams>, res: Response) => {
    try {
        const { id } = req.params;
        const idNum = Number(id);

        if (Number.isNaN(idNum)) {
            return res.status(400).json({ message: "Invalid playlist id" });
        }

        const playcircle = await prisma.playcircle.findUnique({
            where: { id: idNum },
            include: {
                degreeBranchSubject: {
                    include: {
                        degreeBranch: {
                            include: {
                                degree: true,
                                branch: true,
                            },
                        },
                        subject: true,
                    },
                },
            },
        });

        if (!playcircle) {
            return res.status(404).json({ message: "Playlist not found" });
        }

        return res.status(200).json({
            success: true,
            message: "Successfully fetched playlist",
            playcircle,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
