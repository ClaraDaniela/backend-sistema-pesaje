var DataTypes = require("sequelize").DataTypes;
var _ajustes_stock = require("./ajustes_stock");
var _cajas = require("./cajas");
var _descarga_detalles = require("./descarga_detalles");
var _descarga_detalles_materiales = require("./descarga_detalles_materiales");
var _empresas = require("./empresas");
var _estados_material = require("./estados_material");
var _formas_material = require("./formas_material");
var _inventario_fisico = require("./inventario_fisico");
var _materiales = require("./materiales");
var _materiales_base = require("./materiales_base");
var _materiales_generales = require("./materiales_generales");
var _personal = require("./personal");
var _pesadas = require("./pesadas");
var _roles = require("./roles");
var _tipo_personal = require("./tipo_personal");
var _tipos_caja = require("./tipos_caja");
var _tipos_material = require("./tipos_material");
var _tipos_vehiculo = require("./tipos_vehiculo");
var _usuarios = require("./usuarios");
var _vehiculos = require("./vehiculos");

function initModels(sequelize) {
  var ajustes_stock = _ajustes_stock(sequelize, DataTypes);
  var cajas = _cajas(sequelize, DataTypes);
  var descarga_detalles = _descarga_detalles(sequelize, DataTypes);
  var descarga_detalles_materiales = _descarga_detalles_materiales(sequelize, DataTypes);
  var empresas = _empresas(sequelize, DataTypes);
  var estados_material = _estados_material(sequelize, DataTypes);
  var formas_material = _formas_material(sequelize, DataTypes);
  var inventario_fisico = _inventario_fisico(sequelize, DataTypes);
  var materiales = _materiales(sequelize, DataTypes);
  var materiales_base = _materiales_base(sequelize, DataTypes);
  var materiales_generales = _materiales_generales(sequelize, DataTypes);
  var personal = _personal(sequelize, DataTypes);
  var pesadas = _pesadas(sequelize, DataTypes);
  var roles = _roles(sequelize, DataTypes);
  var tipo_personal = _tipo_personal(sequelize, DataTypes);
  var tipos_caja = _tipos_caja(sequelize, DataTypes);
  var tipos_material = _tipos_material(sequelize, DataTypes);
  var tipos_vehiculo = _tipos_vehiculo(sequelize, DataTypes);
  var usuarios = _usuarios(sequelize, DataTypes);
  var vehiculos = _vehiculos(sequelize, DataTypes);

  descarga_detalles.belongsToMany(materiales, { as: 'id_materiales_materiales', through: descarga_detalles_materiales, foreignKey: "id_descarga_detalles", otherKey: "id_materiales" });
  materiales.belongsToMany(descarga_detalles, { as: 'id_descarga_detalles_descarga_detalles', through: descarga_detalles_materiales, foreignKey: "id_materiales", otherKey: "id_descarga_detalles" });
  pesadas.belongsTo(cajas, { as: "caja", foreignKey: "caja_id"});
  cajas.hasMany(pesadas, { as: "pesadas", foreignKey: "caja_id"});
  descarga_detalles_materiales.belongsTo(descarga_detalles, { as: "id_descarga_detalles_descarga_detalle", foreignKey: "id_descarga_detalles"});
  descarga_detalles.hasMany(descarga_detalles_materiales, { as: "descarga_detalles_materiales", foreignKey: "id_descarga_detalles"});
  pesadas.belongsTo(empresas, { as: "empresa", foreignKey: "empresa_id"});
  empresas.hasMany(pesadas, { as: "pesadas", foreignKey: "empresa_id"});
  materiales.belongsTo(estados_material, { as: "estado_material", foreignKey: "estado_material_id"});
  estados_material.hasMany(materiales, { as: "materiales", foreignKey: "estado_material_id"});
  materiales.belongsTo(formas_material, { as: "forma_material", foreignKey: "forma_material_id"});
  formas_material.hasMany(materiales, { as: "materiales", foreignKey: "forma_material_id"});
  descarga_detalles_materiales.belongsTo(materiales, { as: "id_materiales_materiale", foreignKey: "id_materiales"});
  materiales.hasMany(descarga_detalles_materiales, { as: "descarga_detalles_materiales", foreignKey: "id_materiales"});
  materiales.belongsTo(materiales_base, { as: "material_base", foreignKey: "material_base_id"});
  materiales_base.hasMany(materiales, { as: "materiales", foreignKey: "material_base_id"});
  ajustes_stock.belongsTo(materiales_generales, { as: "material_general", foreignKey: "material_general_id"});
  materiales_generales.hasMany(ajustes_stock, { as: "ajustes_stocks", foreignKey: "material_general_id"});
  inventario_fisico.belongsTo(materiales_generales, { as: "material_general", foreignKey: "material_general_id"});
  materiales_generales.hasOne(inventario_fisico, { as: "inventario_fisico", foreignKey: "material_general_id"});
  pesadas.belongsTo(materiales_generales, { as: "material_general", foreignKey: "material_general_id"});
  materiales_generales.hasMany(pesadas, { as: "pesadas", foreignKey: "material_general_id"});
  descarga_detalles.belongsTo(personal, { as: "responsable_personal", foreignKey: "responsable"});
  personal.hasMany(descarga_detalles, { as: "descarga_detalles", foreignKey: "responsable"});
  pesadas.belongsTo(personal, { as: "personal", foreignKey: "personal_id"});
  personal.hasMany(pesadas, { as: "pesadas", foreignKey: "personal_id"});
  descarga_detalles.belongsTo(pesadas, { as: "pesada", foreignKey: "pesada_id"});
  pesadas.hasMany(descarga_detalles, { as: "descarga_detalles", foreignKey: "pesada_id"});
  usuarios.belongsTo(roles, { as: "rol", foreignKey: "rol_id"});
  roles.hasMany(usuarios, { as: "usuarios", foreignKey: "rol_id"});
  personal.belongsTo(tipo_personal, { as: "id_tipo_personal_tipo_personal", foreignKey: "id_tipo_personal"});
  tipo_personal.hasMany(personal, { as: "personals", foreignKey: "id_tipo_personal"});
  cajas.belongsTo(tipos_caja, { as: "tipo_caja", foreignKey: "tipo_caja_id"});
  tipos_caja.hasMany(cajas, { as: "cajas", foreignKey: "tipo_caja_id"});
  materiales.belongsTo(tipos_material, { as: "tipo_material", foreignKey: "tipo_material_id"});
  tipos_material.hasMany(materiales, { as: "materiales", foreignKey: "tipo_material_id"});
  vehiculos.belongsTo(tipos_vehiculo, { as: "tipo_vehiculo", foreignKey: "tipo_vehiculo_id"});
  tipos_vehiculo.hasMany(vehiculos, { as: "vehiculos", foreignKey: "tipo_vehiculo_id"});
  ajustes_stock.belongsTo(usuarios, { as: "usuario", foreignKey: "usuario_id"});
  usuarios.hasMany(ajustes_stock, { as: "ajustes_stocks", foreignKey: "usuario_id"});
  inventario_fisico.belongsTo(usuarios, { as: "usuario", foreignKey: "usuario_id"});
  usuarios.hasMany(inventario_fisico, { as: "inventario_fisicos", foreignKey: "usuario_id"});
  pesadas.belongsTo(usuarios, { as: "usuario", foreignKey: "usuario_id"});
  usuarios.hasMany(pesadas, { as: "pesadas", foreignKey: "usuario_id"});
  pesadas.belongsTo(vehiculos, { as: "vehiculo", foreignKey: "vehiculo_id"});
  vehiculos.hasMany(pesadas, { as: "pesadas", foreignKey: "vehiculo_id"});

  return {
    ajustes_stock,
    cajas,
    descarga_detalles,
    descarga_detalles_materiales,
    empresas,
    estados_material,
    formas_material,
    inventario_fisico,
    materiales,
    materiales_base,
    materiales_generales,
    personal,
    pesadas,
    roles,
    tipo_personal,
    tipos_caja,
    tipos_material,
    tipos_vehiculo,
    usuarios,
    vehiculos,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
