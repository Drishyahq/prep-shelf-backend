import type { Request } from "express";


// ---- URL Param types (req.params) ----
// All URL params come in as strings

export interface GetNotesParams {
    degreeId: string;
    branchId: string;
    semester: string;
}

// ---- Query Param types (req.query) ----

export interface GetNotesQuery {
    subjectId?: string; // optional — omit to fetch notes across all subjects
}

export interface GetNoteByIdParams {
    id: string;
}

// ---- Request Body types (req.body) ----

export interface SubmitNoteBody {
    degreeId: string;
    branchId: string;
    semester: string;
    subjectId: string;
    title: string;
    description?: string;
}   