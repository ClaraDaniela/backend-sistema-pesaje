const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('vehiculos', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    patente: {
      type: DataTypes.STRING(10),
      allowNull: false,
      unique: "patente"
    },
    descripcion: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    tipo_vehiculo_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'tipos_vehiculo',
        key: 'id'
      }
    },
    tara_kg: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false
    },
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 1
    }
  }, {
    sequelize,
    tableName: 'vehiculos',
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
        name: "patente",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "patente" },
        ]
      },
      {
        name: "fk_vehiculo_tipo",
        using: "BTREE",
        fields: [
          { name: "tipo_vehiculo_id" },
        ]
      },
    ]
  });
};
