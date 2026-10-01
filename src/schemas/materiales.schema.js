import { body } from "express-validator";

export const materialesSchema = [
  body("nombre")
    .trim()
    .notEmpty()
    .withMessage("El nombre es obligatorio")
    .isLength({ min: 2, max: 100 })
    .withMessage("El nombre debe tener entre 2 y 100 caracteres"),

  body("descripcion")
    .optional({ nullable: true, checkFalsy: true })
    .trim()
    .isLength({ max: 255 })
    .withMessage("La descripción no puede superar los 255 caracteres"),

  body("aplica_ingreso")
    .optional()
    .isBoolean()
    .withMessage("aplica_ingreso debe ser true o false")
    .toBoolean(),

  body("aplica_egreso")
    .optional()
    .isBoolean()
    .withMessage("aplica_egreso debe ser true o false")
    .toBoolean(),
];
