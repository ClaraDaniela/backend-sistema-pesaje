import { body } from "express-validator";

export const crearMaterialesDescargaSchema = [
  body("tipo_material_id")
    .notEmpty()
    .withMessage("El tipo de material es obligatorio")
    .isInt({ min: 1 })
    .withMessage("El tipo de material debe ser un número válido"),
  body("estado_material_id")
    .notEmpty()
    .withMessage("El estado es obligatorio")
    .isInt({ min: 1 })
    .withMessage("El estado debe ser un número válido"),
  body("material_base_id")
    .notEmpty()
    .withMessage("La base del material es obligatoria")
    .isInt({ min: 1 })
    .withMessage("La base del material debe ser un número válido"),
  body("forma_material_id")
    .optional({ values: "falsy" })
    .isInt({ min: 1 })
    .withMessage("La forma del material debe ser un número válido"),
];

export const actualizarMaterialesDescargaSchema = [
  body("tipo_material_id")
    .optional()
    .isInt({ min: 1 })
    .withMessage("El tipo de material debe ser un número válido"),
  body("estado_material_id")
    .optional()
    .isInt({ min: 1 })
    .withMessage("El estado debe ser un número válido"),
  body("material_base_id")
    .optional()
    .isInt({ min: 1 })
    .withMessage("La base del material debe ser un número válido"),
  body("forma_material_id")
    .optional({ values: "falsy" })
    .isInt({ min: 1 })
    .withMessage("La forma del material debe ser un número válido"),
];
