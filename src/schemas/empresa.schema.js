import { body } from "express-validator";

export const empresaSchema = [
  body("nombre")
    .trim()
    .notEmpty()
    .withMessage("El nombre es obligatorio")
    .isLength({ min: 2, max: 100 })
    .withMessage("El nombre debe tener entre 2 y 100 caracteres"),
  body("cuit")
    .optional({ values: "falsy" })
    .isLength({ min: 11, max: 11 })
    .withMessage("El CUIT debe tener 11 caracteres"),
];
