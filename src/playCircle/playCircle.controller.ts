import type { Request, Response } from "express";
import prisma from "../config/db.js";
import type { GetPlaylistParams, GetPlaylistByIdParams, GetPlaylistQuery } from "./playCircle.types.js";

// GET /playcircle/:degreeId/:branchId/:semester?subjectId=<optional>
export const getPlaylists = async (
  req: Request<GetPlaylistParams, unknown, unknown, GetPlaylistQuery>,
  res: Response
) => {
  try {
    const { degreeId, branchId, semester } = req.params;
    const { subjectId } = req.query;

    const degreeIdNum = Number(degreeId);
    const branchIdNum = Number(branchId);
    const semesterNum = Number(semester);

    if (Number.isNaN(degreeIdNum) || Number.isNaN(branchIdNum) || Number.isNaN(semesterNum)) {
      return res.status(400).json({ message: "degreeId, branchId, and semester must be valid numbers" });
    }

    const subjectIdNum = subjectId !== undefined ? Number(subjectId) : undefined;
    if (subjectIdNum !== undefined && Number.isNaN(subjectIdNum)) {
      return res.status(400).json({ message: "subjectId must be a valid number" });
    }

    const degree = await prisma.degree.findUnique({ where: { id: degreeIdNum } });
    if (!degree) {
      return res.status(404).json({ message: "Degree not found" });
    }

    if (semesterNum < 1 || semesterNum > degree.semesters) {
      return res.status(400).json({
        message: `Semester must be between 1 and ${degree.semesters} for this degree`,
      });
    }

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

// GET /playcircle?degreeId=&branchId=&semester=&subjectId=  (query-param based, semester optional)
export const getPlaylistsByQuery = async (req: Request, res: Response) => {
  try {
    const { degreeId, branchId, semester, subjectId } = req.query;

    if (!degreeId || !branchId) {
      return res.status(400).json({ message: "degreeId and branchId are required" });
    }

    const degreeIdNum = Number(degreeId);
    const branchIdNum = Number(branchId);
    const semesterNum = semester ? Number(semester) : undefined;
    const subjectIdNum = subjectId ? Number(subjectId) : undefined;

    if (Number.isNaN(degreeIdNum) || Number.isNaN(branchIdNum)) {
      return res.status(400).json({ message: "degreeId and branchId must be valid numbers" });
    }

    const playcircles = await prisma.playcircle.findMany({
      where: {
        isPublished: true,
        ...(semesterNum && { semester: semesterNum }),
        ...(subjectIdNum
          ? { degreeBranchSubject: { subjectId: subjectIdNum, degreeBranch: { degreeId: degreeIdNum, branchId: branchIdNum } } }
          : { degreeBranchSubject: { degreeBranch: { degreeId: degreeIdNum, branchId: branchIdNum } } }
        ),
      },
      include: {
        degreeBranchSubject: {
          include: {
            subject: true,
            degreeBranch: { include: { degree: true, branch: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.status(200).json({ success: true, data: playcircles });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// POST /playcircle
export const createPlaylist = async (req: Request, res: Response) => {
  try {
    const { title, description, playlistUrl, degreeBranchSubjectId, semester } = req.body;
    if (!title || !playlistUrl || !degreeBranchSubjectId || !semester) {
      return res.status(400).json({ message: "title, playlistUrl, degreeBranchSubjectId, and semester are required" });
    }

    const playcircle = await prisma.playcircle.create({
      data: {
        title,
        description: description || null,
        playlistUrl,
        degreeBranchSubjectId: parseInt(degreeBranchSubjectId),
        semester: parseInt(semester),
        isPublished: false,
      },
    });

    return res.status(201).json({ success: true, data: playcircle });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// PATCH /playcircle/:id
export const updatePlaylist = async (req: Request, res: Response) => {
  try {
    const { title, description, playlistUrl, semester } = req.body;
    if (!title && description === undefined && !playlistUrl && !semester) {
      return res.status(400).json({ message: "Provide at least one field to update" });
    }

    const playcircle = await prisma.playcircle.update({
      where: { id: Number(req.params.id) },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description: description || null }),
        ...(playlistUrl && { playlistUrl }),
        ...(semester && { semester: parseInt(semester) }),
      },
    });

    return res.status(200).json({ success: true, data: playcircle });
  } catch (error: any) {
    if (error.code === "P2025") return res.status(404).json({ message: "Playlist not found" });
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// PATCH /playcircle/:id/publish
export const togglePlaylistPublish = async (req: Request, res: Response) => {
  try {
    const { isPublished } = req.body;

    const playcircle = await prisma.playcircle.update({
      where: { id: Number(req.params.id) },
      data: { isPublished },
    });

    return res.status(200).json({ success: true, data: playcircle });
  } catch (error: any) {
    if (error.code === "P2025") return res.status(404).json({ message: "Playlist not found" });
    console.error(error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// DELETE /playcircle/:id
export const deletePlaylist = async (req: Request, res: Response) => {
  try {
    await prisma.playcircle.delete({ where: { id: Number(req.params.id) } });
    return res.status(200).json({ success: true, message: "Playlist deleted" });
  } catch (error: any) {
    if (error.code === "P2025") return res.status(404).json({ message: "Playlist not found" });
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
