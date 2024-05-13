const Sequelize = require('sequelize');
const sequelize = require('../config/db');

const Service = sequelize.define('services', {
  ID_Service: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
  nom: { type: Sequelize.STRING, allowNull: false },
  description: { type: Sequelize.TEXT },
}, {
  timestamps: false
});

module.exports = Service;
