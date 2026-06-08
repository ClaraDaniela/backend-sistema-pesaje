import { Router } from "express";
import {exportStockGeneralesExcel, exportStockDescargaExcel} from "../export/stock.js";
import {exportInventarioExcel} from "../export/inventario.js";
import {generarPdfPesada} from "../export/pesada.js";

const router = Router();

router.get("/stock-generales", exportStockGeneralesExcel);
router.get("/stock-descarga", exportStockDescargaExcel);
router.get("/inventario", exportInventarioExcel);
router.get("/pesada/:id", generarPdfPesada);

export default router;