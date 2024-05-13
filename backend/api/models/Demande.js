const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Beneficiary = require('./Beneficiary');

const DemandeService = sequelize.define('demande_service', {
    ID_Demande: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  id_beneficiaire: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
        model: Beneficiary,
        key: 'id'
      }
  },
  
  titre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  service: {
    type: DataTypes.STRING,
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  date_demande: {
    type: DataTypes.DATE,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
}}, 
  {
    tableName: 'demandes_service',
    timestamps: false
  
}
);

DemandeService.belongsTo(Beneficiary, { foreignKey: 'id_beneficiaire', as: 'beneficiaire' });

module.exports = DemandeService;
