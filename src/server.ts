import express from "express";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/env.js";
import { swaggerSpec } from "./config/swagger.js";
import { registerRoutes } from "./routes.js";

const app: express.Express = express();

app.use(express.json());

app.get("/health", (_, res: express.Response) => {
  res.json({ status: "ok" });
});

app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

registerRoutes(app);

app.listen(env.PORT, () => {
  console.log(`Server is running on port ${env.PORT}`);
  console.log(`Swagger docs available at http://localhost:${env.PORT}/docs`);
});