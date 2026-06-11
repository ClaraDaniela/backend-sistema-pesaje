import express from "express";
import { getMaterialDescargaById, getMaterialesDescarga, createMaterialDescarga, updateMaterialDescarga, deleteMaterialDescarga, getTiposMaterial, getCombinacionesMaterial,
    upsertInventario, getInventarioDetallado, getStockDetallado } from "../controllers/materiales_descarga.controller.js";
import { crearMaterialDescargaMiddleware, actualizarMaterialDescargaMiddleware } from "../middlewares/materiales_descarga.middleware.js";
import { inventarioMiddleware } from "../middlewares/inventario.middleware.js";

const router = express.Router();

router.get("/tipos", getTiposMaterial);
router.get("/combinaciones", getCombinacionesMaterial);
router.post("/inventario", inventarioMiddleware, upsertInventario);
router.get("/inventario", getInventarioDetallado);
router.get("/stock", getStockDetallado);
router.get("/", getMaterialesDescarga);
router.get("/:id", getMaterialDescargaById);
router.post("/", crearMaterialDescargaMiddleware, createMaterialDescarga);
router.put("/:id", actualizarMaterialDescargaMiddleware, updateMaterialDescarga);
router.delete("/:id", deleteMaterialDescarga);


export default router;