import { Router } from "express";
import { loginUsuario } from "../controllers/usuario.controller.js";

const router = Router();

router.post("/", loginUsuario);

export default router;