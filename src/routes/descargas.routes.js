import express from "express";
import { createDescarga, getDescargaPorPesada } from "../controllers/descargas.controller.js";
import { descargasMiddleware } from "../middlewares/descargas.middleware.js";

const router = express.Router();

router.post("/", descargasMiddleware, createDescarga);
router.get("/:pesadaId", getDescargaPorPesada);

export default router;