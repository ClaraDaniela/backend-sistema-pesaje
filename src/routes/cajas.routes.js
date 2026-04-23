import { Router } from "express";
import { getCajas, createCaja } from "../controllers/caja.controller.js";

const router = Router();

router.get("/", getCajas);
router.post("/", createCaja);

export default router;
