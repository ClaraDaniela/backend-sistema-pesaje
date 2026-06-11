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
import stockRoutes from "./stock.routes.js";
import rolesRouter from "./roles.router.js";

const router = Router();

const apiV1 = Router();

apiV1.use("/empresas", empresasRoutes);
apiV1.use("/personal", personalRoutes);
apiV1.use("/materiales", materialesRoutes);
apiV1.use("/vehiculos", vehiculosRoutes);
apiV1.use("/cajas", cajasRoutes);
apiV1.use("/pesadas", pesadasRoutes);
apiV1.use("/balanza", balanzaRoutes);
apiV1.use("/tipos_vehiculo", tiposvehiculoRoutes);
apiV1.use("/inventario", inventario);
apiV1.use("/export", exportRoutes);
apiV1.use("/login", usuarioRoute);
apiV1.use("/tipos_caja", tiposcajasRoutes);
apiV1.use("/descargas", descargasRoutes);
apiV1.use("/materiales_descarga", materialesDescargas);
apiV1.use("/stock", stockRoutes);
apiV1.use("/roles", rolesRouter);

router.use("/v1", apiV1);
router.use("/", apiV1);

export default router;
