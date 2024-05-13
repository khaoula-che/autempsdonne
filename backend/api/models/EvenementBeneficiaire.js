const sequelize = require('../config/db');
const Sequelize = require('sequelize');

const Volunteer = require('./Volunteer');
const Activity = require('./Activity');
const Beneficiary = require('./Beneficiary');

const EvenementBeneficiaire = sequelize.define('evenements_beneficiaire', {
    ID_Evenement_Beneficiaire: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    ID_event: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    ID_Beneficiaire: {
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
Beneficiary.hasMany(EvenementBeneficiaire, { foreignKey: 'ID_Beneficiaire' });
EvenementBeneficiaire.belongsTo(Beneficiary, { foreignKey: 'ID_Beneficiaire', as: 'beneficiary' });

EvenementBeneficiaire.belongsTo(Activity, { foreignKey: 'ID_event', as: 'activity' });
Activity.hasMany(EvenementBeneficiaire, { foreignKey: 'ID_event' });

module.exports = EvenementBeneficiaire;
