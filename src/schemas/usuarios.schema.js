import { body } from "express-validator";

export const loginUsuarioSchema = [
  body("username")
    .trim()
    .notEmpty()
    .withMessage("El usuario es obligatorio"),
  body("password")
    .notEmpty()
    .withMessage("La contraseña es obligatoria"),
];

export const crearUsuarioSchema = [
  body("nombreusuario")
    .trim()
    .notEmpty()
    .withMessage("El nombre de usuario es obligatorio"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("La contraseña debe tener al menos 6 caracteres"),
  body("rol_id")
    .notEmpty()
    .withMessage("El rol es obligatorio"),
];
