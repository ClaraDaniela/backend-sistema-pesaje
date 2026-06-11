export function manejarErrores(respuestaPersonalizada = null) {
  return (err, req, res, next) => {
    if (respuestaPersonalizada) {
      return respuestaPersonalizada(err, req, res, next);
    }

    console.error("[middleware] Error no controlado:", err);

    const status = err.status || 500;
    const message = err.message || "Error interno del servidor";

    return res.status(status).json({
      ok: false,
      error: message,
      details: process.env.NODE_ENV === "development" ? err.details || null : undefined,
    });
  };
}
