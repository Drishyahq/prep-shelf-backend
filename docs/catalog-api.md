# Catalog API

The catalog manages the academic structure that all content (notes, PYQs, playlists) is organised under.

## Data Model

```
Degree (e.g. B.Tech)
  └── DegreeBranch  (e.g. B.Tech → CSE)
        └── DegreeBranchSubject  (e.g. B.Tech CSE → Data Structures)
                └── Notes / PYQs / Playlists / Assignments
```

**Why the two junction tables?**

- A `Branch` like "CSE" can exist under multiple degrees (B.Tech, M.Tech). `DegreeBranch` models that link.
- A `Subject` like "Data Structures" is taught in some degree-branch combos but not all. `DegreeBranchSubject` models that link.
- Every piece of content stores a `degreeBranchSubjectId` — that's how it knows which degree + branch + subject it belongs to.

## Setting up a new program

### 1. Create a degree (if it doesn't exist)
```
POST /api/catalog/degrees
{ "name": "B.Tech", "semesters": 8 }
```

### 2. Create a branch and link to a degree in one call
```
POST /api/catalog/branches
{ "name": "CSE", "degreeIds": [1] }
```
`degreeIds` is optional — if you skip it, link later via `POST /api/catalog/degree-branches`.

### 3. Create a subject and link to a degree-branch in one call
```
POST /api/catalog/subjects
{ "name": "Data Structures", "degreeBranchIds": [3] }
```
`degreeBranchIds` is optional — if you skip it, link later via `POST /api/catalog/degree-branch-subjects`.

The response from step 3 includes the full `degreeBranchSubject` record with its `id`. That `id` is what frontend passes as `degreeBranchSubjectId` when uploading notes or PYQs.

## Adding links after the fact

If a branch or subject already exists and you need to link it to something new:

```
POST /api/catalog/degree-branches
{ "degreeId": 2, "branchId": 1 }

POST /api/catalog/degree-branch-subjects
{ "degreeBranchId": 5, "subjectId": 3 }
```

To remove links, use `DELETE /api/catalog/degree-branches/:id` and `DELETE /api/catalog/degree-branch-subjects/:id`.

## Getting the degreeBranchSubjectId for uploads

Use the filter API to look it up:

```
GET /api/filters/degree-branch-subject-id?degreeId=1&branchId=2&subjectId=3
```

Returns the `degreeBranchSubjectId` needed for uploading notes, PYQs, playlists, and assignments.
