const express = require('express');
const app = express();
const AWS = require('aws-sdk');
const multer = require('multer');
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const saltRounds = 10; 
app.use(express.json());
const Volunteer = require('../models/Volunteer');
const Formation = require('../models/Formation');
const Beneficiary = require('../models/Beneficiary');
const Partenaire = require('../models/Partenaire');
const crypto = require('crypto');
const Lieu= require('../models/Lieu');
const Activity = require('../models/Activity');
const ActivityPrive = require('../models/ActivityPrivate');
const Service = require('../models/Service');
const Blog = require('../models/Blog');
const EvenementBenevole = require('../models/EvenementBenevole');
const EvenementBeneficiaire = require('../models/EvenementBeneficiaire');

const RegisterF = require('../models/InscriptionFormation');
const Disponibilite = require('../models/Disponibilite');

const Notification = require( '../models/notifications' );
const jwt = require('jsonwebtoken');
const sequelize = require('../config/db'); 
const Sequelize = require('sequelize');

const s3 = new AWS.S3({
  endpoint: 's3.eu-central-1.wasabisys.com',
  accessKeyId: 'YEI1AYMEN8NT25MZQ8NW',
  secretAccessKey: 'WZt2XNSVHN4BY5EAssKfWOeX1D75ALoXriiozBiZ',
  region: 'eu-central-1',
});

const uploadFileToWasabi = async (file, folderName, fileName) => {
  if (!file || !file.buffer) {
    throw new Error('File buffer is missing');
  }

  const fullPath = `${folderName}/${fileName}`;

  const params = {
      Bucket: 'images-activity', 
      Key: fullPath,           
      Body: file.buffer,       
      ContentType: file.mimetype, 
      ACL: 'public-read'        
  };

  try {
    const data = await s3.upload(params).promise();
    if (!data || !data.Location) {
      throw new Error('Upload to Wasabi failed');
    }
    return data.Location;
  } catch (error) {
    console.error('Error uploading file to Wasabi:', error);
    throw error;
  }
};


exports.getAllServices = async (req, res) => {
  try {
    const services = await Service.findAll();
    res.status(200).json(services);
  } catch (error) {
    console.error('Erreur lors de la récupération des services :', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};
exports.createActivityPrive = async (req, res) => {
  const {
    description,
    date_activite,
    heure_debut,
    heure_fin,
    adresseId,
    titre,
    adresseComplete,
    ville,
    code_postal,
    id_benevole,   
    id_beneficiaire,  
    nom_service
  } = req.body;
  
  const t = await sequelize.transaction();

  try {

    const benevole = await Volunteer.findByPk(id_benevole, { transaction: t });

    if (!benevole ) {
      await t.rollback();
      return res.status(404).json({ error: 'Benevole or Beneficiaire not found.' });
    }

    const currentDate = new Date();
    const startDate = new Date(date_activite);
  
    if (startDate < currentDate) {
      await t.rollback();
      return res.status(400).send('La date de début est déjà passée.');
    }

    let lieu;

    if (adresseId) {
      lieu = await Lieu.findByPk(adresseId, { transaction: t });
      if (!lieu) {
        await t.rollback();
        return res.status(400).json({ error: 'Adresse non trouvée.' });
      }
    } else {
      [lieu, created] = await Lieu.findOrCreate({
        where: { adresse: adresseComplete, ville, code_postal },
        defaults: { adresse: adresseComplete, ville, code_postal },
        transaction: t
      });
    }

    const existingActivity = await ActivityPrive.findOne({
      where: {
        date_activite: startDate,
        id_lieu: lieu.id_lieu,
        [Op.or]: [
          { [Op.and]: [{ heure_debut: { [Op.lte]: heure_debut } }, { heure_fin: { [Op.gte]: heure_debut } }] },
          { [Op.and]: [{ heure_debut: { [Op.lte]: heure_fin } }, { heure_fin: { [Op.gte]: heure_fin } }] },
          { [Op.and]: [{ heure_debut: { [Op.gte]: heure_debut } }, { heure_fin: { [Op.lte]: heure_fin } }] }
        ]
      },
      transaction: t
    });



    if (existingActivity) {
      await t.rollback();
      return res.status(400).json({ error: 'An activity with the same start and end times already exists.' });
    }

    const overlappingBooking = await ActivityPrive.findOne({
      where: {
        id_benevole: id_benevole,
        id_beneficiaire: id_beneficiaire,
        date_activite: startDate,
        [Op.or]: [
          { [Op.and]: [{ heure_debut: { [Op.lte]: heure_fin } }, { heure_fin: { [Op.gte]: heure_debut } }] }
        ]
      },
      transaction: t
    });

    if (overlappingBooking) {
      await t.rollback();
      return res.status(400).json({ error: 'This volunteer is already booked for another activity at the same time.' });
    }

    let imageUrl = ""; // Default image path
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`; 
    } else {
      console.log("No file uploaded, using default image.");
    }

    await ActivityPrive.create({
      description,
      date_activite,
      heure_debut,
      heure_fin,
      titre,
      id_lieu: lieu.id_lieu,
      id_benevole,
      id_beneficiaire,
      image: imageUrl,
      nom_service
    }, { transaction: t });

    await t.commit();
    res.status(201).json({ message: 'Activity successfully added' });
  } catch (error) {
    await t.rollback();
    console.error('Erreur lors de l\'ajout de l\'activité privée : ', error);
    res.status(500).send('Erreur lors de l\'ajout de l\'activité privée : ' + error.message);
  }
};



const Op = Sequelize.Op;

exports.getVolunteersDisponibles = async (req, res) => {
    try {
        const { date, startTime, endTime } = req.params;

        if (!date || !startTime || !endTime) {
            return res.status(400).send("All parameters (date, startTime, endTime) are required.");
        }

        const jourDate = new Date(date);


        const startDate = new Date(`${date}T${startTime}:00Z`); 
        const endDate = new Date(`${date}T${endTime}:00Z`);
        const availableVolunteers = await Disponibilite.findAll({
            where: {
                jour: {
                  [Op.eq]: jourDate
                },
                heure_debut: {
                    [Op.lte]: startTime
                },
                heure_fin: {
                    [Op.gte]: endTime
                }
            },
            include: [{
                model: Volunteer,
                as: 'benevole',
                attributes: ['nom', 'prenom', 'email', 'telephone'] // Customize the attributes as needed
            }]
        });

        // Check if any volunteers were found
        if (availableVolunteers.length === 0) {
            return res.status(404).send('No available volunteers found.');
        }

        // Sending successful response
        res.json(availableVolunteers);
    } catch (error) {
        console.error('Error retrieving available volunteers:', error);
        res.status(500).send('Internal Server Error');
    }
};

async function getBeneficiaireId(nom, prenom) {
  const beneficiaire = await Beneficiary.findOne({ where: { nom, prenom } });
  if (!beneficiaire) {
    throw new Error(`Bénéficiaire non trouvé avec le nom ${nom} et le prénom ${prenom}`);
  }
  return beneficiaire.id;
}

exports.getVolunteerById = async (req, res) => {
  try {
    const id = req.params.id;
    const volunteer = await Volunteer.findByPk(id);
    if (!volunteer) {
      return res.status(404).send({ message: 'Bénévole non trouvé.' });
    }
    res.send({ nom: volunteer.nom, prenom: volunteer.prenom });
  } catch (error) {
    console.error('Erreur lors de la récupération du bénévole:', error);
    res.status(500).send({ message: 'Erreur lors de la récupération des informations du bénévole.' });
  }
};
exports.getBeneficiaryById = async (req, res) => {
  try {
    const id = req.params.id;
    const beneficiary = await Beneficiary.findByPk(id);
    if (!beneficiary) {
      return res.status(404).send({ message: 'Bénéficiaire non trouvé.' });
    }
    res.send({ nom: beneficiary.nom, prenom: beneficiary.prenom });
  } catch (error) {
    console.error('Erreur lors de la récupération du bénéficiaire:', error);
    res.status(500).send({ message: 'Erreur lors de la récupération des informations du bénéficiaire.' });
  }
};

exports.createActivity = async (req, res) => {
  const {
    description,
    date_activite,
    heure_debut,
    heure_fin,
    adresseId,
    titre,
    adresseComplete,
    ville,
    code_postal,
    nom_service,
    nb_benevoles
  } = req.body;

  const t = await sequelize.transaction();

  try {
    const currentDate = new Date();
    const startDate = new Date(date_activite);
  
    if (startDate < currentDate) {
      await t.rollback();
      return res.status(400).send('La date de début est déjà passée.');
    }

    let lieu;

    if (adresseId) {
      lieu = await Lieu.findByPk(adresseId, { transaction: t });
      if (!lieu) {
        await t.rollback();
        return res.status(400).json({ error: 'Adresse non trouvée.' });
      }
    } else {
      [lieu, created] = await Lieu.findOrCreate({
        where: { adresse: adresseComplete, ville, code_postal },
        defaults: { adresse: adresseComplete, ville, code_postal },
        transaction: t
      });
    }

    const existingActivity = await Activity.findOne({
      where: {
        date_activite: startDate,
        id_lieu: lieu.id_lieu,
        [Op.or]: [
          { [Op.and]: [{ heure_debut: { [Op.lte]: heure_debut } }, { heure_fin: { [Op.gte]: heure_debut } }] },
          { [Op.and]: [{ heure_debut: { [Op.lte]: heure_fin } }, { heure_fin: { [Op.gte]: heure_fin } }] },
          { [Op.and]: [{ heure_debut: { [Op.gte]: heure_debut } }, { heure_fin: { [Op.lte]: heure_fin } }] }
        ]
      },
      transaction: t
    });

    if (existingActivity) {
      await t.rollback();
      return res.status(400).json({ error: 'An activity with the same start and end times already exists.' });
    }

    // Handle file upload
    let imageUrl = ""; // Default image path
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`; 
    } else {
      console.log("No file uploaded, using default image.");
    }

    await Activity.create({
      description,
      date_activite,
      heure_debut,
      heure_fin,
      titre,
      id_lieu: lieu.id_lieu,
      image: imageUrl, 
      nom_service,
      nb_benevoles
    }, { transaction: t });

    await t.commit();
    res.status(201).json({ message: 'Activity successfully added' });

  } catch (error) {
    await t.rollback();
    console.error('Error adding activity: ', error);
    res.status(500).send('Error adding activity: ' + error.message);
  }
};


exports.updateActivity = async (req, res) => {
  const { id } = req.params;
  const { description, date_activite, heure_debut, heure_fin, titre, adresseComplete, ville, code_postal, nom_service, nb_benevoles } = req.body;
  const t = await sequelize.transaction();

  try {
    const currentDate = new Date();
    const startDate = new Date(date_activite);

    if (startDate < currentDate) {
      return res.status(400).send('La date de l\'activité ne peut pas être dans le passé.');
    }

    const lieu = await Lieu.findOne({
      where: { adresse: adresseComplete, ville, code_postal },
      transaction: t
    });

    if (!lieu) {
      await t.rollback();
      return res.status(404).send('Lieu introuvable.');
    }

    const existingActivity = await Activity.findOne({
      where: {
        id: {
          [Op.ne]: id 
        },
        date_activite: startDate,
        id_lieu: lieu.id_lieu,
        [Op.or]: [
          {
            [Op.and]: [
              { heure_debut: { [Op.lte]: heure_debut } },
              { heure_fin: { [Op.gte]: heure_debut } }
            ]
          },
          {
            [Op.and]: [
              { heure_debut: { [Op.lte]: heure_fin } },
              { heure_fin: { [Op.gte]: heure_fin } }
            ]
          },
          {
            [Op.and]: [
              { heure_debut: { [Op.gte]: heure_debut } },
              { heure_fin: { [Op.lte]: heure_fin } }
            ]
          }
        ]
      },
      transaction: t
    });

    if (existingActivity) {
      await t.rollback();
      return res.status(400).send('Conflit d\'horaire avec une autre activité.');
    }

    await Activity.update({
      description,
      date_activite,
      heure_debut,
      heure_fin,
      titre,
      id_lieu: lieu.id_lieu,
      nom_service,
      nb_benevoles
    }, {
      where: { id },
      transaction: t
    });

    await t.commit();
    res.status(200).send('Activité mise à jour avec succès.');
  } catch (error) {
    await t.rollback();
    console.error('Erreur lors de la mise à jour de l\'activité : ', error);
    res.status(500).send('Erreur lors de la mise à jour de l\'activité : ' + error.message);
  }
};
exports.updateActivity = async (req, res) => {
  const { ID_Activite } = req.params;
  const { description, date_activite, heure_debut, heure_fin, titre, adresseComplete, ville, code_postal, nom_service, nb_benevoles } = req.body;
  const t = await sequelize.transaction();

  try {
    const currentDate = new Date();
    const startDate = new Date(date_activite);

    if (startDate < currentDate) {
      await t.rollback();
      return res.status(400).send('La date de l\'activité ne peut pas être dans le passé.');
    }

    let [lieu, created] = await Lieu.findOrCreate({
      where: { adresse: adresseComplete, ville, code_postal },
      defaults: { adresse: adresseComplete, ville, code_postal },
      transaction: t
    });

    if (!lieu) {
      await t.rollback();
      return res.status(404).send('Lieu introuvable.');
    }

    const existingActivity = await Activity.findOne({
      where: {
        ID_Activite: {
          [Op.ne]: ID_Activite
        },
        date_activite: startDate,
        id_lieu: lieu.id_lieu,
        [Op.or]: [
          {
            [Op.and]: [
              { heure_debut: { [Op.lte]: heure_debut } },
              { heure_fin: { [Op.gte]: heure_debut } }
            ]
          },
          {
            [Op.and]: [
              { heure_debut: { [Op.lte]: heure_fin } },
              { heure_fin: { [Op.gte]: heure_fin } }
            ]
          },
          {
            [Op.and]: [
              { heure_debut: { [Op.gte]: heure_debut } },
              { heure_fin: { [Op.lte]: heure_fin } }
            ]
          }
        ]
      },
      transaction: t
    });

    if (existingActivity) {
      await t.rollback();
      return res.status(400).send('Conflit d\'horaire avec une autre activité.');
    }

    await Activity.update({
      titre,
      description,
      date_activite,
      heure_debut,
      heure_fin,
      titre,
      id_lieu: lieu.id_lieu,
      nom_service,
      nb_benevoles
    }, {
      where: { ID_Activite },
      transaction: t
    });

    await t.commit();
    res.status(200).send('Activité mise à jour avec succès.');
  } catch (error) {
    await t.rollback();
    console.error('Erreur lors de la mise à jour de l\'activité : ', error);
    res.status(500).send('Erreur lors de la mise à jour de l\'activité : ' + error.message);
  }
};
exports.updateActivityPrive = async (req, res) => {
  const { ID_Activite } = req.params;
  const { description, date_activite, heure_debut, heure_fin, titre, adresseComplete, ville, code_postal, nom_service, nb_benevoles } = req.body;
  const t = await sequelize.transaction();

  try {
    const currentDate = new Date();
    const startDate = new Date(date_activite);

    if (startDate < currentDate) {
      await t.rollback();
      return res.status(400).send('La date de l\'activité ne peut pas être dans le passé.');
    }

    let [lieu, created] = await Lieu.findOrCreate({
      where: { adresse: adresseComplete, ville, code_postal },
      defaults: { adresse: adresseComplete, ville, code_postal },
      transaction: t
    });

    if (!lieu) {
      await t.rollback();
      return res.status(404).send('Lieu introuvable.');
    }

    const existingActivity = await ActivityPrive.findOne({
      where: {
        ID_Activite: {
          [Op.ne]: ID_Activite
        },
        date_activite: startDate,
        id_lieu: lieu.id_lieu,
        [Op.or]: [
          {
            [Op.and]: [
              { heure_debut: { [Op.lte]: heure_debut } },
              { heure_fin: { [Op.gte]: heure_debut } }
            ]
          },
          {
            [Op.and]: [
              { heure_debut: { [Op.lte]: heure_fin } },
              { heure_fin: { [Op.gte]: heure_fin } }
            ]
          },
          {
            [Op.and]: [
              { heure_debut: { [Op.gte]: heure_debut } },
              { heure_fin: { [Op.lte]: heure_fin } }
            ]
          }
        ]
      },
      transaction: t
    });

    if (existingActivity) {
      await t.rollback();
      return res.status(400).send('Conflit d\'horaire avec une autre activité.');
    }

    await ActivityPrive .update({
      titre,
      description,
      date_activite,
      heure_debut,
      heure_fin,
      titre,
      id_lieu: lieu.id_lieu,
      nb_benevoles
    }, {
      where: { ID_Activite },
      transaction: t
    });

    await t.commit();
    res.status(200).send('Activité mise à jour avec succès.');
  } catch (error) {
    await t.rollback();
    console.error('Erreur lors de la mise à jour de l\'activité : ', error);
    res.status(500).send('Erreur lors de la mise à jour de l\'activité : ' + error.message);
  }
};
exports.createFormation = async (req, res) => {
  const { description, date_debut, date_fin,    adresseId,
    heure_debut, heure_fin, titre, adresseComplete, ville, code_postal } = req.body;
  const t = await sequelize.transaction();

  try {
    const currentDate = new Date();
    const startDate = new Date(date_debut);
    const EndDate = new Date(date_fin);
  
    if (startDate < currentDate) {
      return res.status(400).send('La date de début est déjà passée.');
    }
    if (EndDate < currentDate) {
      return res.status(400).send('La date de fin est déjà passée.');
    }
  
    let lieu;

    if (adresseId) {
      // Utilisateur a sélectionné une adresse existante
      lieu = await Lieu.findByPk(adresseId, { transaction: t });
      if (!lieu) {
        await t.rollback();
        return res.status(400).json({ error: 'Adresse non trouvée.' });
      }
    } else {
      [lieu, created] = await Lieu.findOrCreate({
        where: { adresse: adresseComplete, ville, code_postal },
        defaults: { adresse: adresseComplete, ville, code_postal },
        transaction: t
      });
    }
    const endDate = new Date(date_fin);

    const existingFormation = await Formation.findOne({
      where: {
        date_debut: startDate,
        date_fin: endDate,
        id_lieu: lieu.id_lieu
      },
      transaction: t
    });

    if (existingFormation) {
      await t.rollback();
      return res.status(400).send('Une formation avec les mêmes dates de début et de fin existe déjà.');
    }

    await Formation.create({
      description,
      date_debut: startDate,
      date_fin: endDate,
      heure_debut,
      heure_fin,
      titre,
      id_lieu: lieu.id_lieu,
    }, { transaction: t });

    await t.commit();

    res.status(201).send('Formation ajoutée avec succès.');
  } catch (error) {
    await t.rollback();
    console.error('Erreur lors de l\'ajout de formation : ', error);
    res.status(500).send('Erreur lors de l\'ajout de formation : ' + error.message);
  }
};
const models = require('../models');
models.Activity.belongsTo(models.Lieu, { foreignKey: 'id_lieu', as: 'activityLieu' });

exports.getLatestActivities = async (req, res) => {
  try {
    const activities = await Activity.findAll({
      include: [{
        model: Lieu, 
        as: 'lieu' 
      }],
      order: [['ID_Activite', 'DESC']],
      limit: 4
    });
    
    res.status(200).json(activities);
  } catch (error) {
    console.error("Erreur lors de la récupération des dernières activités :", error);
    res.status(500).json({ message: "Erreur lors de la récupération des dernières activités." });
  }
};

exports.getPastActivities = async (req, res) => {
  try {
    const today = new Date(); 

    const publicActivitiesPromise = Activity.findAll({
      where: {
        date_activite: {
          [Op.lt]: today
        }
      },
      include: [{
        model: Lieu,
        as: 'lieu'
      }],
      order: [['date_activite', 'DESC']]
    });

    const privateActivitiesPromise = ActivityPrive.findAll({
      where: {
        date_activite: {
          [Op.lt]: today
        }
      },
      include: [{
        model: Lieu,
        as: 'lieu'
      }],
      order: [['date_activite', 'DESC']]
    });

    const [publicActivities, privateActivities] = await Promise.all([publicActivitiesPromise, privateActivitiesPromise]);

    const allActivities = publicActivities.concat(privateActivities);

    allActivities.sort((a, b) => new Date(b.date_create) - new Date(a.date_create));

    res.status(200).json(allActivities);
  } catch (error) {
    console.error("Erreur lors de la récupération des activités passées :", error);
    res.status(500).json({ message: "Erreur lors de la récupération des activités passées." });
  }
};

exports.getFormations = async (req, res) => {
  try {
    const today = new Date();
    const formations = await Formation.findAll({
      where: {
        date_debut: {
          [Op.gte]: today 
        }
      },
      include: [{
        model: Lieu, 
        as: 'lieuF' 
      }], order: [
        ['date_debut', 'ASC'] 
      ]
    });
    
    res.status(200).json(formations);
  } catch (error) {
    console.error("Erreur lors de la récupération des dernières activités :", error);
    res.status(500).json({ message: "Erreur lors de la récupération des dernières activités." });
  }
};

exports.getActivities = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activities = await Activity.findAll({
      where: {
        date_activite: {
          [Op.gte]: today 
        }
      },
      include: [{
        model: Lieu, 
        as: 'lieu' 
      }], order: [
        ['date_activite', 'ASC'] 
      ]
    });
    
    res.status(200).json(activities);
  } catch (error) {
    console.error("Erreur lors de la récupération des dernières activités :", error);
    res.status(500).json({ message: "Erreur lors de la récupération des dernières activités." });
  }
};


exports.getActivitiesPrives = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const activities = await ActivityPrive.findAll({
      where: {
        date_activite: {
          [Op.gte]: today 
        }
      },
      include: [{
        model: Lieu, 
        as: 'lieu' 
      }], order: [
        ['date_activite', 'ASC'] 
      ],
      order: [['ID_Activite', 'DESC']],
      attributes: ['ID_Activite', 'titre', 'description', 'date_activite']
    });

    res.status(200).json(activities);
  } catch (error) {
    console.error("Erreur lors de la récupération des dernières activités :", error);
    res.status(500).json({ message: "Erreur lors de la récupération des dernières activités.", error: error.message });
  }
};

exports.showEvent = async (req, res) => {
  try {
    const { ID_Activite } = req.params;
    const activity = await Activity.findByPk(ID_Activite, {
      include: [{
        model: Lieu, 
        as: 'lieu' 
      }],
    });

    if (!activity) {
      return res.status(404).json({ error: 'Activité non trouvée.' });
    }
    res.json(activity);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'activité :', error);
    res.status(500).send({ message: 'Erreur lors de la récupération des informations de l\'activité.' });
  }
};
exports.showFormation = async (req, res) => {
  try {
    const { ID_Formation } = req.params;
    const activity = await Formation.findByPk(ID_Formation, {
      include: [{
        model: Lieu, 
        as: 'lieuF' 
      }],
    });

    if (!activity) {
      return res.status(404).json({ error: 'Activité non trouvée.' });
    }
    res.json(activity);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'activité :', error);
    res.status(500).send({ message: 'Erreur lors de la récupération des informations de l\'activité.' });
  }
};
exports.showEventPrive = async (req, res) => {
  try {
    const { ID_Activite } = req.params;
    const activity = await ActivityPrive.findByPk(ID_Activite, {
      include: [{
        model: Lieu,
        as: 'lieu',
      },
      {
        model: Volunteer,
        as: 'volunteer',
        attributes: ['nom', 'prenom']
      },
      {
        model: Beneficiary,
        as: 'beneficiary',
        attributes: ['nom', 'prenom']
      }
      ],
      order: [['ID_Activite', 'DESC']]
    });

    if (!activity) {
      return res.status(404).json({ error: 'Activité non trouvée.' });
    }

    res.json(activity);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'activité :', error);
    res.status(500).send({ message: 'Erreur lors de la récupération des informations de l\'activité.' });
  }
};


exports.deleteEventPrive = async (req, res) => {
  const { eventId } = req.params;

  try {
      await sequelize.transaction(async (t) => {
          await EvenementBenevole.destroy({
              where: {
                ID_event: eventId
              },
              transaction: t
          });

          const result = await ActivityPrive.destroy({
              where: {
                  ID_Activite: eventId
              },
              transaction: t
          });

          if (result > 0) {
              res.status(200).json({ message: "Événement supprimé avec succès." });
          } else {
              res.status(404).json({ message: "Événement non trouvé." });
          }
      });
  } catch (error) {
      console.error("Erreur lors de la suppression de l'événement :", error);
      res.status(500).json({ message: "Erreur lors de la suppression de l'événement.", error: error.message });
  }
};
exports.deleteEvent = async (req, res) => {
  const { eventId } = req.params;

  let t;

  try {
      t = await sequelize.transaction();

      const deleteBenevole = await EvenementBenevole.destroy({
          where: {
              ID_event: eventId
          },
          transaction: t
      });

      const deleteBeneficiaire = await EvenementBeneficiaire.destroy({
          where: {
            ID_event: eventId
          },
          transaction: t
      });

      const result = await Activity.destroy({
          where: {
              ID_Activite: eventId
          },
          transaction: t
      });

      if (result > 0) {
          await t.commit();
          res.status(200).json({ message: "Événement supprimé avec succès." });
      } else {
          await t.rollback();
          res.status(404).json({ message: "Événement non trouvé." });
      }
  } catch (error) {
      // Rollback on error
      await t.rollback();
      console.error("Erreur lors de la suppression de l'événement :", error);
      res.status(500).json({ message: "Erreur lors de la suppression de l'événement.", error: error.message });
  }
};
exports.deleteFormation = async (req, res) => {
  const { ID_Formation } = req.params;

  let t;

  try {
      t = await sequelize.transaction();

      const deleteBenevole = await RegisterF.destroy({
          where: {
              id: ID_Formation
          },
          transaction: t
      });

      const result = await Formation.destroy({
          where: {
              ID_Formation: ID_Formation
          },
          transaction: t
      });

      if (result > 0) {
          await t.commit();
          res.status(200).json({ message: "Événement supprimé avec succès." });
      } else {
          await t.rollback();
          res.status(404).json({ message: "Événement non trouvé." });
      }
  } catch (error) {
      await t.rollback();
      console.error("Erreur lors de la suppression de l'événement :", error);
      res.status(500).json({ message: "Erreur lors de la suppression de l'événement.", error: error.message });
  }
};

exports.addPartenaire = async (req, res) => {
  const { nom, email, telephone, adresseComplete, ville, code_postal } = req.body;

  const generatePassword = () => {
      return Array.from(crypto.randomFillSync(new Uint8Array(6))).map((item) => {
          return Math.floor(item / 25.6); 
      }).join('');
  };

  const password = generatePassword();

  const t = await sequelize.transaction();

  try {
      const [lieu, created] = await Lieu.findOrCreate({
          where: { adresse: adresseComplete, ville, code_postal },
          defaults: { adresse: adresseComplete, ville, code_postal },
          transaction: t
      });

      await Partenaire.create({
          nom,
          email,
          telephone,
          password, 
          id_Adresse: lieu.id_lieu, 
      }, { transaction: t });

      await t.commit();

      res.status(201).send('Partenaire ajouté avec succès.');
  } catch (error) {
      await t.rollback();
      console.error('Erreur lors de l\'ajout de Partenaire : ', error);
      res.status(500).send('Erreur lors de l\'ajout de Partenaire : ' + error.message);
  }
};

exports.addRegistration = async (req, res) => {
  const { ID_event, ID_Benevole } = req.body;

  try {
      const existingRegistration = await EvenementBenevole.findOne({
          where: {
              ID_event: ID_event,
              ID_Benevole: ID_Benevole
          }
      });

      if (existingRegistration) {
          return res.status(409).send('The volunteer is already registered for this event.');
      }
      const registration = await EvenementBenevole.create({
          ID_event: ID_event,
          ID_Benevole: ID_Benevole,
          Date_Inscription: new Date()  
      });

      return res.status(201).json(registration);
  } catch (error) {
      console.error('Error adding registration:', error);
      res.status(500).send('Internal Server Error');
  }
};

exports.getRegistrations = async (req, res) => {
  const { ID_event } = req.params;

  try {
      const registrations = await EvenementBenevole.findAll({
          where: { ID_event: ID_event },
          include: [{
              model: Volunteer,
              as: 'volunteer'  
          }]
      });

      return res.status(200).json(registrations);
  } catch (error) {
      console.error('Error fetching registrations:', error);
      res.status(500).send('Internal Server Error');
  }
};
exports.getRegistrationsBenef = async (req, res) => {
  const { ID_event } = req.params;

  try {
      const registrations = await EvenementBeneficiaire.findAll({
          where: { ID_event: ID_event },
          include: [{
              model: Beneficiary,
              as: 'beneficiary'  
          }]
      });

      return res.status(200).json(registrations);
  } catch (error) {
      console.error('Error fetching registrations:', error);
      res.status(500).send('Internal Server Error');
  }
};
exports.removeVolunteerFromEvent = async (req, res) => {
  const { ID_event, ID_Benevole } = req.params;

  try {
      const result = await EvenementBenevole.destroy({
          where: {
            ID_event: ID_event,
            ID_Benevole: ID_Benevole
          }
      });

      if (result === 0) {
          return res.status(404).send('No registration found with the given IDs.');
      }

      res.send('Volunteer unregistered successfully.');
  } catch (error) {
      console.error('Failed to remove volunteer from event:', error);
      res.status(500).send('Internal Server Error');
  }
};

exports.removeBeneficiaryFromEvent = async (req, res) => {
  const { ID_event, ID_Beneficiaire } = req.params;

  try {
      const result = await EvenementBeneficiaire.destroy({
          where: {
            ID_event: ID_event,
            ID_Beneficiaire: ID_Beneficiaire
          }
      });

      if (result === 0) {
          return res.status(404).send('No registration found with the given IDs.');
      }

      res.send('Volunteer unregistered successfully.');
  } catch (error) {
      console.error('Failed to remove volunteer from event:', error);
      res.status(500).send('Internal Server Error');
  }
};
exports.sendNotification = async (req, res) => {
  try {
      const { id_benevole, id_beneficiaire, titre, message, date_envoi } = req.body;

      const newNotification = await Notification.create({
          id_benevole,
          id_beneficiaire,
          titre,
          message,
          date_envoi
      });

      res.status(201).json(newNotification);
  } catch (error) {
      console.error("Error sending notification:", error);
      res.status(500).json({ error: "Internal server error" });
  }
};

exports.getAllAdresses = async (req, res) => {
  try {
    const adresses = await Lieu.findAll(); 
    res.status(200).json(adresses); 
  } catch (error) {
    res.status(500).json({ message: 'Erreur lors de la récupération des adresses', error: error }); 
  }
};
exports.getAllEventsForAdmin = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [eventsNormal, eventsPrivate, formations] = await Promise.all([
      EvenementBenevole.findAll({
        include: [{
          model: Activity,
          as: 'activity',
          where: { date_activite: { [Op.gte]: today } }, 
          include: [{
            model: Lieu,
            as: 'lieuA',
            attributes: ['adresse', 'ville', 'code_postal']
          }]
        }],
        order: [[{ model: Activity, as: 'activity' }, 'date_activite', 'ASC']] 
      }),
      ActivityPrive.findAll({
        where: { date_activite: { [Op.gte]: today } },
        include: [{
          model: Lieu,
          as: 'lieu',
          attributes: ['adresse', 'ville', 'code_postal']
        }],
        order: [['date_activite', 'ASC']]
      }),
      RegisterF.findAll({
        include: [{
          model: Formation,
          as: 'formation',
          where: { date_debut: { [Op.gte]: today } }, 
          include: [{
            model: Lieu,
            as: 'lieuF',
            attributes: ['adresse', 'ville', 'code_postal']
          }]
        }],
        order: [[{ model: Formation, as: 'formation' }, 'date_debut', 'ASC']] 
      }),
    ]);

    const combinedEvents = [...eventsNormal, ...eventsPrivate, ...formations];

    if (combinedEvents.length > 0) {
      res.status(200).json(combinedEvents);
    } else {
      res.status(404).json({ message: 'Aucun événement trouvé.' });
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des événements pour l\'administrateur :', error);
    res.status(500).json({ message: 'Erreur interne du serveur lors de la récupération des événements.' });
  }
};

