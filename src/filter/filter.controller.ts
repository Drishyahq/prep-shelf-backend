import type { Request, Response } from "express";
import prisma from "../config/db.js";

export const getBranches = async (_req: Request, res: Response) => {
  try {
    const branches = await prisma.branch.findMany({
      orderBy: { name: "asc" },
    });
    res.json({ success: true, data: branches });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getDegrees = async (_req: Request, res: Response) => {
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
      include: {
        programs: {
          include: {
            degreeBranch: {
              include: { degree: true, branch: true },
            },
          },
        },
      },
      orderBy: { name: "asc" },
    });

    res.json({ success: true, data: subjects });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getDegreeBranches = async (_req: Request, res: Response) => {
  try {
    const degreeBranches = await prisma.degreeBranch.findMany({
      include: { degree: true, branch: true },
      orderBy: [{ degree: { name: "asc" } }, { branch: { name: "asc" } }],
    });
    res.json({ success: true, data: degreeBranches });
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

/**
 * GET /filters/available-subjects?resourceType=pyqs&degreeId=1&branchId=2&semester=3
 * Returns only subjects that have at least one published resource of the given type
 * for the selected degree + branch (and optionally semester).
 */
export const getAvailableSubjects = async (req: Request, res: Response) => {
  try {
    const { resourceType, degreeId, branchId, semester } = req.query;

    if (!resourceType || !degreeId || !branchId) {
      return res.status(400).json({
        success: false,
        message: "resourceType, degreeId, and branchId are required",
      });
    }

    // Build the "has at least one published resource" filter based on resourceType
    const semesterFilter = semester ? { semester: parseInt(semester as string) } : {};
    const publishedFilter = { isPublished: true, ...semesterFilter };

    let resourceRelation: Record<string, any>;
    switch (resourceType) {
      case "pyqs":
        resourceRelation = { pyqPapers: { some: { isPublished: true, isSolution: false } } };
        break;
      case "notes":
        resourceRelation = { notes: { some: publishedFilter } };
        break;
      case "assignments":
        resourceRelation = { assignments: { some: { ...publishedFilter, isSolution: false } } };
        break;
      case "playcircle":
        resourceRelation = { playcircles: { some: publishedFilter } };
        break;
      default:
        return res.status(400).json({ success: false, message: "Invalid resourceType" });
    }

    const subjects = await prisma.subject.findMany({
      where: {
        programs: {
          some: {
            degreeBranch: {
              degreeId: parseInt(degreeId as string),
              branchId: parseInt(branchId as string),
            },
            ...resourceRelation,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    res.json({ success: true, data: subjects });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /filters/available-years?degreeId=1&branchId=2&subjectId=3
 * Returns distinct exam years (descending) from published PYQ papers
 * for the selected degree + branch (and optionally subject).
 */
export const getAvailableYears = async (req: Request, res: Response) => {
  try {
    const { degreeId, branchId, subjectId } = req.query;

    if (!degreeId || !branchId) {
      return res.status(400).json({
        success: false,
        message: "degreeId and branchId are required",
      });
    }

    const pyqs = await prisma.pYQPaper.findMany({
      where: {
        isPublished: true,
        isSolution: false,
        ...(subjectId && {
          degreeBranchSubject: {
            subjectId: parseInt(subjectId as string),
          },
        }),
        degreeBranchSubject: {
          ...(subjectId && { subjectId: parseInt(subjectId as string) }),
          degreeBranch: {
            degreeId: parseInt(degreeId as string),
            branchId: parseInt(branchId as string),
          },
        },
      },
      select: { examYear: true },
      distinct: ["examYear"],
      orderBy: { examYear: "desc" },
    });

    const years = pyqs.map((p) => p.examYear);
    res.json({ success: true, data: years });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
