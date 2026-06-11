import express from "express";
import { getInventario, guardarInventario } from "../controllers/inventario.controller.js";
import { inventarioMiddleware } from "../middlewares/inventario.middleware.js";

const router = express.Router();

router.get("/", getInventario);
router.post("/", inventarioMiddleware, guardarInventario);

export default router;