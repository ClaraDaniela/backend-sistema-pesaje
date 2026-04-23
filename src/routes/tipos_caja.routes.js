import { Router } from "express";
import { getTiposCaja, createTiposCaja } from "../controllers/tipos_caja.controller.js";

const router = Router();

router.get("/", getTiposCaja);
router.post("/", createTiposCaja);

export default router;