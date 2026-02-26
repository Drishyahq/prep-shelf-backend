export interface GetSubjectsQuery {
  degreeId?: string;
  branchId?: string;
}

export interface GetDegreeBranchSubjectIdQuery {
  degreeId: string;
  branchId: string;
  subjectId: string;
}