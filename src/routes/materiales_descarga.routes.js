import express from "express";
import { getMaterialDescargaById, getMaterialesDescarga, createMaterialDescarga, updateMaterialDescarga, deleteMaterialDescarga, getTiposMaterial, getCombinacionesMaterial } from "../controllers/materiales_descarga.controller.js";

const router = express.Router();

router.get("/tipos", getTiposMaterial);
router.get("/combinaciones", getCombinacionesMaterial);
router.get("/", getMaterialesDescarga);
router.get("/:id", getMaterialDescargaById);
router.post("/", createMaterialDescarga);
router.put("/:id", updateMaterialDescarga);
router.delete("/:id", deleteMaterialDescarga);


export default router;