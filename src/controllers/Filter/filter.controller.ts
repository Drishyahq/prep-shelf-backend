import { Request, Response } from "express";
import prisma from "../lib/prisma.js";
import type { GetSubjectsQuery, GetDegreeBranchSubjectIdQuery } from "./filter.types.js";

export const getBranches = async (req: Request, res: Response) => {
  try {
    const branches = await prisma.branch.findMany({
      orderBy: { name: "asc" },
    });
    res.json({ success: true, data: branches });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getDegrees = async (req: Request, res: Response) => {
  try {
    const degrees = await prisma.degree.findMany({
      orderBy: { name: "asc" },
    });
    res.json({ success: true, data: degrees });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getSubjects = async (req: Request, res: Response) => {
  try {
    const { degreeId, branchId } = req.query;

    const subjects = await prisma.subject.findMany({
      where: {
        ...(degreeId || branchId ? {
          programs: {
            some: {
              degreeBranch: {
                ...(degreeId && { degreeId: parseInt(degreeId as string) }),
                ...(branchId && { branchId: parseInt(branchId as string) }),
              }
            }
          }
        } : {})
      },
      orderBy: { name: "asc" },
    });

    res.json({ success: true, data: subjects });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getDegreeBranchSubjectId = async (req: Request, res: Response) => {
  try {
    const { degreeId, branchId, subjectId } = req.query;

    if (!degreeId || !branchId || !subjectId) {
      return res.status(400).json({ success: false, message: "degreeId, branchId and subjectId are required" });
    }

    const degreeBranch = await prisma.degreeBranch.findUnique({
      where: {
        degreeId_branchId: {
          degreeId: parseInt(degreeId as string),
          branchId: parseInt(branchId as string),
        }
      }
    });

    if (!degreeBranch) {
      return res.status(404).json({ success: false, message: "Degree-Branch combination not found" });
    }

    const degreeBranchSubject = await prisma.degreeBranchSubject.findUnique({
      where: {
        degreeBranchId_subjectId: {
          degreeBranchId: degreeBranch.id,
          subjectId: parseInt(subjectId as string),
        }
      }
    });

    if (!degreeBranchSubject) {
      return res.status(404).json({ success: false, message: "Subject not found for this degree-branch" });
    }

    res.json({ success: true, data: { degreeBranchSubjectId: degreeBranchSubject.id } });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};