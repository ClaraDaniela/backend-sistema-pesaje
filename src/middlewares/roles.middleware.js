import { validarEsquema } from "./validacionGeneral.js";
import { rolesSchema } from "../schemas/roles.schema.js";

export const rolesMiddleware = validarEsquema(rolesSchema);
