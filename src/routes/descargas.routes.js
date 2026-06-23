import express from "express";
import {createDescarga, getDescargaPorPesada, getReciclabilidad} from "../controllers/descargas.controller.js";
import { descargasMiddleware } from "../middlewares/descargas.middleware.js";

const router = express.Router();

router.post("/", descargasMiddleware, createDescarga);
router.get("/reciclabilidad", getReciclabilidad);   
router.get("/:pesadaId", getDescargaPorPesada); 

export default router;