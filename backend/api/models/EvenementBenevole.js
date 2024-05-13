const sequelize = require('../config/db');
const Sequelize = require('sequelize');

const Volunteer = require('./Volunteer');
const Activity = require('./Activity');

const EvenementBenevole = sequelize.define('evenements_benevoles', {
    ID_Evenement_Benevole: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    ID_event: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    ID_Benevole: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    Date_Inscription: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
    }
}, {
    timestamps: false
});

// Set up the associations
Volunteer.hasMany(EvenementBenevole, { foreignKey: 'ID_Benevole' });
EvenementBenevole.belongsTo(Volunteer, { foreignKey: 'ID_Benevole', as: 'volunteer' });

EvenementBenevole.belongsTo(Activity, { foreignKey: 'ID_event', as: 'activity' });
Activity.hasMany(EvenementBenevole, { foreignKey: 'ID_event' });

module.exports = EvenementBenevole;
