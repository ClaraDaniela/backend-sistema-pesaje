import { body } from "express-validator";

export const descargaSchema = [
  body("pesada_id")
    .notEmpty()
    .withMessage("La pesada es obligatoria")
    .isInt({ min: 1 })
    .withMessage("La pesada debe ser un identificador válido"),
  body("responsable")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ max: 150 })
    .withMessage("El responsable no puede superar 150 caracteres"),
  body("comentarios")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ max: 500 })
    .withMessage("Los comentarios no pueden superar 500 caracteres"),
  body("materiales")
    .isArray({ min: 1 })
    .withMessage("Debe indicar al menos un material"),
  body("materiales.*.material_id")
    .notEmpty()
    .withMessage("Cada material debe tener un identificador válido")
    .isInt({ min: 1 }),
  body("materiales.*.porcentaje")
    .notEmpty()
    .withMessage("Cada material debe tener un porcentaje")
    .isFloat({ min: 0.01 })
    .withMessage("El porcentaje debe ser mayor a 0"),
];
