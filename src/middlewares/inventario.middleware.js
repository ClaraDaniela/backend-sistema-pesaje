import { validarEsquema } from "./validacionGeneral.js";
import { inventarioSchema } from "../schemas/inventario.schema.js";

export const inventarioMiddleware = validarEsquema(inventarioSchema);
