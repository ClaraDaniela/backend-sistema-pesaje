import { validarEsquema } from "./validacionGeneral.js";
import { crearMaterialesDescargaSchema, actualizarMaterialesDescargaSchema } from "../schemas/materiales_descarga.schema.js";

export const crearMaterialDescargaMiddleware = validarEsquema(crearMaterialesDescargaSchema);
export const actualizarMaterialDescargaMiddleware = validarEsquema(actualizarMaterialesDescargaSchema);
