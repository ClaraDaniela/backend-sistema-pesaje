import { validarEsquema } from "./validacionGeneral.js";
import { descargaSchema } from "../schemas/descarga.schema.js";

export const descargasMiddleware = validarEsquema(descargaSchema);
