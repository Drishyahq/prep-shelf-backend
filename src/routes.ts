import type { Express } from "express";
import adminRouter from "./admin/admin.routes.js";

export function registerRoutes(app: Express): void {
  app.use("/api/admin", adminRouter);
}
