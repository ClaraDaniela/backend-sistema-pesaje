import { Router } from "express";
import { getMateriales, createMaterial } from "../controllers/materiales.controller.js";

const router = Router();

router.get("/", getMateriales);
router.post("/", createMaterial);

export default router;
