import type { Express } from "express";
import adminRouter from "./admin/admin.routes";
import notesRouter from "./notes/notes.routes";
import playCircleRouter from "./playCircle/playCircle.routes";

export function registerRoutes(app: Express): void {
  app.use("/api/admin", adminRouter);
  app.use("/api/notes", notesRouter);
  app.use("/api/playcircle", playCircleRouter);
}
