import { query } from "express-validator";

export const rolesSchema = [
  query("nombre")
    .optional({ values: "falsy" })
    .trim()
    .isLength({ max: 100 })
    .withMessage("El nombre no puede superar 100 caracteres"),
];
