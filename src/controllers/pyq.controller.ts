import { Request, Response } from 'express';
import prisma from '../lib/prisma';
import { cloudinary } from '../config/cloudinary';

export const getPYQs = async (req: Request, res: Response) => {
  try {
    const { degreeId, subjectId, branchId, year, semester } = req.query;

    const pyqs = await prisma.pYQPaper.findMany({
      where: {
        isPublished: true,
        ...(degreeId  && { degreeId:  parseInt(degreeId as string) }),
        ...(subjectId && { subjectId: parseInt(subjectId as string) }),
        ...(branchId  && { branchId:  parseInt(branchId as string) }),
        ...(year      && { year:      parseInt(year as string) }),
        ...(semester  && { semester:  parseInt(semester as string) }),
      },
      include: {
        branch: true,
        degree: true,
        subject: true,
      },
      orderBy: { year: 'desc' },
    });

    res.json({ success: true, data: pyqs });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getPYQById = async (req: Request, res: Response) => {
  try {
    const pyq = await prisma.pYQPaper.findUnique({
      where: { id: parseInt(req.params.id) },
      include: { branch: true, degree: true, subject: true },
    });

    if (!pyq) return res.status(404).json({ success: false, message: 'Not found' });

    res.json({ success: true, data: pyq });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const uploadPYQPaper = async (req: Request, res: Response) => {
  try {
    const { title, description, degreeId, subjectId, branchId, year, semester } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const pyq = await prisma.pYQPaper.create({
      data: {
        title,
        description: description || null,
        fileUrl: req.file.path,
        year: parseInt(year),
        semester: parseInt(semester),
        degreeId: parseInt(degreeId),
        subjectId: parseInt(subjectId),
        branchId: parseInt(branchId),
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
      where: { id: parseInt(req.params.id) },
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
      where: { id: parseInt(req.params.id) },
    });

    if (!pyq) return res.status(404).json({ success: false, message: 'Not found' });

    const urlParts = pyq.fileUrl.split('/');
    const publicId = 'pyqs/' + urlParts[urlParts.length - 1].split('.')[0];

    await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' });
    await prisma.pYQPaper.delete({ where: { id: parseInt(req.params.id) } });

    res.json({ success: true, message: 'Deleted successfully' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};