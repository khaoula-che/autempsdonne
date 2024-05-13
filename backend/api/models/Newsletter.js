const Sequelize = require('sequelize');
const sequelize = require('../config/db');

const Newsletter = sequelize.define('newsletters', {
  id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
  date_inscription: { type: Sequelize.DATE, allowNull: false },
  email: { type: Sequelize.STRING, allowNull: false }
}, 
{
  timestamps: false
});

module.exports = Newsletter;
