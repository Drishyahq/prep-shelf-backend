# Database Schema

## Overview

Prep Shelf uses a PostgreSQL database managed via Prisma ORM. The schema is designed around an academic content platform where users can browse and contribute study materials (Notes, PYQ Papers, Assignments, Playcircles) organised by degree, branch, and subject.

---

## Entity Relationship

```
Degree ──────────── DegreeBranch ──────────── Branch
                          │
                   DegreeBranchSubject
                          │
                       Subject
                          │
          ┌───────────────┼───────────────┐
         Note          PYQPaper      Assignment    Playcircle
          │               │               │
          └───────────────┴───────────────┘
                          │
                     Contribution
```

---

## Models

### Admin
Stores admin accounts. Only admins can manage content.

| Field      | Type     | Notes                  |
|------------|----------|------------------------|
| id         | Int      | Primary key            |
| email      | String   | Unique                 |
| name       | String   |                        |
| password   | String   | Plain text — hash before production |
| createdAt  | DateTime |                        |
| updatedAt  | DateTime |                        |

---

### Session
JWT sessions linked to an admin. Cascade-deleted when admin is deleted.

| Field     | Type     | Notes               |
|-----------|----------|---------------------|
| id        | Int      | Primary key         |
| token     | String   | Unique              |
| adminId   | Int      | FK → Admin          |
| expiresAt | DateTime |                     |
| createdAt | DateTime |                     |

---

### Degree
Represents an academic degree (e.g. B.Tech, B.Com, M.Tech).

| Field     | Type     | Notes                                      |
|-----------|----------|--------------------------------------------|
| id        | Int      | Primary key                                |
| name      | String   | Unique (e.g. "B.Tech")                     |
| semesters | Int      | Total number of semesters for this degree  |
| createdAt | DateTime |                                            |

> **Note:** `semesters` is informational — the app must validate that content `semester` values don't exceed this.

---

### Branch
Represents an academic branch/stream (e.g. CSE, ECE, Mechanical).

| Field     | Type     | Notes                    |
|-----------|----------|--------------------------|
| id        | Int      | Primary key              |
| name      | String   | Unique (e.g. "CSE")      |
| createdAt | DateTime |                          |

---

### DegreeBranch
Junction table linking a `Degree` to a `Branch`. Represents a specific academic program (e.g. B.Tech CSE).

| Field     | Type     | Notes                                         |
|-----------|----------|-----------------------------------------------|
| id        | Int      | Primary key                                   |
| degreeId  | Int      | FK → Degree (cascade delete)                  |
| branchId  | Int      | FK → Branch (cascade delete)                  |
| createdAt | DateTime |                                               |

- `(degreeId, branchId)` is unique — a degree-branch pair can only exist once.
- Deleting a `Degree` or `Branch` cascades through `DegreeBranch` → `DegreeBranchSubject` → all content.

---

### Subject
Represents an academic subject (e.g. Data Structures, Mathematics).

| Field     | Type     | Notes                              |
|-----------|----------|------------------------------------|
| id        | Int      | Primary key                        |
| name      | String   | Unique (e.g. "Data Structures")    |
| createdAt | DateTime |                                    |

> Subjects are global — the same subject can belong to multiple programs via `DegreeBranchSubject`.

---

### DegreeBranchSubject
Junction table linking a `DegreeBranch` to a `Subject`. Ensures a subject is only valid for specific programs. **All content tables reference this instead of `Degree`/`Branch`/`Subject` directly**, guaranteeing valid combinations.

| Field         | Type     | Notes                                     |
|---------------|----------|-------------------------------------------|
| id            | Int      | Primary key                               |
| degreeBranchId| Int      | FK → DegreeBranch (cascade delete)        |
| subjectId     | Int      | FK → Subject (cascade delete)             |
| createdAt     | DateTime |                                           |

- `(degreeBranchId, subjectId)` is unique.

**How to query:**

```ts
// Get all branches for a degree
prisma.degreeBranch.findMany({
  where: { degreeId },
  include: { branch: true }
})

// Get all subjects for a degree+branch
prisma.degreeBranchSubject.findMany({
  where: { degreeBranchId },
  include: { subject: true }
})
```

---

### PYQPaper
Previous Year Question papers for a subject.

| Field                | Type     | Notes                                                     |
|----------------------|----------|-----------------------------------------------------------|
| id                   | Int      | Primary key                                               |
| title                | String   |                                                           |
| description          | String?  | Optional                                                  |
| degreeBranchSubjectId| Int      | FK → DegreeBranchSubject (cascade delete)                 |
| examYear             | Int      | Calendar year of the exam (e.g. 2024)                     |
| semester             | Int      | App must validate: `semester <= degree.semesters`         |
| fileUrl              | String   | URL to the uploaded file                                  |
| isSolution           | Boolean  | `false` = question paper, `true` = solution               |
| parentId             | Int?     | FK → PYQPaper (self-ref, cascade delete). Set when `isSolution = true` |
| isPublished          | Boolean  | Default `true`. Set to `false` to hide from users         |
| createdAt            | DateTime |                                                           |
| updatedAt            | DateTime |                                                           |

**Solution relationship:**
- A solution PYQPaper has `isSolution = true` and `parentId` pointing to the original paper.
- Deleting a parent paper cascades to delete all its solutions.
- `parentId` and `degreeBranchSubjectId` should match the parent — enforced in app logic.

```ts
// Get original paper + its solutions
prisma.pYQPaper.findUnique({
  where: { id },
  include: { solutions: true }
})

// Get all PYQs for a subject across all semesters
prisma.pYQPaper.findMany({
  where: { degreeBranchSubjectId, isSolution: false }
})
```

---

### Note
Study notes for a subject.

| Field                | Type     | Notes                                             |
|----------------------|----------|---------------------------------------------------|
| id                   | Int      | Primary key                                       |
| title                | String   |                                                   |
| description          | String?  | Optional                                          |
| degreeBranchSubjectId| Int      | FK → DegreeBranchSubject (cascade delete)         |
| semester             | Int      | App must validate: `semester <= degree.semesters` |
| fileUrl              | String   | URL to the uploaded file                          |
| isPublished          | Boolean  | Default `true`                                    |
| createdAt            | DateTime |                                                   |
| updatedAt            | DateTime |                                                   |

> Notes do not have `examYear` — they are study material, not exam-specific.

---

### Assignment
Course assignments for a subject.

| Field                | Type     | Notes                                                     |
|----------------------|----------|-----------------------------------------------------------|
| id                   | Int      | Primary key                                               |
| title                | String   |                                                           |
| description          | String?  | Optional                                                  |
| degreeBranchSubjectId| Int      | FK → DegreeBranchSubject (cascade delete)                 |
| semester             | Int      | App must validate: `semester <= degree.semesters`         |
| fileUrl              | String   | URL to the uploaded file                                  |
| isSolution           | Boolean  | `false` = assignment, `true` = solution                   |
| parentId             | Int?     | FK → Assignment (self-ref, cascade delete). Set when `isSolution = true` |
| isPublished          | Boolean  | Default `true`                                            |
| createdAt            | DateTime |                                                           |
| updatedAt            | DateTime |                                                           |

---

### Playcircle
YouTube playlist links for a subject.

| Field                | Type     | Notes                                             |
|----------------------|----------|---------------------------------------------------|
| id                   | Int      | Primary key                                       |
| title                | String   |                                                   |
| description          | String?  | Optional                                          |
| playlistUrl          | String   | YouTube playlist URL — validate format in app     |
| degreeBranchSubjectId| Int      | FK → DegreeBranchSubject (cascade delete)         |
| semester             | Int      | App must validate: `semester <= degree.semesters` |
| isPublished          | Boolean  | Default `true`                                    |
| createdAt            | DateTime |                                                   |
| updatedAt            | DateTime |                                                   |

---

### Contribution
User-submitted content awaiting admin review.

| Field                | Type     | Notes                                                              |
|----------------------|----------|--------------------------------------------------------------------|
| id                   | Int      | Primary key                                                        |
| type                 | Enum     | `PYQ_PAPER`, `NOTE`, `ASSIGNMENT`                                  |
| status               | Enum     | `PENDING`, `APPROVED`, `REJECTED`. Default `PENDING`               |
| contributorName      | String?  | Optional — anonymous contributions allowed                         |
| contributorEmail     | String?  | Optional                                                           |
| title                | String   |                                                                    |
| description          | String?  | Optional                                                           |
| degreeBranchSubjectId| Int      | FK → DegreeBranchSubject (cascade delete)                          |
| examYear             | Int?     | Required for `PYQ_PAPER`, null for `NOTE`                          |
| semester             | Int      |                                                                    |
| fileUrl              | String   |                                                                    |
| isSolution           | Boolean  | Default `false`. Set `true` if contributing a solution             |
| reviewNote           | String?  | Admin note on approval/rejection                                   |
| reviewedAt           | DateTime?| Set when status changes from PENDING                               |
| noteId               | Int?     | FK → Note (SetNull on delete). Set after approval for NOTE type    |
| pyqPaperId           | Int?     | FK → PYQPaper (SetNull on delete). Set after approval for PYQ type |
| assignmentId         | Int?     | FK → Assignment (SetNull on delete). Set after approval for ASSIGNMENT type |
| createdAt            | DateTime |                                                                    |
| updatedAt            | DateTime |                                                                    |

**Approval workflow:**
1. User submits → `status = PENDING`
2. Admin reviews → sets `status = APPROVED` or `REJECTED`, sets `reviewNote` and `reviewedAt`
3. On approval → admin creates the content record (`Note`/`PYQPaper`/`Assignment`) and sets the corresponding FK (`noteId`/`pyqPaperId`/`assignmentId`) on the contribution for audit trail

> Only one of `noteId`, `pyqPaperId`, `assignmentId` should be set, matching the `type` field. Enforced in app logic.

---

## Enums

### ContributionType
| Value     | Description                  |
|-----------|------------------------------|
| PYQ_PAPER | Previous year question paper |
| NOTE      | Study note                   |
| ASSIGNMENT| Course assignment            |

### ContributionStatus
| Value    | Description                        |
|----------|------------------------------------|
| PENDING  | Awaiting admin review (default)    |
| APPROVED | Approved and content created       |
| REJECTED | Rejected by admin                  |

---

## Cascade Delete Behaviour

| Delete this      | Also deletes                                              |
|------------------|-----------------------------------------------------------|
| Admin            | Sessions                                                  |
| Degree           | DegreeBranch → DegreeBranchSubject → all content          |
| Branch           | DegreeBranch → DegreeBranchSubject → all content          |
| Subject          | DegreeBranchSubject → all content                         |
| DegreeBranch     | DegreeBranchSubject → all content                         |
| DegreeBranchSubject | Notes, PYQPapers, Assignments, Contributions, Playcircles |
| PYQPaper (parent)| All solution PYQPapers with that parentId                 |
| Assignment (parent)| All solution Assignments with that parentId             |
| Note/PYQPaper/Assignment | Linked Contribution's FK is set to null (SetNull) |

> **Warning:** Deleting a `Degree` or `Subject` is destructive — it wipes all content under it. The app should require explicit confirmation before these deletions.

---

## App-Level Validations Required

These constraints cannot be enforced at the DB level in Prisma and must be handled in application code:

| Rule | Where |
|------|-------|
| `semester` must be `<= degree.semesters` | All content creation/update endpoints |
| Only one of `noteId`/`pyqPaperId`/`assignmentId` set on Contribution, matching `type` | Contribution approval endpoint |
| `examYear` must be provided for `PYQ_PAPER` contributions, null for `NOTE` | Contribution creation endpoint |
| Solution `PYQPaper`/`Assignment` must have same `degreeBranchSubjectId` as its parent | Content creation endpoint |
| `playlistUrl` must be a valid YouTube playlist URL | Playcircle creation/update endpoints |
