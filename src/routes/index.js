import { Router } from "express";

import empresasRoutes from "./empresas.routes.js";
import personalRoutes from "./personal.routes.js";
import materialesRoutes from "./materiales.routes.js";
import vehiculosRoutes from "./vehiculos.routes.js";
import cajasRoutes from "./cajas.routes.js";
import pesadasRoutes from "./pesadas.routes.js";
import balanzaRoutes from "./balanza.routes.js";
import tiposvehiculoRoutes from "./tipos_vehiculo.routes.js";
import inventario from "./inventario.routes.js";
import exportRoutes from "./exports.routes.js";
import usuarioRoute from "./usuarios.routes.js";
import tiposcajasRoutes from "./tipos_caja.routes.js";
import descargasRoutes from "./descargas.routes.js";
import materialesDescargas from "./materiales_descarga.routes.js";

const router = Router();

router.use("/empresas", empresasRoutes);
router.use("/personal", personalRoutes);
router.use("/materiales", materialesRoutes);
router.use("/vehiculos", vehiculosRoutes);
router.use("/cajas", cajasRoutes);
router.use("/pesadas", pesadasRoutes);
router.use("/balanza", balanzaRoutes);
router.use("/tipos_vehiculo", tiposvehiculoRoutes);
router.use("/inventario", inventario);
router.use("/export", exportRoutes);
router.use("/login", usuarioRoute);
router.use("/tipos_caja", tiposcajasRoutes);
router.use("/descargas", descargasRoutes);
router.use("/materiales_descarga", materialesDescargas);


export default router;
