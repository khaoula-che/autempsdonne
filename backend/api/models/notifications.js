const Sequelize = require('sequelize');
const sequelize = require('../config/db');

const Notif = sequelize.define('notifications', {
    notification_id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
    message: { type: Sequelize.TEXT, allowNull: false },
    titre: { type: Sequelize.STRING(255), allowNull: false },
    id_benevole: { type: Sequelize.INTEGER },
    id_beneficiaire: { type: Sequelize.INTEGER },
    date_envoi: { type: Sequelize.DATE, allowNull: false } 
}, {
    timestamps: false
});

module.exports = Notif;
