import { Router } from "express";
import { getMateriales, createMaterial } from "../controllers/materiales.controller.js";
import { materialesMiddleware } from "../middlewares/materiales.middleware.js";

const router = Router();

router.get("/", getMateriales);
router.post("/", materialesMiddleware, createMaterial);

export default router;
