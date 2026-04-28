const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('personal', {
    id_personal: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    nombre: {
      type: DataTypes.STRING(45),
      allowNull: false
    },
    apellido: {
      type: DataTypes.STRING(45),
      allowNull: false
    },
    id_tipo_personal: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'tipo_personal',
        key: 'id_tipo_personal'
      }
    },
    activo: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 1
    }
  }, {
    sequelize,
    tableName: 'personal',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_personal" },
        ]
      },
      {
        name: "fk_personal_tipo",
        using: "BTREE",
        fields: [
          { name: "id_tipo_personal" },
        ]
      },
    ]
  });
};
