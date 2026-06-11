export function handleControllerError(res, error, fallbackMessage = "Error interno del servidor") {
  const message = error?.parent?.sqlMessage || error?.message || fallbackMessage;

  console.error("[controller]", error);

  return res.status(error?.status || 500).json({
    ok: false,
    error: message,
  });
}
