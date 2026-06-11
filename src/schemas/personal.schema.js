import { body } from "express-validator";

export const personalSchema = [
  body("nombre")
    .trim()
    .notEmpty()
    .withMessage("El nombre es obligatorio"),
  body("apellido")
    .trim()
    .notEmpty()
    .withMessage("El apellido es obligatorio"),
  body("tipo")
    .trim()
    .notEmpty()
    .withMessage("El tipo de personal es obligatorio"),
];
