export interface GetNotesQuery {
  degreeId?: string;
  branchId?: string;
  subjectId?: string;
  semester?: string;
}

export interface GetNoteByIdParams {
  id: string;
}

export interface UploadNoteBody {
  title: string;
  description?: string;
  degreeBranchSubjectId: string;
  semester: string;
}

export interface ToggleNotePublishBody {
  isPublished: boolean;
}

export interface DeleteNoteParams {
  id: string;
}