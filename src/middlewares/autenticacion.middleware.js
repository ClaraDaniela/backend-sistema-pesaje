import { validarEsquema } from "./validacionGeneral.js";
import { body } from "express-validator";

const cambiarPasswordSchema = [
  body("password_actual")
    .notEmpty()
    .withMessage("La contraseña actual es obligatoria"),
  body("password_nueva")
    .isLength({ min: 6 })
    .withMessage("La nueva contraseña debe tener al menos 6 caracteres"),
];

export const autenticacionMiddleware = validarEsquema(cambiarPasswordSchema);
