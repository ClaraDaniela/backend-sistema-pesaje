const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('materiales_generales', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    nombre: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: "nombre"
    },
    aplica_ingreso: {
      type: DataTypes.TINYINT(1),
      allowNull: false,
      defaultValue: 0
    },
    aplica_egreso: {
      type: DataTypes.TINYINT(1),
      allowNull: false,
      defaultValue: 0
    },
    descripcion: {
      type: DataTypes.STRING(255),
      allowNull: true,
      defaultValue: null
    }
  }, {
    sequelize,
    tableName: 'materiales_generales',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id" },
        ]
      },
      {
        name: "nombre",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "nombre" },
        ]
      },
    ]
  });
};