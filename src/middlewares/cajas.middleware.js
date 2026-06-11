import { validarEsquema } from "./validacionGeneral.js";
import { cajaSchema } from "../schemas/caja.schema.js";

export const cajasMiddleware = validarEsquema(cajaSchema);
