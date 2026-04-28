const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('tipo_personal', {
    id_tipo_personal: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    tipo: {
      type: DataTypes.STRING(45),
      allowNull: false,
      unique: "tipo"
    }
  }, {
    sequelize,
    tableName: 'tipo_personal',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_tipo_personal" },
        ]
      },
      {
        name: "tipo",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "tipo" },
        ]
      },
    ]
  });
};
