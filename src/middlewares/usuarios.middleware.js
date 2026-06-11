import { validarEsquema } from "./validacionGeneral.js";
import { loginUsuarioSchema, crearUsuarioSchema } from "../schemas/usuarios.schema.js";

export const loginUsuarioMiddleware = validarEsquema(loginUsuarioSchema);
export const crearUsuarioMiddleware = validarEsquema(crearUsuarioSchema);
