import { Router } from "express";
import { getTiposVehiculo, createTiposVehiculo } from "../controllers/tipos_vehiculo.controller.js";
import { tiposVehiculoMiddleware } from "../middlewares/tipos_vehiculo.middleware.js";

const router = Router();

router.get("/", getTiposVehiculo);
router.post("/", tiposVehiculoMiddleware, createTiposVehiculo);

export default router;