const Sequelize = require('sequelize');
const sequelize = require('../config/db');

const Lieu = sequelize.define('lieu', {
  id_lieu: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
  adresse: { type: Sequelize.STRING, allowNull: false },
  ville: { type: Sequelize.STRING },
  code_postal: { type: Sequelize.STRING(5) }
}, {
  tableName: 'lieux',
  timestamps: false
});

module.exports = Lieu;
