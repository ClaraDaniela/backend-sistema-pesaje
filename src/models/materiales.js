const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('materiales', {
    id_materiales_descarga: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    tipo_material_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'tipos_material',
        key: 'id'
      }
    },
    estado_material_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'estados_material',
        key: 'id'
      }
    },
    material_base_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'materiales_base',
        key: 'id'
      }
    },
    forma_material_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'formas_material',
        key: 'id'
      }
    }
  }, {
    sequelize,
    tableName: 'materiales',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "id_materiales_descarga" },
        ]
      },
      {
        name: "fk_mat_tipo",
        using: "BTREE",
        fields: [
          { name: "tipo_material_id" },
        ]
      },
      {
        name: "fk_mat_estado",
        using: "BTREE",
        fields: [
          { name: "estado_material_id" },
        ]
      },
      {
        name: "fk_mat_base",
        using: "BTREE",
        fields: [
          { name: "material_base_id" },
        ]
      },
      {
        name: "fk_mat_forma",
        using: "BTREE",
        fields: [
          { name: "forma_material_id" },
        ]
      },
    ]
  });
};
