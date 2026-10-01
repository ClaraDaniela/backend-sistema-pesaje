import { Router } from "express";
import {getStockMaterialesGenerales, getStockMaterialesDescarga, getTotalesKpi, getClasificacionIngreso} from "../controllers/stock.controller.js";

const router = Router();

router.get("/generales", getStockMaterialesGenerales);
router.get("/descarga", getStockMaterialesDescarga);
router.get("/totales", getTotalesKpi);
router.get("/clasificacion", getClasificacionIngreso);

export default router;