module.exports = function(sequelize, DataTypes) {
  const tipos_material_generales = sequelize.define('tipos_material_generales', {
    tipo_material_id: {
      type: DataTypes.INTEGER,
      primaryKey: true
    },
    material_general_id: {
      type: DataTypes.INTEGER,
      primaryKey: true
    }
  }, {
    tableName: 'tipos_material_generales',
    timestamps: false
  });
  return tipos_material_generales;
};