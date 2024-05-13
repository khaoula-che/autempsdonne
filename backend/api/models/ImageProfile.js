const sequelize = require('../config/db');
const Beneficiary = require('./Beneficiary');
const Volunteer = require('./Volunteer');

const { Sequelize, DataTypes } = require('sequelize');

const ImageProfile = sequelize.define('image_profile', {
  ID_Image: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  image_path: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'image_profile',
  timestamps: false
});

module.exports = ImageProfile;
