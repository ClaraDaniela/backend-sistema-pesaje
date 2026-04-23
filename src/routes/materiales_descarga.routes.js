import express from "express";
import { getMaterialesDescarga } from "../controllers/materiales_descarga.controller.js";

const router = express.Router();

router.get("/", getMaterialesDescarga);

export default router;