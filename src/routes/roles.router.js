import { Router } from "express";
import {getRoles} from "../controllers/roles.controller.js";

const router = Router();

router.get("/", getRoles);

export default router;