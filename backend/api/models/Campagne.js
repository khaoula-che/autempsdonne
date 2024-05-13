const Sequelize = require('sequelize');
const sequelize = require('../config/db');
const Donation = require('./Donation');

const Campagne = sequelize.define('Campagne', {
    ID_Campagne: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
    titre: { type: Sequelize.STRING(100), allowNull: false },
    description: { type: Sequelize.TEXT, allowNull: false },
    montant_cible: { type: Sequelize.INTEGER, allowNull: false },
    montant_actuel: { type: Sequelize.INTEGER, defaultValue: 0 },
    date_debut: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    date_fin: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.literal('CURRENT_TIMESTAMP') },
    statut: { type: Sequelize.ENUM('actif', 'termine'), defaultValue: 'actif' },
}, {
    timestamps: false
});
Campagne.hasMany(Donation, { foreignKey: 'campagne_id' });

module.exports = Campagne;