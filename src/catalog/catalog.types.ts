export interface CreateBranchBody {
  name: string;
}

export interface UpdateBranchBody {
  name: string;
}

export interface CreateDegreeBody {
  name: string;
  semesters: number;
}

export interface UpdateDegreeBody {
  name?: string;
  semesters?: number;
}

export interface CreateSubjectBody {
  name: string;
}

export interface UpdateSubjectBody {
  name: string;
}

export interface CreateDegreeBranchBody {
  degreeId: number;
  branchId: number;
}

export interface CreateDegreeBranchSubjectBody {
  degreeBranchId: number;
  subjectId: number;
}
