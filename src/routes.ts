import type { Express } from "express";
import adminRouter from "./admin/admin.routes.js";
import pyqRouter from "./pyqs/pyq.routes.js";
import noteRouter from "./notes/note.routes.js";
import filterRouter from "./filter/filter.routes.js";
import playCircleRouter from "./playCircle/playCircle.routes.js";
import catalogRouter from "./catalog/catalog.routes.js";
import assignmentRouter from "./assignments/assignment.routes.js";

export function registerRoutes(app: Express): void {
  app.use("/api/admin", adminRouter);
  app.use("/api/pyqs", pyqRouter);
  app.use("/api/notes", noteRouter);
  app.use("/api/filters", filterRouter);
  app.use("/api/playcircle", playCircleRouter);
  app.use("/api/catalog", catalogRouter);
  app.use("/api/assignments", assignmentRouter);
}
