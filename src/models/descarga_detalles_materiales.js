const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('descarga_detalles_materiales', {
    id_descarga_detalles: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'descarga_detalles',
        key: 'id_descarga_detalles'
      }
    },
    id_materiales: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'materiales',
        key: 'id_materiales_descarga'
      }
    },
    porcentaje: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'descarga_detalles_materiales',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_descarga_detalles" },
          { name: "id_materiales" },
        ]
      },
      {
        name: "fk_dd_material",
        using: "BTREE",
        fields: [
          { name: "id_materiales" },
        ]
      },
    ]
  });
};
