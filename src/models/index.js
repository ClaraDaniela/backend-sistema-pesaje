import { sequelize } from "../config/db.js";

import { Rol } from "./rol.model.js";
import { Usuario } from "./usuario.model.js";

import { Empresa } from "./empresa.model.js";
import { Material } from "./material.model.js";

import { TipoVehiculo } from "./tipos_vehiculo.model.js";
import { Vehiculo } from "./vehiculo.model.js";

import { TipoCaja } from "./tipo_caja.model.js";
import { Caja } from "./caja.model.js";
import { VehiculoCaja } from "./vehiculo_caja.model.js";

import { Pesada } from "./pesadas.model.js";

import { InventarioFisico } from "./inventario.model.js";

import { Personal } from "./personal.model.js";
import { TipoPersonal } from "./tipo_personal.model.js";

import { DescargaDetalle } from "./descarga_detalles.model.js";
import { MaterialDescarga } from "./materiales_descarga.model.js";
import { DescargaDetalleMaterial } from "./descarga_detalle_material.model.js";

Rol.hasMany(Usuario, { foreignKey: "rol_id" });
Usuario.belongsTo(Rol, { foreignKey: "rol_id" });

TipoPersonal.hasMany(Personal, { foreignKey: "id_tipo_personal" });
Personal.belongsTo(TipoPersonal, { foreignKey: "id_tipo_personal" });
Pesada.hasMany(DescargaDetalle, { foreignKey: "pesada_id" });
DescargaDetalle.belongsTo(Pesada, { foreignKey: "pesada_id" });

TipoVehiculo.hasMany(Vehiculo, { foreignKey: "tipo_vehiculo_id" });
Vehiculo.belongsTo(TipoVehiculo, { foreignKey: "tipo_vehiculo_id" });

TipoCaja.hasMany(Caja, { foreignKey: "tipo_caja_id" });
Caja.belongsTo(TipoCaja, { foreignKey: "tipo_caja_id" });

Vehiculo.hasMany(VehiculoCaja, { foreignKey: "vehiculo_id" });
VehiculoCaja.belongsTo(Vehiculo, { foreignKey: "vehiculo_id" });

Caja.hasMany(VehiculoCaja, { foreignKey: "caja_id" });
VehiculoCaja.belongsTo(Caja, { foreignKey: "caja_id" });

Empresa.hasMany(Pesada, { foreignKey: "empresa_id" });
Pesada.belongsTo(Empresa, { foreignKey: "empresa_id" });

Personal.hasMany(Pesada, { foreignKey: "personal_id" });
Pesada.belongsTo(Personal, { foreignKey: "personal_id" });

Material.hasMany(Pesada, { foreignKey: "material_id" });
Pesada.belongsTo(Material, { foreignKey: "material_id" });

Vehiculo.hasMany(Pesada, { foreignKey: "vehiculo_id" });
Pesada.belongsTo(Vehiculo, { foreignKey: "vehiculo_id" });

Caja.hasMany(Pesada, { foreignKey: "caja_id" });
Pesada.belongsTo(Caja, { foreignKey: "caja_id" });

Usuario.hasMany(Pesada, { foreignKey: "usuario_id" });
Pesada.belongsTo(Usuario, { foreignKey: "usuario_id" });

Material.hasOne(InventarioFisico, { foreignKey: "material_id" });
InventarioFisico.belongsTo(Material, { foreignKey: "material_id" });

Personal.hasMany(DescargaDetalle, { foreignKey: "responsable" });
DescargaDetalle.belongsTo(Personal, { foreignKey: "responsable" });

DescargaDetalle.belongsToMany(MaterialDescarga, {
  through: DescargaDetalleMaterial,
  foreignKey: "id_descarga_detalles",
  otherKey: "id_materiales_descarga",
});

MaterialDescarga.belongsToMany(DescargaDetalle, {
  through: DescargaDetalleMaterial,
  foreignKey: "id_materiales_descarga",
  otherKey: "id_descarga_detalles",
});
DescargaDetalleMaterial.belongsTo(DescargaDetalle, {
  foreignKey: "id_descarga_detalles",
});

DescargaDetalleMaterial.belongsTo(MaterialDescarga, {
  foreignKey: "id_materiales_descarga",
});

export {
  sequelize,
  Rol,
  Usuario,
  Empresa,
  Material,
  TipoVehiculo,
  Vehiculo,
  TipoCaja,
  Caja,
  VehiculoCaja,
  Pesada,
  InventarioFisico,
  Personal,
  TipoPersonal,
  DescargaDetalle,
  MaterialDescarga,
  DescargaDetalleMaterial
};
