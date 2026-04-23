import express from "express";
import { getInventario, guardarInventario } from "../controllers/inventario.controller.js";

const router = express.Router();

router.get("/", getInventario);
router.post("/", guardarInventario);

export default router;