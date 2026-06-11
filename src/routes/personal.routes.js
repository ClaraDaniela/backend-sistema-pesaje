import { Router } from "express";
import { getPersonal, createPersonal, getChoferes } from "../controllers/personal.controller.js";
import { personalMiddleware } from "../middlewares/personal.middleware.js";

const router = Router();

router.get("/", getPersonal);
router.post("/", personalMiddleware, createPersonal);
router.get("/choferes", getChoferes);

export default router;
