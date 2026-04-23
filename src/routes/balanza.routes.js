import { Router } from "express";
import { getPeso } from "../controllers/balanza.controller.js";

const router = Router();

router.get("/peso", getPeso);

export default router;
