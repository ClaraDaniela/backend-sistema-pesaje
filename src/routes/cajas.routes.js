import { Router } from "express";
import { getCajas, createCaja } from "../controllers/caja.controller.js";
import { cajasMiddleware } from "../middlewares/cajas.middleware.js";

const router = Router();

router.get("/", getCajas);
router.post("/", cajasMiddleware, createCaja);

export default router;
