import type { Request, Response } from "express";
import prisma from "../config/db.js";
import { cloudinary, uploadToCloudinary } from "../config/cloudinary.js";

export const getAssignments = async (req: Request, res: Response) => {
  try {
    const { degreeId, branchId, subjectId, semester } = req.query;

    const assignments = await prisma.assignment.findMany({
      where: {
        isPublished: true,
        isSolution: false,
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
              include: { degree: true, branch: true }
            }
          }
        },
        solutions: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, data: assignments });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAssignmentById = async (req: Request, res: Response) => {
  try {
    const assignment = await prisma.assignment.findUnique({
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

    if (!assignment) return res.status(404).json({ success: false, message: "Not found" });

    res.json({ success: true, data: assignment });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const uploadAssignment = async (req: Request, res: Response) => {
  try {
    const { title, description, degreeBranchSubjectId, semester } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const fileUrl = await uploadToCloudinary(req.file.buffer, "assignments");

    const assignment = await prisma.assignment.create({
      data: {
        title,
        description: description || null,
        fileUrl,
        semester: parseInt(semester),
        degreeBranchSubjectId: parseInt(degreeBranchSubjectId),
        isPublished: false,
      },
    });

    res.status(201).json({ success: true, data: assignment });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const toggleAssignmentPublish = async (req: Request, res: Response) => {
  try {
    const { isPublished } = req.body;

    const assignment = await prisma.assignment.update({
      where: { id: parseInt(req.params.id as string) },
      data: { isPublished },
    });

    res.json({ success: true, data: assignment });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteAssignment = async (req: Request, res: Response) => {
  try {
    const assignment = await prisma.assignment.findUnique({
      where: { id: parseInt(req.params.id as string) },
    });

    if (!assignment) return res.status(404).json({ success: false, message: "Not found" });

    const urlParts = assignment.fileUrl.split("/");
    const publicId = "assignments/" + urlParts[urlParts.length - 1]!.split(".")[0]!;

    await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });
    await prisma.assignment.delete({ where: { id: parseInt(req.params.id as string) } });

    res.json({ success: true, message: "Deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateAssignment = async (req: Request, res: Response) => {
  try {
    const { title, description, semester } = req.body;
    if (!title && description === undefined && !semester) {
      return res.status(400).json({ success: false, message: "Provide at least one field to update" });
    }

    const assignment = await prisma.assignment.update({
      where: { id: parseInt(req.params.id as string) },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description: description || null }),
        ...(semester && { semester: parseInt(semester) }),
      },
    });

    res.json({ success: true, data: assignment });
  } catch (err: any) {
    if (err.code === "P2025") return res.status(404).json({ success: false, message: "Assignment not found" });
    res.status(500).json({ success: false, message: err.message });
  }
};
