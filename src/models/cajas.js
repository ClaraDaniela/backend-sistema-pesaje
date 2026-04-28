const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('cajas', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    tipo_caja_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'tipos_caja',
        key: 'id'
      }
    },
    codigo: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: "codigo"
    },
    tara_kg: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false
    },
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 1
    },
    patente: {
      type: DataTypes.STRING(10),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'cajas',
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
        name: "codigo",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "codigo" },
        ]
      },
      {
        name: "fk_caja_tipo",
        using: "BTREE",
        fields: [
          { name: "tipo_caja_id" },
        ]
      },
    ]
  });
};
