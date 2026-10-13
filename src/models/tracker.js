export default (sequelize, DataTypes) =>
  sequelize.define('Tracker', {
    codigo:  { type: DataTypes.STRING(64), allowNull: false, unique: true }, // 'tag-03'
    patente: DataTypes.STRING(16),  
    activo:  { type: DataTypes.BOOLEAN, defaultValue: true },
    cajaDesde: { type: DataTypes.DATE, allowNull: true, field: 'caja_desde' },
  }, { tableName: 'trackers' });