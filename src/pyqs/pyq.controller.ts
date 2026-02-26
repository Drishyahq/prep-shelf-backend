import type { Request, Response } from "express";
import prisma from "../config/db.js";
import { cloudinary, uploadToCloudinary } from "../config/cloudinary.js";

export const getPYQs = async (req: Request, res: Response) => {
  try {
    const { degreeId, branchId, subjectId, examYear, semester } = req.query;

    const pyqs = await prisma.pYQPaper.findMany({
      where: {
        isPublished: true,
        isSolution: false,
        ...(examYear && { examYear: parseInt(examYear as string) }),
        ...(semester && { semester: parseInt(semester as string) }),
        ...(degreeId || branchId || subjectId ? {
          degreeBranchSubject: {
            ...(subjectId && { subjectId: parseInt(subjectId as string) }),
            ...(degreeId || branchId ? {
              degreeBranch: {
                ...(degreeId && { degreeId: parseInt(degreeId as string) }),
                ...(branchId && { branchId: parseInt(branchId as string) }),
              }
            } : {})
          }
        } : {})
      },
      include: {
        degreeBranchSubject: {
          include: {
            subject: true,
            degreeBranch: {
              include: {
                degree: true,
                branch: true,
              }
            }
          }
        },
        solutions: true,
      },
      orderBy: { examYear: "desc" },
    });

    res.json({ success: true, data: pyqs });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getPYQById = async (req: Request, res: Response) => {
  try {
    const pyq = await prisma.pYQPaper.findUnique({
      where: { id: parseInt(req.params.id as string) },
      include: {
        degreeBranchSubject: {
          include: {
            subject: true,
            degreeBranch: {
              include: { degree: true, branch: true }
            }
          }
        },
        solutions: true,
      },
    });

    if (!pyq) return res.status(404).json({ success: false, message: "Not found" });

    res.json({ success: true, data: pyq });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const uploadPYQPaper = async (req: Request, res: Response) => {
  try {
    const { title, description, degreeBranchSubjectId, examYear, semester } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const fileUrl = await uploadToCloudinary(req.file.buffer, "pyqs");

    const pyq = await prisma.pYQPaper.create({
      data: {
        title,
        description: description || null,
        fileUrl,
        examYear: parseInt(examYear),
        semester: parseInt(semester),
        degreeBranchSubjectId: parseInt(degreeBranchSubjectId),
        isPublished: false,
      },
    });

    res.status(201).json({ success: true, data: pyq });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const togglePublish = async (req: Request, res: Response) => {
  try {
    const { isPublished } = req.body;

    const pyq = await prisma.pYQPaper.update({
      where: { id: parseInt(req.params.id as string) },
      data: { isPublished },
    });

    res.json({ success: true, data: pyq });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deletePYQ = async (req: Request, res: Response) => {
  try {
    const pyq = await prisma.pYQPaper.findUnique({
      where: { id: parseInt(req.params.id as string) },
    });

    if (!pyq) return res.status(404).json({ success: false, message: "Not found" });

    const urlParts = pyq.fileUrl.split("/");
    const publicId = "pyqs/" + urlParts[urlParts.length - 1]!.split(".")[0]!;

    await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });
    await prisma.pYQPaper.delete({ where: { id: parseInt(req.params.id as string) } });

    res.json({ success: true, message: "Deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updatePYQ = async (req: Request, res: Response) => {
  try {
    const { title, description, examYear, semester } = req.body;
    if (!title && description === undefined && !examYear && !semester) {
      return res.status(400).json({ success: false, message: "Provide at least one field to update" });
    }

    const pyq = await prisma.pYQPaper.update({
      where: { id: parseInt(req.params.id as string) },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description: description || null }),
        ...(examYear && { examYear: parseInt(examYear) }),
        ...(semester && { semester: parseInt(semester) }),
      },
    });

    res.json({ success: true, data: pyq });
  } catch (err: any) {
    if (err.code === "P2025") return res.status(404).json({ success: false, message: "PYQ paper not found" });
    res.status(500).json({ success: false, message: err.message });
  }
};
