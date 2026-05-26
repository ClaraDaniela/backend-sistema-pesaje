import { Router } from "express";

import {getStockMaterialesGenerales, getStockMaterialesDescarga} from "../controllers/stock.controller.js";

const router = Router();


router.get("/generales", getStockMaterialesGenerales);


router.get("/descarga", getStockMaterialesDescarga);

export default router;