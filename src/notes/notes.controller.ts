import type { Request, Response } from "express";
import prisma from "../config/db";
import type { GetNotesParams, GetNotesQuery, GetNoteByIdParams, SubmitNoteBody } from "./notes.types";
import { uploadToCloudinary, deleteFromCloudinary } from "../utils/cloudinary";

// GET /notes/:degreeId/:branchId/:semester?subjectId=<optional>
export const getNotes = async (
    req: Request<GetNotesParams, unknown, unknown, GetNotesQuery>,
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

        // 4a. If subjectId provided — validate it belongs to this branch, then filter by it
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

            const notes = await prisma.note.findMany({
                where: {
                    degreeBranchSubjectId: degreeBranchSubject.id,
                    semester: semesterNum,
                    isPublished: true,
                },
                orderBy: { createdAt: "desc" },
            });

            return res.status(200).json({
                success: true,
                message: "Successfully fetched notes",
                notes,
            });
        }

        // 4b. No subjectId — fetch notes across ALL subjects in this branch + semester
        const notes = await prisma.note.findMany({
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
            message: "Successfully fetched notes",
            notes,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// GET /notes/:id
export const getNoteById = async (req: Request<GetNoteByIdParams>, res: Response) => {
    try {
        const { id } = req.params;
        const idNum = Number(id);

        if (Number.isNaN(idNum)) {
            return res.status(400).json({ message: "Invalid note id" });
        }

        const note = await prisma.note.findUnique({
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

        if (!note) {
            return res.status(404).json({ message: "Note not found" });
        }

        return res.status(200).json({
            success: true,
            message: "Successfully fetched note",
            note,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

// POST /notes
export const submitNote = async (req: Request<Record<string, never>, unknown, SubmitNoteBody>, res: Response) => {
    try {
        const { degreeId, branchId, semester, subjectId, title, description } = req.body;

        // Check all required fields are present
        if (!degreeId || !branchId || !semester || !subjectId || !title) {
            return res.status(400).json({ message: "degreeId, branchId, semester, subjectId and title are required" });
        }

        // Check for uploaded file
        if (!req.file) {
            return res.status(400).json({ message: "File is required" });
        }

        // Parse and validate all fields are valid numbers
        const degreeIdNum = Number(degreeId);
        const branchIdNum = Number(branchId);
        const semesterNum = Number(semester);
        const subjectIdNum = Number(subjectId);

        if (
            Number.isNaN(degreeIdNum) ||
            Number.isNaN(branchIdNum) ||
            Number.isNaN(semesterNum) ||
            Number.isNaN(subjectIdNum)
        ) {
            return res.status(400).json({ message: "degreeId, branchId, semester, and subjectId must be valid numbers" });
        }

        // 1. Check the degree exists
        const degree = await prisma.degree.findUnique({
            where: { id: degreeIdNum },
        });

        if (!degree) {
            return res.status(404).json({ message: "Degree not found" });
        }

        // 2. Validate semester range
        if (semesterNum < 1 || semesterNum > degree.semesters) {
            return res.status(400).json({
                message: `Semester must be between 1 and ${degree.semesters} for this degree`,
            });
        }

        // 3. Check DegreeBranch link exists
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

        // 4. Check DegreeBranchSubject link exists
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

        // 5. Upload to Cloudinary — local temp file is deleted automatically after upload
        const { url: fileUrl, publicId } = await uploadToCloudinary(req.file.path, "notes");

        // 6. Save to DB — if this fails, roll back the Cloudinary upload
        let note;
        try {
            note = await prisma.note.create({
                data: {
                    title: title.trim(),
                    description: description?.trim(),
                    semester: semesterNum,
                    fileUrl,
                    degreeBranchSubjectId: degreeBranchSubject.id,
                },
            });
        } catch (dbError) {
            // DB write failed — delete the already-uploaded Cloudinary file so nothing is orphaned
            await deleteFromCloudinary(publicId).catch((err) =>
                console.error("Cloudinary rollback failed:", err)
            );
            throw dbError; // re-throw so the outer catch returns 500
        }

        return res.status(201).json({
            success: true,
            message: "Successfully uploaded note",
            note,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
