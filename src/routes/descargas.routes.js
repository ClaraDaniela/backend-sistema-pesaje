import express from "express";
import {createDescarga, getDescargaPorPesada} from "../controllers/descargas.controller.js";

const router = express.Router();

router.post("/", createDescarga);
router.get("/:pesadaId", getDescargaPorPesada);

export default router;