import { validarEsquema } from "./validacionGeneral.js";
import { materialesSchema } from "../schemas/materiales.schema.js";

export const materialesMiddleware = validarEsquema(materialesSchema);
