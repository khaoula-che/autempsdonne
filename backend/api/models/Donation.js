const Sequelize = require('sequelize');
const sequelize = require('../config/db');

const Donation = sequelize.define('donation', {
    ID_Donation: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
    montant: { type: Sequelize.INTEGER, allowNull: false },
    devise: { type: Sequelize.STRING(10), allowNull: false },
    email: { type: Sequelize.STRING(255), allowNull: false },
    id_paiement: { type: Sequelize.STRING(255), allowNull: false },
    statut: { 
        type: Sequelize.ENUM('en_attente', 'reussi', 'echoue'), 
        defaultValue: 'en_attente', 
        allowNull: false 
    },
    campagne_id: { 
        type: Sequelize.INTEGER, // Specify the data type for campagne_id
        allowNull: true,
        references: {
            model: 'Campagnes',
            key: 'ID_Campagne'
        }
    },
}, {
    timestamps: false
});

module.exports = Donation;
