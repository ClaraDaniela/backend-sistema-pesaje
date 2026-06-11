import { logError } from "../utils/logger.js";

export default function errorHandler(err, req, res, next) {
  logError("Error HTTP", { message: err.message, status: err.status || 500, path: req.originalUrl });

  const status = err.status || 500;
  const isProduction = process.env.NODE_ENV === "production";
  const message = err.message || "Error interno del servidor";

  res.status(status).json({
    ok: false,
    error: isProduction ? "Error interno del servidor" : message,
    details: process.env.NODE_ENV === "development" ? err.details || null : undefined,
  });
}
