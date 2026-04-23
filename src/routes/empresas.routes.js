import { Router } from "express";
import { getEmpresas, createEmpresa } from "../controllers/empresa.controller.js";

const router = Router();

router.get("/", getEmpresas);
router.post("/", createEmpresa);

export default router;

