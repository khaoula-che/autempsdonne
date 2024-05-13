const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Entrepot = require('./Entrepot');
const Denree = require('./Denree');

const Stock = sequelize.define('Stock', {
  ID_Stock: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  date_collecte: {
    type: DataTypes.DATE,
    allowNull: false
  },
  ID_Entrepot: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Entrepot,
      key: 'id'
    }
  },
  ID_Denree: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Denree,
      key: 'ID_Denree'
    }
  },
},
{
timestamps: false 
});
// Association avec le modèle Entrepot
Stock.belongsTo(Entrepot, { foreignKey: 'ID_Entrepot', as: 'entrepot' });

// Association avec le modèle Denree
Stock.belongsTo(Denree, { foreignKey: 'ID_Denree', as: 'denree' });

module.exports = Stock;
