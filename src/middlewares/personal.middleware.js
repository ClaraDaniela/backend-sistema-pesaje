import { validarEsquema } from "./validacionGeneral.js";
import { personalSchema } from "../schemas/personal.schema.js";

export const personalMiddleware = validarEsquema(personalSchema);
