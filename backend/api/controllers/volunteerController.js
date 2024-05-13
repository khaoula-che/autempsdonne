const multer = require('multer');
const Volunteer = require('../models/Volunteer');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const AWS = require('aws-sdk');
const EvenementBenevole = require('../models/EvenementBenevole');
const RegisterF = require('../models/InscriptionFormation');
const Formation =  require('../models/Formation');
const Activity = require('../models/Activity');
const Lieu= require('../models/Lieu');
const { Op } = require('sequelize'); 
const argon2 = require('argon2');
const Disponibilite = require('../models/Disponibilite');
const PDFDocument = require('pdfkit');
require('dotenv').config(); 
const Denree = require('../models/Denree');
const Entrepot = require('../models/Entrepot');
const Maraude = require('../models/Maraude');
const Stocks = require('../models/Stocks');

const storage = multer.memoryStorage();
const upload = multer({ storage: storage }).fields([
  { name: 'casier_judiciaire', maxCount: 1 },
  { name: 'justificatif_permis', maxCount: 1 },
]);

const s3 = new AWS.S3({
  endpoint: 's3.eu-central-1.wasabisys.com',
  accessKeyId: '89CXGF5GBBOXSHCAY59S',
  secretAccessKey: 'mWJz3gVrge40VsyGQiiloUtHcCQOYKDLGPv9ZwKU',
  region: 'eu-central-1',
});

const uploadFileToWasabi = async (file, folderName, fileName) => {
    if (!file || !file.buffer) {
      throw new Error('File buffer is missing');
    }
  
    const params = {
        Bucket: 'files-volunteers',
        Key: `${folderName}/${fileName}`, 
        Body: file.buffer,
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





  const sendWelcomeEmail = async (email, name) => {
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  
    const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: email,
      subject: 'Confirmation de votre candidature !',
      text: `Bonjour ${name},\n\nMerci d'avoir soumis votre candidature pour rejoindre notre équipe de bénévoles ! Votre candidature a été confirmée.\n\nVous pouvez maintenant vous connecter à votre espace personnel pour consulter nos prochains événements à venir et découvrir nos blogs.\n\nNous sommes ravis de vous accueillir et avons hâte de vous impliquer dans nos activités !`,
      html: `<p>Bonjour <strong>${name}</strong>,</p><p>Merci d'avoir soumis votre candidature pour rejoindre notre équipe de bénévoles ! Votre candidature a été confirmée.</p><p>Vous pouvez maintenant vous connecter à votre espace personnel pour consulter nos prochains événements à venir et découvrir nos blogs.</p><p>Nous sommes ravis de vous accueillir et avons hâte de vous impliquer dans nos activités !</p>`,
    };
  
    try {
      await transporter.sendMail(mailOptions);
      console.log('Email de confirmation de candidature envoyé avec succès');
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email de confirmation de candidature :', error.message);
    }
  };
  const generatePresignedUrlForWasabi = (bucket, key, expiresInSeconds) => {
    const params = {
      Bucket: bucket,
      Key: key,
      Expires: expiresInSeconds,
    };
    return s3.getSignedUrl('getObject', params);
  };
  
const registerVolunteer = async (req, res, next) => {
  try {
    const {
      nom, prenom, date_de_naissance, email, mot_de_passe, telephone, adresse, ville,
      code_postal, date_adhesion, genre, permis_conduire, langues, qualites, competences, message_candidature
    } = req.body;

    const existingVolunteer = await Volunteer.findOne({ where: { email } });
    if (existingVolunteer) {
      return res.status(409).json({ error: 'Un utilisateur avec cet email existe déjà.' });
    }

    const casier_judiciaireFile = req.files && req.files['casier_judiciaire'] && req.files['casier_judiciaire'][0];
    const justificatif_permisFile = req.files && req.files['justificatif_permis'] && req.files['justificatif_permis'][0];

    if (!casier_judiciaireFile) {
      return res.status(400).json({ error: 'Le fichier casier judiciaire est manquant.' });
    }

    const casier_judiciaireFileName = `${nom}_${prenom}_casier_judiciaire_${casier_judiciaireFile.originalname}`;
    const casier_judiciaireFilePath = `casier-judiciaire/${casier_judiciaireFileName}`;
    const casier_judiciaireURL = generatePresignedUrlForWasabi('files-volunteers', casier_judiciaireFilePath, 43200);

    await uploadFileToWasabi(casier_judiciaireFile, 'casier-judiciaire', casier_judiciaireFileName);

    const date_inscription = new Date();
    const hashedPassword = await argon2.hash(mot_de_passe);


    const newVolunteerData = {
      nom, prenom, date_de_naissance, email, mot_de_passe: hashedPassword, telephone, adresse, ville,
      code_postal, date_adhesion, statut_validation: 'en attente', genre, permis_conduire,
      casier_judiciaire: casier_judiciaireURL, langues, qualites, competences, message_candidature, date_inscription
    };



    if (justificatif_permisFile) {
      const justificatif_permisFileName = `${nom}_${prenom}_justificatif_permis_${justificatif_permisFile.originalname}`;
      const justificatif_permisFilePath = `justificatif-permis/${justificatif_permisFileName}`;
      const justificatif_permisURL = generatePresignedUrlForWasabi('files-volunteers', justificatif_permisFilePath, 43200);
      
      newVolunteerData.justificatif_permis = justificatif_permisURL;

      await uploadFileToWasabi(justificatif_permisFile, 'justificatif-permis', justificatif_permisFileName);
    }

    const newVolunteer = await Volunteer.create(newVolunteerData);

    await sendWelcomeEmail(email, `${prenom} ${nom}`);

    res.status(201).json({ message: 'Inscription réussie', volunteer: newVolunteer });
  } catch (error) {
    console.error('Erreur lors de l\'inscription du bénévole :', error);
    res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};

module.exports = { registerVolunteer };

/*ANDROID STUDIO APP FUNCTIONS*/
const loginVolunteerapp = async (req, res) => {
  try {
      const { email, password } = req.body;

      if (!email || !password) {
          return res.status(400).json({ error: 'Email and password are required' });
      }

      const volunteer = await Volunteer.findOne({ where: { email } });
      if (!volunteer) {
          return res.status(404).json({ error: 'User not found' });
      }

      const passwordMatch = await argon2.verify(volunteer.mot_de_passe, password);
      if (!passwordMatch) {
          return res.status(401).json({ error: 'Invalid password' });
      }

      const token = generateToken(volunteer.id, volunteer.email);
      const userType = "volunteer"

      res.set('Authorization', `Bearer ${token}`);
      console.log('JWT Token:', token);

      res.cookie('access_token', token, {
          httpOnly: true,
          maxAge: 3600000, 
          sameSite: 'none',
          path: '/', 
          
      });

      res.status(200).json({token}); 

  } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
};
const getUserInfoapp = async (req, res) => {
  try {
      const authorizationHeader = req.headers.authorization;
  
      if (!authorizationHeader) {
        return res.status(401).json({ error: 'No authorization header found' });
      }
  
      if (!authorizationHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Invalid authorization header format' });
      }
  
      const token = authorizationHeader.substring(7);
  
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      if (!decoded) {
        return res.status(401).json({ error: 'Invalid token' });
      }

      const volunteer = await Volunteer.findByPk(decoded.id);
      if (!volunteer) {
          return res.status(404).json({ error: 'Utilisateur non trouvé' });
      }

      res.status(200).json({ volunteer });
  } catch (error) {
      console.error('Erreur lors de l\'obtention des informations utilisateur :', error);
      res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};

const getActivitePriveForLoggedInUser = async (req, res) => {
  try {
      const authorizationHeader = req.headers.authorization;

      if (!authorizationHeader) {
          return res.status(401).json({ error: 'No authorization header found' });
      }

      if (!authorizationHeader.startsWith('Bearer ')) {
          return res.status(401).json({ error: 'Invalid authorization header format' });
      }

      const token = authorizationHeader.substring(7);

      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      if (!decoded) {
          return res.status(401).json({ error: 'Invalid token' });
      }

      const userId = decoded.id;

      const activites = await ActivitePrive.findAll({ where: { id_benevole: userId } });
      
      res.status(200).json({ activites });
  } catch (error) {
      console.error('Error getting activities for logged-in user:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
};

/*END */




const generateToken = (id, email) => {
  return jwt.sign({ id, email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
}; 

const authMiddleware = (req, res, next) => {
  const token = req.cookies.access_token;

  if (!token) {
      return res.status(401).json({ error: 'Non autorisé : Aucun token fourni' });
  }

  try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      req.user = decoded;
      next();
  } catch (error) {
      console.error(error);
      return res.status(401).json({ error: 'Non autorisé : Token invalide' });
  }
};

const loginVolunteer = async (req, res) => {
  try {
      const { email, password } = req.body;

      if (!email || !password) {
          return res.status(400).json({ error: 'Email and password are required' });
      }

      const volunteer = await Volunteer.findOne({ where: { email } });
      if (!volunteer) {
          return res.status(404).json({ error: 'User not found' });
      }

      const passwordMatch = await argon2.verify(volunteer.mot_de_passe, password);
      if (!passwordMatch) {
          return res.status(401).json({ error: 'Invalid password' });
      }

      const token = generateToken(volunteer.id, volunteer.email);
      const userType = "volunteer";
      const statut_validation = volunteer.statut_validation; 


      res.cookie('access_token', token, {
          httpOnly: true,
          maxAge: 3600000, // 1 hour
          sameSite: 'none',
          path: '/', // Set the cookie path to '/'
          secure: true // Add 'secure: true' if your app is served over HTTPS
      });

      res.status(200).json({ message: 'Login successful', token, userType,statut_validation }); 

  } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
};
const getUserInfo = async (req, res) => {
  try {
      const token = req.cookies.access_token;

      if (!token) {
          return res.status(401).json({ error: 'Aucun token trouvé' });
      }

      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      if (!decoded) {
          return res.status(401).json({ error: 'Token invalide' });
      }

      const volunteer = await Volunteer.findByPk(decoded.id);
      if (!volunteer) {
          return res.status(404).json({ error: 'Utilisateur non trouvé' });
      }

      res.status(200).json({ volunteer });
  } catch (error) {
      console.error('Erreur lors de l\'obtention des informations utilisateur :', error);
      res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};
const addRegistration = async (req, res) => {
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
const addRegistrationFormation = async (req, res) => {
  const { id_formation, id_benevole } = req.body;

  try {
    // Vérifier si l'inscription existe déjà
    const existingRegistration = await RegisterF.findOne({
      where: {
        id_formation: id_formation,
        id_benevole: id_benevole
      }
    });

    if (existingRegistration) {
      return res.status(409).send('The volunteer is already registered for this event.');
    }

    // Créer une nouvelle inscription
    const registration = await RegisterF.create({
      id_formation: id_formation,
      id_benevole: id_benevole,
      date_inscription: new Date()
    });

    return res.status(201).json(registration);
  } catch (error) {
    console.error('Error adding registration:', error);
    return res.status(500).send('Internal Server Error');
  }
};

const checkRegistrationStatusFormation = async (req, res) => {
  try {
    const id_formation = req.params.id_formation;
    const id_benevole = req.params.id_benevole;
    
    const registration = await RegisterF.findOne({ where: { id_formation: id_formation, id_benevole: id_benevole } });
    
    if (registration) {
      return res.status(200).json({ message: 'Bénévole déjà inscrit à cet événement' });
    } else {
      return res.status(404).json({ message: 'Bénévole non inscrit à cet événement' });
    }
  } catch (error) {
    console.error('Erreur lors de la vérification du statut d\'inscription:', error);
    return res.status(500).json({ error: 'Erreur interne du serveur lors de la vérification du statut d\'inscription' });
  }
};
const deleteRegistrationFormation = async (req, res) => {
  const id_formation = req.params.id_formation;
  const id_benevole = req.params.id_benevole;

  try {
    const registration = await RegisterF.destroy({
      where: {
        id_formation: id_formation,
        id_benevole: id_benevole,
        
      }
    });

    if (registration > 0) {
      res.status(200).json({ message: 'Inscription annulée avec succès.' });
    } else {
      res.status(404).json({ message: 'Aucune inscription correspondante trouvée.' });
    }
  } catch (error) {
    console.error('Erreur lors de l\'annulation de l\'inscription :', error);
    res.status(500).json({ message: 'Erreur lors de l\'annulation de l\'inscription.' });
  }
};
const checkRegistrationStatus = async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const benevoleId = req.params.benevoleId;
    
    const registration = await EvenementBenevole.findOne({ where: { ID_event: eventId, ID_Benevole: benevoleId } });
    
    if (registration) {
      return res.status(200).json({ message: 'Bénévole déjà inscrit à cet événement' });
    } else {
      return res.status(404).json({ message: 'Bénévole non inscrit à cet événement' });
    }
  } catch (error) {
    console.error('Erreur lors de la vérification du statut d\'inscription:', error);
    return res.status(500).json({ error: 'Erreur interne du serveur lors de la vérification du statut d\'inscription' });
  }
};

const deleteRegistration = async (req, res) => {
  const eventId = req.params.eventId;
  const benevoleId = req.params.benevoleId;

  try {
    const today = new Date();
    const registration = await EvenementBenevole.destroy({
      where: {
        ID_event: eventId,
        ID_Benevole: benevoleId,
        
      }
    });

    if (registration > 0) {
      res.status(200).json({ message: 'Inscription annulée avec succès.' });
    } else {
      res.status(404).json({ message: 'Aucune inscription correspondante trouvée.' });
    }
  } catch (error) {
    console.error('Erreur lors de l\'annulation de l\'inscription :', error);
    res.status(500).json({ message: 'Erreur lors de l\'annulation de l\'inscription.' });
  }
};
const models = require('../models');
const ActivityPrive = require('../models/ActivityPrivate');

models.Activity.belongsTo(models.Lieu, { foreignKey: 'id_lieu', as: 'lieuA' });


const getFormationsForVolunteer = async (req, res) => {
  const id_benevole = req.params.id_benevole;
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const events = await RegisterF.findAll({ 
      where: {
        id_benevole: id_benevole,
      },
      include: [
        {
          model: Formation,
          as: 'formation',
          where: {  
            date_debut: {
              [Op.gte]: today
            }
          },
          include: [
            {
              model: Lieu,
              as: 'lieuF',
              attributes: ['adresse', 'ville', 'code_postal']

            }
          ]
        }
      ]
    });

    if (events.length > 0) {
      res.status(200).json(events);
    } else {
      res.status(404).json({ message: 'Aucun événement trouvé pour ce bénévole.' });
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des événements pour le bénévole :', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des événements pour le bénévole.' });
  }
};
const getEventsForVolunteer = async (req, res) => {
  const benevoleId = req.params.benevoleId;
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const events = await EvenementBenevole.findAll({ 
      where: {
        ID_Benevole: benevoleId,
      },
      include: [
        {
          model: Activity,
          as: 'activity',
          where: {  
            date_activite: {
              [Op.gte]: today
            }
          },
          include: [
            {
              model: Lieu,
              as: 'lieuA',
              attributes: ['adresse', 'ville', 'code_postal']

            }
          ]
        }
      ]
    });

    if (events.length > 0) {
      res.status(200).json(events);
    } else {
      res.status(404).json({ message: 'Aucun événement trouvé pour ce bénévole.' });
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des événements pour le bénévole :', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des événements pour le bénévole.' });
  }
};
const getEventsPvForVolunteer = async (req, res) => {
  const benevoleId = req.params.benevoleId;
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const events = await ActivityPrive.findAll({ 
      where: {
        ID_Benevole: benevoleId,
        date_activite: {
          [Op.gte]: today 
        }
      },
      include: [
        {
          model: Lieu,
          as: 'lieu',
          attributes: ['adresse', 'ville', 'code_postal']

      }],
      order: [['date_activite', 'ASC']]
      
      
    });

    if (events.length > 0) {
      res.status(200).json(events);
    } else {
      res.status(404).json({ message: 'Aucun événement trouvé pour ce bénévole.' });
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des événements pour le bénévole :', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des événements pour le bénévole.' });
  } 
};

const getEventsAllForVolunteer = async (req, res) => {
  const benevoleId = req.params.benevoleId;
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [eventsNormal, eventsPrivate, formations] = await Promise.all([
      EvenementBenevole.findAll({
        where: { ID_Benevole: benevoleId },
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
        where: { ID_Benevole: benevoleId, date_activite: { [Op.gte]: today } },
        include: [{
          model: Lieu,
          as: 'lieu',
          attributes: ['adresse', 'ville', 'code_postal']
        }],
        order: [['date_activite', 'ASC']]
      }),
      RegisterF.findAll({
        where: { id_benevole: benevoleId },
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
      res.status(404).json({ message: 'Aucun événement trouvé pour ce bénévole à partir d\'aujourd\'hui.' });
    }
  } catch (error) {
    console.error('Erreur lors de la récupération des événements pour le bénévole :', error);
    res.status(500).json({ message: 'Erreur interne du serveur lors de la récupération des événements.' });
  }
};



const sendReminderNotification = async () => {
    try {
        const usersResponse = await OneSignal.getAllUsers();
        const userIds = usersResponse.data.users.map(user => user.id);

        const notification = {
            contents: { en: 'Rappel: Vous avez une activité planifiée aujourd\'hui !' },
            headings: { en: 'Rappel d\'activité' },
            include_player_ids: userIds,
        };

        const response = await OneSignal.createNotification(notification);
        console.log('Notification envoyée avec succès:', response);
    } catch (error) {
        console.error('Erreur lors de l\'envoi de la notification:', error);
    }
};


const displayAvailability = async (req, res) => {
  try {
    const accessToken = req.cookies.access_token;
    const decodedToken = jwt.decode(accessToken);
    const userId = decodedToken.id;

    const disponibilites = await Disponibilite.findAll({
      where: { id_benevole: userId }
    });
    res.json(disponibilites);
  } catch (error) {
    console.error('Error fetching availability:', error);
    res.status(500).json({ message: 'Error fetching availability' });
  }
};

const updateAvailability = async (req, res) => {
  try {
    const accessToken = req.cookies.access_token;
    const decodedToken = jwt.decode(accessToken);
    const userId = decodedToken.id;


    const { id_disponibilite } = req.params; 
    const { jour, heure_debut, heure_fin } = req.body;

    if (!id_disponibilite) {
      return res.status(400).json({ message: 'ID of availability is required' });
    }

    const updatedAvailability = await Disponibilite.update(
      { jour, heure_debut, heure_fin },
      { where: { id_disponibilite } }
    );

    if (updatedAvailability) {
      res.json({ message: 'Availability updated successfully' });
    } else {
      res.status(404).json({ message: 'Availability not found or could not be updated' });
    }
  } catch (error) {
    console.error('Error updating availability:', error);
    res.status(500).json({ message: 'Error updating availability' });
  }
};

const deleteAvailability = async (req, res) => {
  try {
    const accessToken = req.cookies.access_token;
    const decodedToken = jwt.decode(accessToken);
    const userId = decodedToken.id;

    const { id_disponibilite } = req.params; 

    await Disponibilite.destroy({ where: { id_disponibilite, id_benevole: userId } });
    res.json({ message: 'Availability deleted successfully' });
  } catch (error) {
    console.error('Error deleting availability:', error);
    res.status(500).json({ message: 'Error deleting availability' });
  }
};


const createAvailability = async (req, res) => {
  try {
    const accessToken = req.cookies.access_token; 
    const decodedToken = jwt.decode(accessToken);
    const userId = decodedToken.id;

    const { jour, heure_debut, heure_fin } = req.body;

    // Créer la disponibilité
    const newAvailability = await Disponibilite.create({
      jour,
      heure_debut,
      heure_fin,
      id_benevole: userId 
    });

    res.status(201).json({ message: 'Disponibilité créée avec succès', availability: newAvailability });
  } catch (error) {
    console.error('Erreur lors de la création de la disponibilité :', error);
    res.status(500).json({ message: 'Erreur lors de la création de la disponibilité' });
  }
};

const deleteAccount = async (req, res) => {
  try {
    const accessToken = req.cookies.access_token;
    const decodedToken = jwt.decode(accessToken);
    const userId = decodedToken.id;
    const volunteer = await Volunteer.findByPk(userId);
    if (!volunteer) {
      return res.status(404).json({ success: false, message: 'Volunteer not found' });
    }
    await volunteer.destroy();
    res.status(200).json({ success: true, message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Error deleting account:', error);
    res.status(500).json({ success: false, message: 'Failed to delete account' });
  }
};

const exportUserInfoAsPDF = async (req, res) => {
  try {
    const accessToken = req.cookies.access_token;
    const decodedToken = jwt.decode(accessToken);
    const userId = decodedToken.id;
    console.log('User ID:', userId);
    
    const volunteer = await Volunteer.findByPk(userId);
    if (!volunteer) {
      console.log('Volunteer not found');
      return res.status(404).json({ success: false, message: 'Volunteer not found' });
    }

    const doc = new PDFDocument();
    const buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="volunteer_info_${userId}.pdf"`);
      res.send(pdfData);
      console.log('PDF sent successfully');
    });

    doc.fontSize(20).text('Informations', { align: 'center' }).moveDown();
    doc.fontSize(12).text(`Role : Bénévole`);
    doc.fontSize(12).text(`Nom complet: ${volunteer.nom} ${volunteer.prenom}`);
    doc.fontSize(12).text(`Date de naissance: ${volunteer.date_de_naissance}`);
    doc.fontSize(12).text(`Genre: ${volunteer.genre}`);
    doc.fontSize(12).text(`Email: ${volunteer.email}`);
    doc.fontSize(12).text(`Numéro de téléphone: ${volunteer.telephone}`);
    // Add more information as needed

    doc.end();
  } catch (error) {
    console.error('Error exporting volunteer information:', error);
    res.status(500).json({ success: false, message: 'Failed to export volunteer information as PDF' });
  }
};
const updateDenreesWithQRCodeInfo = async (qrCodeInfo) => {
  try {
      const qrCodeData = qrCodeInfo.split(',');
      const arrivalEntrepot = qrCodeData.pop(); 

      for (const denreeID of qrCodeData) {
          await Denree.update({ ID_Stock: arrivalEntrepot }, {
              where: {
                  ID_Denree: parseInt(denreeID)
              }
          });

          const entrepot = await Entrepot.findOne({
              where: {
                  ville: arrivalEntrepot
              }
          });

          if (entrepot) {
              await Denree.update({ ID_Stock: entrepot.ID_Entrepot }, {
                  where: {
                      ID_Stock: arrivalEntrepot,
                      ID_Denree: parseInt(denreeID)
                  }
              });
          } else {
              console.log(`Arrival entrepot '${arrivalEntrepot}' not found.`);
          }
      }

      console.log('Denrees updated successfully.');
  } catch (error) {
      console.error('Error updating denrees:', error);
  }
};



const getActiviteForLoggedInUser = async (req, res) => {
  try {
      const accessToken = req.cookies.access_token;
      const decodedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
      const userId = decodedToken.id;

      const activites = await EvenementBenevole.findAll({ where: { id_benevole: userId } });
      res.status(200).json({ activites });
  } catch (error) {
      console.error('Erreur lors de la récupération des activités de l\'utilisateur connecté :', error);
      res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};

const getMaraudeForVolunteer = async (req, res) => {
  try {
    const accessToken = req.cookies.access_token;
    const decodedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    const userId = decodedToken.id;

    const maraudes = await Maraude.findAll({
      where: { ChauffeurID: userId },
      include: [
        {
          model: Volunteer,
          as: 'Chauffeur'
        },
        { model: Stocks, as: 'Stock'}
      ]
    });

    res.status(200).json({ maraudes });
  } catch (error) {
    console.error('Error fetching maraudes for the connected user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = { 
  updateDenreesWithQRCodeInfo,
  getMaraudeForVolunteer,
  getActiviteForLoggedInUser,
  getActivitePriveForLoggedInUser,
  displayAvailability,
  updateAvailability,
  deleteAvailability,
  createAvailability,
  deleteAccount,
  exportUserInfoAsPDF,
  getFormationsForVolunteer,
  deleteRegistrationFormation,
  checkRegistrationStatusFormation,
  addRegistrationFormation,
  getEventsAllForVolunteer,
  getEventsPvForVolunteer,
  getEventsForVolunteer,
  checkRegistrationStatus,
  deleteRegistration, 
  upload, 
  authMiddleware, 
  getUserInfo, 
  registerVolunteer, 
  loginVolunteer, 
  addRegistration,
  loginVolunteerapp,
  getUserInfoapp,
  getActivitePriveForLoggedInUser 
};
