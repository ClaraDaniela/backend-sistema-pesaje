import { Router } from "express";
import { createVehiculo, getVehiculosByTipo } from "../controllers/vehiculos.controller.js";
import { crearVehiculoMiddleware, filtrarVehiculoMiddleware } from "../middlewares/vehiculos.middleware.js";

const router = Router();

router.post("/", crearVehiculoMiddleware, createVehiculo);
router.get("/", filtrarVehiculoMiddleware, getVehiculosByTipo);

export default router;
