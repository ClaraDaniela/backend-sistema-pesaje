import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import "dotenv/config";
import { pathToFileURL } from "node:url";
import routes from "./routes/index.js";
import notFoundHandler from "./middlewares/notFoundHandler.js";
import errorHandler from "./middlewares/errorHandler.js";
import { logInfo } from "./utils/logger.js";

function validateStartupConfig() {
  const required = ["DB_NAME", "DB_USER", "DB_PASSWORD", "DB_HOST"];

  const missing = required.filter((key) => !process.env[key]);

  if (missing.length) {
    throw new Error(`Faltan variables de entorno para iniciar la API: ${missing.join(", ")}`);
  }
}

export const app = express();
const PORT = Number(process.env.PORT) || 3000;
const isProduction = process.env.NODE_ENV === "production";

app.disable("x-powered-by");
app.set("trust proxy", 1);

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000, // Ventana de 1 minuto
  max: 1000, // Aumentamos a 1000 peticiones por minuto para permitir el polling de la balanza
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(helmet());
app.use(limiter);
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || true,
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));

app.get("/api/health", (_req, res) => {
  res.json({
    ok: true,
    status: "ok",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "production",
    version: process.env.npm_package_version || "1.0.0",
    uptimeMs: Math.floor(process.uptime() * 1000),
    dbConfigured: Boolean(process.env.DB_HOST && process.env.DB_NAME && process.env.DB_USER),
  });
});

app.use("/api", routes);

app.use(notFoundHandler);
app.use(errorHandler);

export function startServer(port = PORT) {
  const server = app.listen(port, () => {
    logInfo(`API en http://localhost:${port} [${process.env.NODE_ENV || "production"}]`, {
      port,
      environment: process.env.NODE_ENV || "production",
    });
  });

  server.keepAliveTimeout = 65 * 1000;
  server.headersTimeout = 70 * 1000;

  return server;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    validateStartupConfig();
    const server = startServer();

  process.on("SIGINT", () => {
    server.close(() => process.exit(0));
  });

    process.on("SIGTERM", () => {
      server.close(() => process.exit(0));
    });
  } catch (error) {
    console.error("No se pudo iniciar la API:", error.message);
    process.exit(1);
  }
}
