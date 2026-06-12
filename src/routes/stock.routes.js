import { Router } from "express";
import {getStockMaterialesGenerales, getStockMaterialesDescarga, getTotalesKpi} from "../controllers/stock.controller.js";

const router = Router();

router.get("/generales", getStockMaterialesGenerales);
router.get("/descarga", getStockMaterialesDescarga);
router.get("/totales", getTotalesKpi);

export default router;