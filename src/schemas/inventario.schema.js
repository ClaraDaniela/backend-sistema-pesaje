import { body } from "express-validator";

export const inventarioSchema = [
  body("material_id")
    .notEmpty()
    .withMessage("El material es obligatorio")
    .isInt({ min: 1 })
    .withMessage("El material debe ser un número válido"),
  body("cantidad")
    .notEmpty()
    .withMessage("La cantidad es obligatoria")
    .isFloat({ min: 0 })
    .withMessage("La cantidad debe ser un número válido"),
  body("usuario_id")
    .optional({ values: "falsy" })
    .isInt({ min: 1 })
    .withMessage("El usuario debe ser un identificador válido"),
];
