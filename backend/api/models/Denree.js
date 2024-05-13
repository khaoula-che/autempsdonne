const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");
const Partenaire = require("./Partenaire");
const Maraude = require("./Maraude");

const Denree = sequelize.define("denrees", {
  ID_Denree: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  categorie: {
    type: DataTypes.STRING,
    allowNull: false
  },
  date_peremption: {
    type: DataTypes.DATE,
    allowNull: false
  },
  quantite: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  ID_Stock: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  nom: {
    type: DataTypes.STRING,
    allowNull: false
  }, 
  id_commercant: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "commercants_partenaire",
      key: "ID_Commercant"
    }
  },
 id_maraude: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: "maraude",
      key: "ID"
    }
  },
    Date_ajout: {
    type: DataTypes.DATE,
    allowNull: true,
  },
statut_collecte: {
type: DataTypes.STRING,
allowNull: true,
},

  }, {
    tableName: "denrees",
    timestamps: false
  });
  Denree.belongsTo(Partenaire, { foreignKey: "id_commercant", as: "commercant" });

module.exports = Denree;
