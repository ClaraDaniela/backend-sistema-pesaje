import { Router } from "express";
import { getPesadas, createPesada, getPesadaById, updatePesada, getPesadasSinDescarga, cerrarPesada } from "../controllers/pesadas.controller.js";

const router = Router();


router.get("/", getPesadas);
router.post("/", createPesada);
router.get("/sin-descarga", getPesadasSinDescarga);
router.get("/:id", getPesadaById); 
router.put("/:id", updatePesada);
router.patch("/:id/cerrar", cerrarPesada);

export default router;
