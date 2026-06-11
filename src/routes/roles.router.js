import { Router } from "express";
import { getRoles } from "../controllers/roles.controller.js";
import { rolesMiddleware } from "../middlewares/roles.middleware.js";

const router = Router();

router.get("/", rolesMiddleware, getRoles);

export default router;