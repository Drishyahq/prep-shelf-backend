import type { GetPlaylistParams, GetPlaylistByIdParams, GetPlaylistQuery } from "./playCircle.types.js";

// All URL params come in as strings

export interface GetPlaylistParams {
    degreeId: string;
    branchId: string;
    semester: string;
}

export interface GetPlaylistByIdParams {
    id: string;
}

// ---- Query Param types (req.query) ----

export interface GetPlaylistQuery {
    subjectId?: string; // optional — omit to fetch playlists across all subjects
}
    