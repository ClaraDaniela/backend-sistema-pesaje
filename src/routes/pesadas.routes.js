import { Router } from "express";
import { getPesadas, createPesada, getPesadaById, updatePesada, getStockPorMaterial, crearAjusteStock, getPesadasSinDescarga } from "../controllers/pesadas.controller.js";

const router = Router();

router.get("/", getPesadas);
router.post("/", createPesada);
router.get("/stock", getStockPorMaterial);
router.get("/sin-descarga", getPesadasSinDescarga);
router.post("/ajustes", crearAjusteStock);
router.get("/:id", getPesadaById); 
router.put("/:id", updatePesada);

export default router;
