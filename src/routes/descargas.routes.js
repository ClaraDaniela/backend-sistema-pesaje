import express from "express";
import {
  crearDescarga,
  getDescargaPorPesada
} from "../controllers/descargas.controller.js";

const router = express.Router();

router.post("/", crearDescarga);
router.get("/:pesadaId", getDescargaPorPesada);

export default router;