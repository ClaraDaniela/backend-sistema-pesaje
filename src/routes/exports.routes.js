import { Router } from "express";
import { exportInventarioExcel } from "../export/inventario.js";
import { exportStockExcel } from "../export/stock.js";
import { generarPdfPesada } from "../export/pesada.js";


const router = Router();

router.get("/stock", exportStockExcel);
router.get("/pesada/:id", generarPdfPesada);
router.get("/inventario", exportInventarioExcel);

export default router;