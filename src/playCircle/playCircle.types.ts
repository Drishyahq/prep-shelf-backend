export interface GetPlaylistParams {
  degreeId: string;
  branchId: string;
  semester: string;
}

export interface GetPlaylistByIdParams {
  id: string;
}

export interface GetPlaylistQuery {
  subjectId?: string;
}
