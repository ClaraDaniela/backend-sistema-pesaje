import { Router } from "express";
import { getPersonal, createPersonal, getChoferes } from "../controllers/personal.controller.js";

const router = Router();

router.get("/", getPersonal);
router.post("/", createPersonal);
router.get("/choferes", getChoferes);

export default router;
