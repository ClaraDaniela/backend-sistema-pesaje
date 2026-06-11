import { body } from "express-validator";

export const cajaSchema = [
  body("tipo_caja_id")
    .notEmpty()
    .withMessage("El tipo de caja es obligatorio")
    .isInt({ min: 1 })
    .withMessage("El tipo de caja debe ser un número válido"),
  body("codigo")
    .trim()
    .notEmpty()
    .withMessage("El código es obligatorio")
    .isLength({ min: 1, max: 50 })
    .withMessage("El código debe tener entre 1 y 50 caracteres"),
  body("tara_kg")
    .notEmpty()
    .withMessage("La tara es obligatoria")
    .isFloat({ min: 0 })
    .withMessage("La tara debe ser un número válido"),
  body("patente")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ max: 20 })
    .withMessage("La patente no puede superar 20 caracteres"),
];
