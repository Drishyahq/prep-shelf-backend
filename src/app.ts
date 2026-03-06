import cors from "cors";
import express from "express";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger.js";
import { registerRoutes } from "./routes.js";

const app: express.Express = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_, res: express.Response) => {
  res.json({ status: "ok" });
});

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

registerRoutes(app);

export default app;
