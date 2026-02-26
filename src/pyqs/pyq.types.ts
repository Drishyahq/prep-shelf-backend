export interface GetPYQsQuery {
  degreeId?: string;
  branchId?: string;
  subjectId?: string;
  examYear?: string;
  semester?: string;
}

export interface GetPYQByIdParams {
  id: string;
}

export interface UploadPYQBody {
  title: string;
  description?: string;
  degreeBranchSubjectId: string;
  examYear: string;
  semester: string;
}

export interface TogglePublishBody {
  isPublished: boolean;
}

export interface DeletePYQParams {
  id: string;
}
