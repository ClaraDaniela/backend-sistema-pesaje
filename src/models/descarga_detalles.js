const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('descarga_detalles', {
    id_descarga_detalles: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    pesada_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'pesadas',
        key: 'id'
      }
    },
    responsable: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'personal',
        key: 'id_personal'
      }
    },
    marca_temporal_info: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    },
    comentarios: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'descarga_detalles',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_descarga_detalles" },
        ]
      },
      {
        name: "fk_descarga_pesada",
        using: "BTREE",
        fields: [
          { name: "pesada_id" },
        ]
      },
      {
        name: "fk_descarga_responsable",
        using: "BTREE",
        fields: [
          { name: "responsable" },
        ]
      },
    ]
  });
};
