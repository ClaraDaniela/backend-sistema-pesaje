import { Router } from "express";
import { getTiposCaja, createTiposCaja } from "../controllers/tipos_caja.controller.js";
import { tiposCajaMiddleware } from "../middlewares/tipos_caja.middleware.js";

const router = Router();

router.get("/", getTiposCaja);
router.post("/", tiposCajaMiddleware, createTiposCaja);

export default router;