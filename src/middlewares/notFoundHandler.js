export default function notFoundHandler(req, res, next) {
  res.status(404).json({
    error: "Ruta no encontrada",
  });
}
