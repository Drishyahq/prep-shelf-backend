import type { Request, Response } from "express";
import prisma from "../config/db.js";

// ── Branches ─────────────────────────────────────────────────────────────────

export const createBranch = async (req: Request, res: Response) => {
  try {
    const { name, degreeIds } = req.body;
    if (!name) return res.status(400).json({ success: false, message: "name is required" });

    const branch = await prisma.$transaction(async (tx) => {
      const b = await tx.branch.create({ data: { name } });
      if (Array.isArray(degreeIds) && degreeIds.length > 0) {
        await tx.degreeBranch.createMany({
          data: degreeIds.map((id: number) => ({ branchId: b.id, degreeId: id })),
          skipDuplicates: true,
        });
      }
      return tx.branch.findUnique({
        where: { id: b.id },
        include: { degrees: { include: { degree: true } } },
      });
    });

    res.status(201).json({ success: true, data: branch });
  } catch (err: any) {
    if (err.code === "P2002") return res.status(409).json({ success: false, message: "Branch already exists" });
    if (err.code === "P2003") return res.status(404).json({ success: false, message: "One or more degrees not found" });
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateBranch = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ success: false, message: "name is required" });

    const branch = await prisma.branch.update({
      where: { id: parseInt(req.params.id as string) },
      data: { name },
    });
    res.json({ success: true, data: branch });
  } catch (err: any) {
    if (err.code === "P2025") return res.status(404).json({ success: false, message: "Branch not found" });
    if (err.code === "P2002") return res.status(409).json({ success: false, message: "Branch name already exists" });
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteBranch = async (req: Request, res: Response) => {
  try {
    await prisma.branch.delete({ where: { id: parseInt(req.params.id as string) } });
    res.json({ success: true, message: "Branch deleted" });
  } catch (err: any) {
    if (err.code === "P2025") return res.status(404).json({ success: false, message: "Branch not found" });
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Degrees ───────────────────────────────────────────────────────────────────

export const createDegree = async (req: Request, res: Response) => {
  try {
    const { name, semesters } = req.body;
    if (!name || !semesters) return res.status(400).json({ success: false, message: "name and semesters are required" });

    const degree = await prisma.degree.create({ data: { name, semesters: parseInt(semesters) } });
    res.status(201).json({ success: true, data: degree });
  } catch (err: any) {
    if (err.code === "P2002") return res.status(409).json({ success: false, message: "Degree already exists" });
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateDegree = async (req: Request, res: Response) => {
  try {
    const { name, semesters } = req.body;
    if (!name && !semesters) return res.status(400).json({ success: false, message: "Provide name or semesters to update" });

    const degree = await prisma.degree.update({
      where: { id: parseInt(req.params.id as string) },
      data: {
        ...(name && { name }),
        ...(semesters && { semesters: parseInt(semesters) }),
      },
    });
    res.json({ success: true, data: degree });
  } catch (err: any) {
    if (err.code === "P2025") return res.status(404).json({ success: false, message: "Degree not found" });
    if (err.code === "P2002") return res.status(409).json({ success: false, message: "Degree name already exists" });
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteDegree = async (req: Request, res: Response) => {
  try {
    await prisma.degree.delete({ where: { id: parseInt(req.params.id as string) } });
    res.json({ success: true, message: "Degree deleted" });
  } catch (err: any) {
    if (err.code === "P2025") return res.status(404).json({ success: false, message: "Degree not found" });
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Subjects ──────────────────────────────────────────────────────────────────

export const createSubject = async (req: Request, res: Response) => {
  try {
    const { name, degreeBranchIds } = req.body;
    if (!name) return res.status(400).json({ success: false, message: "name is required" });

    const subject = await prisma.$transaction(async (tx) => {
      const s = await tx.subject.create({ data: { name } });
      if (Array.isArray(degreeBranchIds) && degreeBranchIds.length > 0) {
        await tx.degreeBranchSubject.createMany({
          data: degreeBranchIds.map((id: number) => ({ subjectId: s.id, degreeBranchId: id })),
          skipDuplicates: true,
        });
      }
      return tx.subject.findUnique({
        where: { id: s.id },
        include: { programs: { include: { degreeBranch: { include: { degree: true, branch: true } } } } },
      });
    });

    res.status(201).json({ success: true, data: subject });
  } catch (err: any) {
    if (err.code === "P2002") return res.status(409).json({ success: false, message: "Subject already exists" });
    if (err.code === "P2003") return res.status(404).json({ success: false, message: "One or more degree-branches not found" });
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateSubject = async (req: Request, res: Response) => {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ success: false, message: "name is required" });

    const subject = await prisma.subject.update({
      where: { id: parseInt(req.params.id as string) },
      data: { name },
    });
    res.json({ success: true, data: subject });
  } catch (err: any) {
    if (err.code === "P2025") return res.status(404).json({ success: false, message: "Subject not found" });
    if (err.code === "P2002") return res.status(409).json({ success: false, message: "Subject name already exists" });
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteSubject = async (req: Request, res: Response) => {
  try {
    await prisma.subject.delete({ where: { id: parseInt(req.params.id as string) } });
    res.json({ success: true, message: "Subject deleted" });
  } catch (err: any) {
    if (err.code === "P2025") return res.status(404).json({ success: false, message: "Subject not found" });
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Degree-Branch links ───────────────────────────────────────────────────────

export const createDegreeBranch = async (req: Request, res: Response) => {
  try {
    const { degreeId, branchId } = req.body;
    if (!degreeId || !branchId) return res.status(400).json({ success: false, message: "degreeId and branchId are required" });

    const link = await prisma.degreeBranch.create({
      data: { degreeId: parseInt(degreeId), branchId: parseInt(branchId) },
      include: { degree: true, branch: true },
    });
    res.status(201).json({ success: true, data: link });
  } catch (err: any) {
    if (err.code === "P2002") return res.status(409).json({ success: false, message: "This degree-branch link already exists" });
    if (err.code === "P2003") return res.status(404).json({ success: false, message: "Degree or Branch not found" });
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteDegreeBranch = async (req: Request, res: Response) => {
  try {
    await prisma.degreeBranch.delete({ where: { id: parseInt(req.params.id as string) } });
    res.json({ success: true, message: "Degree-Branch link deleted" });
  } catch (err: any) {
    if (err.code === "P2025") return res.status(404).json({ success: false, message: "Degree-Branch link not found" });
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── Degree-Branch-Subject links ───────────────────────────────────────────────

export const createDegreeBranchSubject = async (req: Request, res: Response) => {
  try {
    const { degreeBranchId, subjectId } = req.body;
    if (!degreeBranchId || !subjectId) return res.status(400).json({ success: false, message: "degreeBranchId and subjectId are required" });

    const link = await prisma.degreeBranchSubject.create({
      data: { degreeBranchId: parseInt(degreeBranchId), subjectId: parseInt(subjectId) },
      include: { subject: true, degreeBranch: { include: { degree: true, branch: true } } },
    });
    res.status(201).json({ success: true, data: link });
  } catch (err: any) {
    if (err.code === "P2002") return res.status(409).json({ success: false, message: "This subject is already linked to this degree-branch" });
    if (err.code === "P2003") return res.status(404).json({ success: false, message: "DegreeBranch or Subject not found" });
    res.status(500).json({ success: false, message: err.message });
  }
};

export const deleteDegreeBranchSubject = async (req: Request, res: Response) => {
  try {
    await prisma.degreeBranchSubject.delete({ where: { id: parseInt(req.params.id as string) } });
    res.json({ success: true, message: "Degree-Branch-Subject link deleted" });
  } catch (err: any) {
    if (err.code === "P2025") return res.status(404).json({ success: false, message: "Degree-Branch-Subject link not found" });
    res.status(500).json({ success: false, message: err.message });
  }
};
