import { Router } from "express";
import { getTiposVehiculo, createTiposVehiculo } from "../controllers/tipos_vehiculo.controller.js";

const router = Router();

router.get("/", getTiposVehiculo);
router.post("/", createTiposVehiculo);

export default router;