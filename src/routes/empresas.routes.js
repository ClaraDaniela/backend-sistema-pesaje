import { Router } from "express";
import { getEmpresas, createEmpresa } from "../controllers/empresa.controller.js";
import { empresaMiddleware } from "../middlewares/empresa.middleware.js";

const router = Router();

router.get("/", getEmpresas);
router.post("/", empresaMiddleware, createEmpresa);

export default router;

