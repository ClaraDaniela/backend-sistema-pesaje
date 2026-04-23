import { Router } from "express";
import { loginUsuario } from "../controllers/usuario.controller.js";

const router = Router();

router.post("/login", loginUsuario);

export default router;