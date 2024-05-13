const Sequelize = require('sequelize');
const sequelize = require('../config/db');
const Lieu = require('./Lieu');

const Partenaire = sequelize.define('commercants_partenaire', {
    ID_Commercant: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    nom: {
        type: Sequelize.STRING,
        allowNull: false
    },
    email: {
        type: Sequelize.STRING
    },

    password: {
        type: Sequelize.STRING
    },
    telephone: { type: Sequelize.STRING },


    adresse: { type: Sequelize.STRING },

    ville: { type: Sequelize.STRING },

    code_postal: { type: Sequelize.STRING(5) }
}, {


    tableName: 'commercants_partenaire', 
    timestamps: false
});

module.exports = Partenaire;
