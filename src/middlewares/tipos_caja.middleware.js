import { validarEsquema } from "./validacionGeneral.js";
import { tiposCajaSchema } from "../schemas/tipos_caja.schema.js";

export const tiposCajaMiddleware = validarEsquema(tiposCajaSchema);
