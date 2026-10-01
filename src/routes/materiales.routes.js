import { Router } from "express";
import { getMateriales } from "../controllers/materiales.controller.js";
import { materialesMiddleware } from "../middlewares/materiales.middleware.js";

const router = Router();

router.get("/", getMateriales);

export default router;
