import { body, query } from "express-validator";

export const vehiculoSchema = [
  body("patente")
    .trim()
    .notEmpty()
    .withMessage("La patente es obligatoria")
    .isLength({ min: 4, max: 12 })
    .withMessage("La patente debe tener entre 4 y 12 caracteres"),
  body("tara_kg")
    .notEmpty()
    .withMessage("La tara es obligatoria")
    .isFloat({ min: 0 })
    .withMessage("La tara debe ser un número válido"),
  body("tipo_vehiculo_id")
    .notEmpty()
    .withMessage("El tipo de vehículo es obligatorio"),
];

export const filtroVehiculoSchema = [
  query("tipo_vehiculo_id")
    .optional()
    .isInt({ min: 1 })
    .withMessage("El tipo de vehículo debe ser un número válido"),
];
