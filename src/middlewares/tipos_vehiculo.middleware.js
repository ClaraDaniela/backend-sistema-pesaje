import { validarEsquema } from "./validacionGeneral.js";
import { tiposVehiculoSchema } from "../schemas/tipos_vehiculo.schema.js";

export const tiposVehiculoMiddleware = validarEsquema(tiposVehiculoSchema);
