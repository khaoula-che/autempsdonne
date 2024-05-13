const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Sequelize = require('sequelize');


const Problem = sequelize.define('Problem', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    description: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    solved: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    },
    resolved_at: {
      type: DataTypes.DATE,
      allowNull: true
    },
    type: {
      type: DataTypes.ENUM('urgent', 'other'),
      allowNull: false,
      defaultValue: 'other'
    },
    admin_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'administrateurs',
        key: 'id'
      }
    },
    created_by: {
      type: DataTypes.INTEGER
    }
  }, {
  tableName: 'problems' ,// Make sure to specify the correct table name if it's different from the model name
  timestamps: false

});

module.exports = Problem;
