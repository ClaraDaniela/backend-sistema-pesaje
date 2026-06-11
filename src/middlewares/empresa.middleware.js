import { validarEsquema } from "./validacionGeneral.js";
import { empresaSchema } from "../schemas/empresa.schema.js";

export const empresaMiddleware = validarEsquema(empresaSchema);
