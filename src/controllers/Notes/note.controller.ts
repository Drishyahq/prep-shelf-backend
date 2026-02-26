import { Request, Response } from "express";
import type { GetNotesQuery, GetNoteByIdParams, UploadNoteBody, ToggleNotePublishBody, DeleteNoteParams } from "./note.types.js";
import prisma from "../lib/prisma.js";
import { cloudinary } from "../config/cloudinary.js";

export const getNotes = async (req: Request, res: Response) => {
  try {
    const { degreeId, branchId, subjectId, semester } = req.query;

    const notes = await prisma.note.findMany({
      where: {
        isPublished: true,
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
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({ success: true, data: notes });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getNoteById = async (req: Request, res: Response) => {
  try {
    const note = await prisma.note.findUnique({
      where: { id: parseInt(req.params.id) },
      include: {
        degreeBranchSubject: {
          include: {
            subject: true,
            degreeBranch: {
              include: { degree: true, branch: true }
            }
          }
        },
      },
    });

    if (!note) return res.status(404).json({ success: false, message: "Not found" });

    res.json({ success: true, data: note });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const uploadNote = async (req: Request, res: Response) => {
  try {
    const { title, description, degreeBranchSubjectId, semester } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const note = await prisma.note.create({
      data: {
        title,
        description: description || null,
        fileUrl: req.file.path,
        semester: parseInt(semester),
        degreeBranchSubjectId: parseInt(degreeBranchSubjectId),
        isPublished: false,
      },
    });

    res.status(201).json({ success: true, data: note });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const toggleNotePublish = async (req: Request, res: Response) => {
  try {
    const { isPublished } = req.body;

    const note = await prisma.note.update({
      where: { id: parseInt(req.params.id) },
      data: { isPublished },
    });

    res.json({ success: true, data: note });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteNote = async (req: Request, res: Response) => {
  try {
    const note = await prisma.note.findUnique({
      where: { id: parseInt(req.params.id) },
    });

    if (!note) return res.status(404).json({ success: false, message: "Not found" });

    const urlParts = note.fileUrl.split("/");
    const publicId = "notes/" + urlParts[urlParts.length - 1].split(".")[0];

    await cloudinary.uploader.destroy(publicId, { resource_type: "raw" });
    await prisma.note.delete({ where: { id: parseInt(req.params.id) } });

    res.json({ success: true, message: "Deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};