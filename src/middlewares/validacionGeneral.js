import { validationResult } from "express-validator";

export function validarEsquema(validaciones) {
  return async (req, res, next) => {
    await Promise.all(validaciones.map((validacion) => validacion.run(req)));

    const errores = validationResult(req);

    if (!errores.isEmpty()) {
      return res.status(400).json({
        error: "Datos inválidos",
        detalles: errores.array(),
      });
    }

    next();
  };
}
