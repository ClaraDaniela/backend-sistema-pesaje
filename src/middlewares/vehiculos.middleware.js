import { validarEsquema } from "./validacionGeneral.js";
import { vehiculoSchema, filtroVehiculoSchema } from "../schemas/vehiculos.schema.js";

export const crearVehiculoMiddleware = validarEsquema(vehiculoSchema);
export const filtrarVehiculoMiddleware = validarEsquema(filtroVehiculoSchema);
