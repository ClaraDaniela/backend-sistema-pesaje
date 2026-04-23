import { Router } from "express";
import { createVehiculo, getVehiculosByTipo } from "../controllers/vehiculos.controller.js";

const router = Router();

router.post("/", createVehiculo);
router.get("/", getVehiculosByTipo);

export default router;
