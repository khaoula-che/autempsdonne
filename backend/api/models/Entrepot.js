const Sequelize = require('sequelize');
const sequelize = require('../config/db');


const Entrepot = sequelize.define('Entrepot', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nom: {
        type: Sequelize.STRING,
        allowNull: false
    },
    adresse: {
        type: Sequelize.STRING,
        allowNull: false
    },
    ville: {
        type: Sequelize.STRING,
        allowNull: false
    },
    code_postal: {
        type: Sequelize.STRING(10),
        allowNull: false
    },
    capacite: {
        type: Sequelize.INTEGER,
        allowNull: false
    }
}, 
{
  tableName: 'Entrepot', 

  timestamps: false 
});

module.exports = Entrepot;
