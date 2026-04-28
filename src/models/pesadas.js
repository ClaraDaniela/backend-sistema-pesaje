const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('pesadas', {
    id: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    fecha: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.literal('CURRENT_TIMESTAMP')
    },
    tipo_movimiento: {
      type: DataTypes.ENUM('INGRESO','EGRESO'),
      allowNull: false
    },
    empresa_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'empresas',
        key: 'id'
      }
    },
    material_general_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'materiales_generales',
        key: 'id'
      }
    },
    vehiculo_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'vehiculos',
        key: 'id'
      }
    },
    caja_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'cajas',
        key: 'id'
      }
    },
    peso_bruto_kg: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false
    },
    origen: {
      type: DataTypes.ENUM('BALANZA','MANUAL'),
      allowNull: false
    },
    usuario_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'usuarios',
        key: 'id'
      }
    },
    motivo_manual: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    personal_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'personal',
        key: 'id_personal'
      }
    },
    tara_real_kg: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true,
      comment: "Tara medida en el momento (si se pesó vacío). NULL = se usa tara fija del vehículo"
    },
    nro_manifiesto: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    nro_remito: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    peso_declarado_kg: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true
    },
    diferencia_kg: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true
    },
    dentro_tolerancia: {
      type: DataTypes.BOOLEAN,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'pesadas',
    hasTrigger: true,
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
        name: "fk_p_empresa",
        using: "BTREE",
        fields: [
          { name: "empresa_id" },
        ]
      },
      {
        name: "fk_p_vehiculo",
        using: "BTREE",
        fields: [
          { name: "vehiculo_id" },
        ]
      },
      {
        name: "fk_p_caja",
        using: "BTREE",
        fields: [
          { name: "caja_id" },
        ]
      },
      {
        name: "fk_p_usuario",
        using: "BTREE",
        fields: [
          { name: "usuario_id" },
        ]
      },
      {
        name: "fk_p_personal",
        using: "BTREE",
        fields: [
          { name: "personal_id" },
        ]
      },
      {
        name: "fk_p_material_general",
        using: "BTREE",
        fields: [
          { name: "material_general_id" },
        ]
      },
    ]
  });
};
