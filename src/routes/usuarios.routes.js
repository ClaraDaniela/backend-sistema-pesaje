import { Router } from "express";
import { loginUsuario, crearUsuario, cambiarPassword, listarUsuarios } from "../controllers/usuario.controller.js";
import { loginUsuarioMiddleware, crearUsuarioMiddleware } from "../middlewares/usuarios.middleware.js";
import { autenticacionMiddleware } from "../middlewares/autenticacion.middleware.js";

const router = Router();

router.post("/", loginUsuarioMiddleware, loginUsuario);
router.post("/crear", crearUsuarioMiddleware, crearUsuario);
router.get("/listar", listarUsuarios);
router.patch("/:id/password", autenticacionMiddleware, cambiarPassword);

export default router;