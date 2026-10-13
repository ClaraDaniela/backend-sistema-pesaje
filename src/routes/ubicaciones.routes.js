import { Router } from "express";
import {
  getTrackers, createTracker, updateTracker,
  getEstado,
  getLogs, createLog, deleteLog,
} from "../controllers/ubicaciones.controller.js";
import { validarTracker, validarLog } from "../middlewares/ubicaciones.middleware.js";

const router = Router();

router.get("/trackers", getTrackers);
router.post("/trackers", validarTracker, createTracker);
router.put("/trackers/:id", updateTracker);

router.get("/estado", getEstado);

router.get("/", getLogs);
router.post("/", validarLog, createLog);
router.delete("/:id", deleteLog);

export default router;