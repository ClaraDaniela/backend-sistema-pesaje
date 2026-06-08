import { Router } from "express";
import { loginUsuario, crearUsuario, cambiarPassword, listarUsuarios } from "../controllers/usuario.controller.js";

const router = Router();

router.post("/", loginUsuario);
router.post("/crear", crearUsuario);
router.get("/listar", listarUsuarios);
router.patch("/:id/password", cambiarPassword);

export default router;