const express = require('express');
const app = express();
const multer = require('multer');
const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');
const saltRounds = 10; 
app.use(express.json());
const Admin = require('../models/Admin');
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
const Notification = require( '../models/notifications' );
const jwt = require('jsonwebtoken');
const sequelize = require('../config/db'); 
const { Op } = require('sequelize'); 
require('dotenv').config();

const generateToken = (id, email) => {
  return jwt.sign({ id, email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
};
exports.authMiddleware = (req, res, next) => {
  const token = req.cookies.access_token;
  if (!token) {
      return res.status(401).json({ error: 'Non autorisé : Aucun token fourni' });
  }

  try {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      req.user = decoded;
      next();
  } catch (error) {
      return res.status(401).json({ error: 'Non autorisé : Token invalide' });
  }
};

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
  }
});
exports.createAdmin = async (req, res) => {
  try {
    const { email, mot_de_passe,nom, prenom  } = req.body; 
    const hashedPassword = await argon2.hash(mot_de_passe);

    const admin = await Admin.create({
      email,
      mot_de_passe: hashedPassword, 
      nom, 
      prenom
    });

    res.status(201).json({ message: "Admin créé avec succès", admin });
  } catch (error) {
    console.error("Erreur lors de la création de l'administrateur:", error);
    res.status(400).json({ message: "Erreur lors de la création de l'administrateur", error: error.message });
  }
};

async function sendWelcomeEmailAdmin(email, name, password) {
  const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: email,
      subject: 'Bienvenue dans l\'équipe de gestion !',
      text: `Bonjour ${name},\n\nNous sommes ravis de vous accueillir au sein de notre équipe en tant qu'administrateur. Votre expérience et vos compétences seront essentielles pour nous aider à atteindre nos objectifs.
      `,
      html: `<p>Bonjour <strong>${name}</strong>,</p><p>Vous trouverez ci-dessous vos informations de connexion et des détails supplémentaires pour accéder à notre système de gestion :</p><ul><li>Email : ${email}</li><li>Mot de passe : ${password}</li></ul><p>Nous vous recommandons de changer votre mot de passe lors de votre première connexion pour des raisons de sécurité.</p><p>Bienvenue dans la communauté !</p>`,
  };

  try {
      await transporter.sendMail(mailOptions);
      console.log('Email de bienvenue envoyé avec succès');
  } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email de bienvenue:', error);
  }
}

exports.addAdmin = async (req, res) => {
  try {
    const { email, nom, prenom } = req.body;

    const generatePassword = () => {
      const passwordLength = 12;
      return crypto.randomBytes(passwordLength).toString('hex').slice(0, passwordLength);
    };

    const password = generatePassword();

    const hashedPassword = await argon2.hash(password);

    const existingAdmin = await Admin.findOne({ where: { email } });
    if (existingAdmin) {
        return res.status(409).json({ message: "Un admin avec cet email existe déjà" });
    }

    const admin = await Admin.create({
      email,
      mot_de_passe: hashedPassword,
      nom,
      prenom
    });

    await sendWelcomeEmailAdmin(email, `${prenom} ${nom}`, password);

    res.status(201).json({ message: "Admin créé avec succès", admin });
  } catch (error) {
    console.error("Erreur lors de la création de l'administrateur:", error);
    res.status(400).json({ message: "Erreur lors de la création de l'administrateur", error: error.message });
  }
};
exports.getAdmin = async (req, res) => {
  try {
    const existingAdmin = await Admin.findOne({ where: { email: req.query.email } });
    if (existingAdmin) {
      res.json({ message: "Admin trouvé", admin: existingAdmin });
    } else {
      res.status(404).json({ message: "Aucun administrateur trouvé avec cet email" });
    }
  } catch (error) {
    res.status(400).json({ message: "Erreur lors de la recherche de l'administrateur", error: error.message });
  }
};

exports.getAllAdmins = async (req, res) => {
  try {
    const admins = await Admin.findAll();
    res.json(admins);
  } catch (error) {
    console.error("Erreur lors de la récupération de la liste des administrateurs :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

exports.deleteAdmin = async (req, res) => {
  try {
    const { email } = req.body;
    const admin = await Admin.findOne({ where: { email } });
    if (!admin) {
      return res.status(404).json({ message: "Admin introuvable" });
    }
    await Admin.destroy({ where: { email } });
    res.status(200).json({ message: "Admin supprimé avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'admin :", error);
    res.status(500).json({ message: "Erreur lors de la suppression de l'admin" });
  }
};


const SECRET_KEY = process.env.SECRET_KEY;
const argon2 = require('argon2');

exports.loginAdmin = async (req, res) => {
  try {
      const { email, password } = req.body;

      if (!email || !password) {
          return res.status(400).json({ error: 'Email and password are required' });
      }

      const admin = await Admin.findOne({ where: { email } });

      if (!admin) {
          return res.status(404).json({ error: 'User not found' });
      }

      const passwordMatch = await argon2.verify(admin.mot_de_passe, password);
      if (!passwordMatch) {
          return res.status(401).json({ error: 'Invalid password' });
      }


      const token = generateToken(admin.id,  admin.email);

      const userType = "admin"

      res.cookie('access_token', token, {
          httpOnly: true,
          maxAge: 3600000, // 1 hour
          sameSite: 'none',
          path: '/', // Set the cookie path to '/'
          secure: true // Add 'secure: true' if your app is served over HTTPS
      });

      res.status(200).json({ message: 'Login successful', token, userType }); 
  } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({ error: 'Internal Server Error' });
  }
};
exports.getUserInfo = async (req, res) => {
  try {
      const token = req.cookies.access_token;

      if (!token) {
          return res.status(401).json({ error: 'Aucun token trouvé' });
      }

      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      if (!decoded) {
          return res.status(401).json({ error: 'Token invalide' });
      }

    const admin = await Admin.findByPk(decoded.id);
      if (!admin) {
          return res.status(404).json({ error: 'Utilisateur non trouvé' });
      }

      res.status(200).json({ admin });
  } catch (error) {
      console.error('Erreur lors de l\'obtention des informations utilisateur :', error);
      res.status(500).json({ error: 'Erreur interne du serveur' });
  }
};
exports.addVolunteer = async (req, res) => {
  try {
      const { nom, prenom, email } = req.body;
      
      const generatePassword = () => {
        return Array.from(crypto.randomFillSync(new Uint8Array(6))).map((item) => {
            return Math.floor(item / 25.6); 
        }).join('');
    };
    const mot_de_passe = generatePassword();

      const existingVolunteer = await Volunteer.findOne({ where: { email } });
      if (existingVolunteer) {
          return res.status(409).json({ message: "Un bénévole avec cet email existe déjà" });
      }
      
      // Créer un nouveau bénévole
      const newVolunteer = await Volunteer.create({
          nom,
          prenom,
          email,
          mot_de_passe,
          statut_validation: "Accepté"

      });
      
      res.status(201).json({
          message: "Bénévole ajouté avec succès",
          volunteer: newVolunteer
      });
  } catch (error) {
      console.error("Erreur lors de l'ajout du bénévole :", error);
      res.status(500).json({ message: "Erreur lors de l'ajout du bénévole", error: error.message });
  }
};
async function sendWelcomeEmail(email, name, password) {
  const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: email,
      subject: 'Bienvenue dans notre communauté de bénéficiaires !',
      text: `Bonjour ${name},\n\nNous sommes heureux de vous accueillir comme bénéficiaire. Votre engagement est précieux pour nous. Voici vos informations de connexion :\n\nEmail : ${email}\nMot de passe : ${password}\n\nNous vous recommandons de changer votre mot de passe lors de votre première connexion pour des raisons de sécurité.\n\nBienvenue dans la communauté !`,
      html: `<p>Bonjour <strong>${name}</strong>,</p><p>Nous sommes heureux de vous accueillir comme bénéficiaire. Votre engagement est précieux pour nous. Voici vos informations de connexion :</p><ul><li>Email : ${email}</li><li>Mot de passe : ${password}</li></ul><p>Nous vous recommandons de changer votre mot de passe lors de votre première connexion pour des raisons de sécurité.</p><p>Bienvenue dans la communauté !</p>`,
  };

  try {
      await transporter.sendMail(mailOptions);
      console.log('Email de bienvenue envoyé avec succès');
  } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email de bienvenue:', error);
  }
}
async function sendWelcomeEmailPartenaire(email, name, organization) {
  const mailOptions = {
      from: process.env.EMAIL_USERNAME,
      to: email,
      subject: 'Bienvenue dans notre communauté de partenaires !',
      text: `Bonjour ${name},\n\nNous vous souhaitons la bienvenue en tant que partenaire de notre communauté. Votre soutien est essentiel pour notre mission. Voici vos informations de connexion :\n\nEmail : ${email}\nOrganisation : ${organization}\n\nNous sommes impatients de collaborer avec vous pour atteindre nos objectifs communs.\n\nBienvenue dans notre communauté de partenaires !`,
      html: `<p>Bonjour <strong>${name}</strong>,</p><p>Nous vous souhaitons la bienvenue en tant que partenaire de notre communauté. Votre soutien est essentiel pour notre mission. Voici vos informations de connexion :</p><ul><li>Email : ${email}</li><li>Organisation : ${organization}</li></ul><p>Nous sommes impatients de collaborer avec vous pour atteindre nos objectifs communs.</p><p>Bienvenue dans notre communauté de partenaires !</p>`,
  };

  try {
      await transporter.sendMail(mailOptions);
      console.log('Email de bienvenue pour le partenaire envoyé avec succès');
  } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email de bienvenue pour le partenaire:', error);
  }
}

exports.addBeneficiary = async (req, res) => {
  try {
      const { nom, prenom, email } = req.body;

      const generatePassword = () => {
          return Array.from(crypto.randomFillSync(new Uint8Array(6))).map((item) => {
              return Math.floor(item / 25.6); 
          }).join('');
      };
      const mot_de_passe = generatePassword();

      const existingBeneficiaire = await Beneficiary.findOne({ where: { email } });
      if (existingBeneficiaire) {
          return res.status(409).json({ message: "Un Beneficiary avec cet email existe déjà" });
      }
      
      const newBeneficiary = await Beneficiary.create({
          nom,
          prenom,
          email,
          mot_de_passe,
          statut_validation: "Accepté"
      });

      // Send the welcome email with password
      await sendWelcomeEmail(email, `${prenom} ${nom}`, mot_de_passe);

      res.status(201).json({
          message: "Beneficiary ajouté avec succès",
          beneficiaire: newBeneficiary
      });
  } catch (error) {
      console.error("Erreur lors de l'ajout du Beneficiary :", error);
      res.status(500).json({ message: "Erreur lors de l'ajout du Beneficiary", error: error.message });
  }
};


exports.deleteVolunteer = async (req, res) => {
  const { email } = req.body; 
  const t = await sequelize.transaction();

  try {
      const benevole = await Volunteer.findOne({
          where: { email },
          transaction: t
      });
      
      if (!benevole) {
          await t.rollback();
          return res.status(404).json({ message: 'Benevole non trouvé.' });
      }

      await ActivityPrive.destroy({
          where: { id_benevole: benevole.id },
          transaction: t
      });

      await Volunteer.destroy({
          where: { id: benevole.id },
          transaction: t
      });

      await t.commit();
      res.status(200).json({ message: 'Benevole et ses activités privées supprimés avec succès.' });
  } catch (error) {
      await t.rollback();
      console.error('Erreur lors de la suppression du benevole et de ses activités privées:', error);
      res.status(500).json({ message: 'Erreur lors de la suppression du benevole et de ses activités privées', error: error.message });
  }
};

exports.deleteBeneficiary = async (req, res) => {
  const { email } = req.body; 
  const t = await sequelize.transaction();

  try {
      const beneficiaire = await Beneficiary.findOne({
          where: { email },
          transaction: t
      });
      
      if (!beneficiaire) {
          await t.rollback();
          return res.status(404).json({ message: 'Bénéficiaire non trouvé.' });
      }

      await ActivityPrive.destroy({
          where: { id_beneficiaire: beneficiaire.id },
          transaction: t
      });

      await Beneficiary.destroy({
          where: { id: beneficiaire.id },
          transaction: t
      });

      await t.commit();
      res.status(200).json({ message: 'Bénéficiaire et ses activités privées supprimés avec succès.' });
  } catch (error) {
      await t.rollback();
      console.error('Erreur lors de la suppression du bénéficiaire et de ses activités privées:', error);
      res.status(500).json({ message: 'Erreur lors de la suppression du bénéficiaire et de ses activités privées', error: error.message });
  }
};

exports.getAllVolunteers = async (req, res) => {
  try {
    const volunteers = await Volunteer.findAll({
      order: [['id', 'DESC']]  
    });
   

    res.json(volunteers);
  } catch (error) {
    console.error("Erreur lors de la récupération de la liste des bénévoles :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

exports.getAllNonAdminVolunteers = async (req, res) => {
  try {
    const admins = await Admin.findAll({
      attributes: ['email']
    });

    const adminEmails = admins.map(admin => admin.email);

    // Récupérer les bénévoles qui ne sont pas des administrateurs
    const nonAdminVolunteers = await Volunteer.findAll({
      where: {
        email: {
          [Op.notIn]: adminEmails
        }
      },
      order: [['id', 'DESC']]
    });

    res.json(nonAdminVolunteers);
  } catch (error) {
    console.error("Erreur lors de la récupération des bénévoles non administrateurs :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};
exports.getAllVolunteersAdmin = async (req, res) => {
  try {
    const volunteers = await Volunteer.findAll({
      where: {
        email: {
          [Op.notIn]: sequelize.literal(`
            SELECT email FROM Admin`)
        }
      },
    });

    res.json(volunteers);
  } catch (error) {
    console.error("Erreur lors de la récupération de la liste des bénévoles :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};
exports.getAllBeneficiaires = async (req, res) => {
  try {
    const beneficiary = await Beneficiary.findAll(
      {
        order: [['id', 'DESC']]  

      }
    );
    res.json(beneficiary);
  } catch (error) {
    console.error("Erreur lors de la récupération de la liste des beneficiaire :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};
exports.getVolunteer = async (req, res) => {
  try {
    const { email } = req.params;
    const volunteer = await Volunteer.findOne({ where: { email } });

    if (volunteer) {
      return res.json(volunteer);
    } else {
      return res.status(404).json({ message: "Aucun bénévole trouvé avec ce nom et ce prénom." });
    }
  } catch (error) {
    console.error("Erreur lors de la récupération du bénévole :", error);
    return res.status(500).json({ message: "Erreur serveur." });
  }
};
exports.getBeneficiary = async (req, res) => {
  try {
    const { email } = req.params;
    const beneficiaire = await Beneficiary.findOne({ where: { email } });

    if (beneficiaire) {
      return res.json(beneficiaire);
    } else {
      return res.status(404).json({ message: "Aucun bénévole trouvé avec ce nom et ce prénom." });
    }
  } catch (error) {
    console.error("Erreur lors de la récupération du bénévole :", error);
    return res.status(500).json({ message: "Erreur serveur." });
  }
};

exports.getLatestVolunteers = async (req, res) => {
  try {
    const latestVolunteers = await Volunteer.findAll({
      order: [['date_adhesion', 'DESC']],
      limit: 3
    });
    res.json(latestVolunteers);
  } catch (error) {
    console.error("Erreur lors de la récupération des derniers bénévoles :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};
exports.getAllLatestVolunteersAndBeneficiaries = async (req, res) => {
  try {
    const allLatestVolunteers = await Volunteer.findAll({
      order: [['id', 'DESC']],
      limit: 3
    }).then(volunteers => volunteers.map(v => ({ ...v.toJSON(), type: 'Bénévole' }))); 

    const allLatestBeneficiaries = await Beneficiary.findAll({
      order: [['id', 'DESC']],
      limit: 3
    }).then(beneficiaries => beneficiaries.map(b => ({ ...b.toJSON(), type: 'Bénéficiaire' }))); 

    const combinedList = [...allLatestVolunteers, ...allLatestBeneficiaries];

    combinedList.sort((a, b) => {
      let dateA = new Date(a.date_adhesion || a.date_inscription); 
      let dateB = new Date(b.date_adhesion || b.date_inscription);
      return dateB - dateA; 
    });

    res.json(combinedList);
  } catch (error) {
    console.error("Erreur lors de la récupération des derniers bénévoles et bénéficiaires :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

exports.getAllVolunteersAndBeneficiaries = async (req, res) => {
  try {
    const allLatestVolunteers = await Volunteer.findAll({
      order: [['id', 'DESC']],
    }).then(volunteers => volunteers.map(v => ({ ...v.toJSON(), type: 'Benevole' }))); // Convertir en JSON et ajouter le type

    const allLatestBeneficiaries = await Beneficiary.findAll({
      order: [['id', 'DESC']],
    }).then(beneficiaries => beneficiaries.map(b => ({ ...b.toJSON(), type: 'Beneficiaire' }))); 

    const combinedList = [...allLatestVolunteers, ...allLatestBeneficiaries];

    combinedList.sort((a, b) => {
      let dateA = new Date(a.date_adhesion || a.date_inscription); 
      let dateB = new Date(b.date_adhesion || b.date_inscription);
      return dateB - dateA; 
    });

    res.json(combinedList);
  } catch (error) {
    console.error("Erreur lors de la récupération des derniers bénévoles et bénéficiaires :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

exports.addVolunteerToAdmins = async (req, res) => {
  const t = await sequelize.transaction(); // Démarrez une transaction Sequelize

  try {
    const { email } = req.body;

    // Recherchez le bénévole par email
    const volunteer = await Volunteer.findOne({ where: { email } }, { transaction: t });
    if (!volunteer) {
      await t.rollback(); // Annulez la transaction
      return res.status(404).json({ message: "Bénévole introuvable" });
    }

    // Vérifiez si le bénévole est déjà un administrateur
    const existingAdmin = await Admin.findOne({ where: { email } }, { transaction: t });
    if (existingAdmin) {
      await t.rollback(); // Annulez la transaction
      return res.status(400).json({ message: "Le bénévole est déjà un administrateur" });
    }

    // Créez un nouvel administrateur en copiant les informations du bénévole
    await Admin.create({
      email: volunteer.email,
      nom: volunteer.nom,
      prenom: volunteer.prenom,
      mot_de_passe: volunteer.mot_de_passe // Copiez d'autres champs si nécessaire
    }, { transaction: t });

    await t.commit(); // Validez la transaction
    res.status(200).json({ message: "Le bénévole a été ajouté à la liste des administrateurs avec succès" });
  } catch (error) {
    await t.rollback(); // Annulez la transaction en cas d'erreur
    console.error("Erreur lors de l'ajout du bénévole à la liste des administrateurs :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

exports.updateVolunteerStatus = async (req, res) => {
  try {
    const { email, newStatus } = req.body;
    const volunteer = await Volunteer.findOne({ where: { email } });

    if (!volunteer) {
      return res.status(404).json({ message: "Bénévole introuvable" });
    }

    volunteer.statut_validation = newStatus;
    volunteer.date_adhesion = new Date();

    await volunteer.save();

    let emailSubject, emailText;

    if (newStatus === 'accepté') {
      emailSubject = 'Confirmation d\'acceptation comme bénévole';
      emailText = `Bonjour ${volunteer.prenom} ${volunteer.nom},\n\nNous avons le plaisir de vous informer que votre candidature comme bénévole a été acceptée. Bienvenue dans notre équipe !`;
    } else if (newStatus === 'refusé') {
      emailSubject = 'Notification de refus de candidature';
      emailText = `Bonjour ${volunteer.prenom} ${volunteer.nom},\n\nNous regrettons de vous informer que votre candidature comme bénévole a été refusée. Merci pour votre intérêt et votre compréhension.`;
    }

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
      subject: emailSubject,
      text: emailText,
    };

    await transporter.sendMail(mailOptions);
    console.log('E-mail envoyé avec succès au bénévole');

    res.status(200).json({ message: "Statut du bénévole mis à jour avec succès" });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut du bénévole :", error);
    res.status(500).json({ message: "Erreur serveur." });
  }
};

exports.updateBeneficiaryStatus = async (req, res) => {
  try {
    const { email, newStatus } = req.body;
    const beneficiary = await Beneficiary.findOne({ where: { email } });

    if (!beneficiary) {
      return res.status(404).json({ message: "Bénéficiaire introuvable" });
    }

    beneficiary.statut_validation = newStatus;
    beneficiary.date_adhesion = new Date();

    await beneficiary.save();

    let emailSubject, emailText;

    if (newStatus === 'accepté') {
      emailSubject = 'Suivi de candidature';
      emailText = `Bonjour ${beneficiary.nom},\n\nFélicitations ! Votre candidature en tant que bénéficiaire a été acceptée. Vous pouvez désormais accéder à notre plateforme et bénéficier de nos services.\n\nNous sommes impatients de vous accompagner dans votre parcours avec nous !`;
    } else if (newStatus === 'refusé') {
      emailSubject = 'Suivi de candidature';
      emailText = `Bonjour ${beneficiary.nom},\n\nNous regrettons de vous informer que votre candidature en tant que bénéficiaire a été refusée.\n\n Merci pour votre intérêt et votre compréhension.`;
    }

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
      subject: emailSubject,
      text: emailText,
    };

    // Envoyer l'e-mail
    await transporter.sendMail(mailOptions);
    console.log('E-mail envoyé avec succès au bénéficiaire');

    res.status(200).json({ message: "Statut du bénéficiaire mis à jour avec succès" });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du statut du bénéficiaire :", error);
    res.status(500).json({ message: "Erreur serveur." });
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
exports.createBlog = async (req, res) => {
  const { titre, contenu, emailAdmin } = req.body;

  try {
      const admin = await Admin.findOne({ where: { email: emailAdmin } });
      if (!admin) {
          return res.status(404).json({ message: "Administrateur non trouvé." });
      }

      const newBlog = await Blog.create({
          titre,
          contenu,
          auteur: admin.id,
          date_creation: new Date()
      });

      res.status(201).json(newBlog);
  } catch (error) {
      console.error("Erreur lors de la création du blog :", error);
      res.status(500).json({ message: "Erreur serveur lors de la création du blog." });
  }
};

exports.getAllBlogs = async (req, res) => {
  try {
      const blogs = await Blog.findAll({
          attributes: ['id', 'titre', 'contenu', 'auteur', 'date_creation'],
          order: [
              ['date_creation', 'DESC'] 
          ]
      });

      if (blogs.length === 0) {
          return res.status(404).json({ message: "Aucun blog trouvé." });
      }

      res.status(200).json(blogs);
  } catch (error) {
      console.error("Erreur lors de la récupération des blogs :", error);
      res.status(500).json({ message: "Erreur serveur lors de la récupération des blogs." });
  }
};

exports.addPartenaire = async (req, res) => {
  const { nom, email,telephone, adresseComplete, ville, code_postal } = req.body;

  try {
    const generatePassword = () => {
    
    const passwordLength = 12;
      return crypto.randomBytes(passwordLength).toString('hex').slice(0, passwordLength);
    };

      const password = generatePassword();

      const hashedPassword = await argon2.hash(password);

      const existingPartner = await Partenaire.findOne({ where: { email } });
      if (existingPartner) {
          return res.status(409).json({ message: "il existe déjà" });
      }
  
      const partenaire = await Partenaire.create({
          nom,
          email,
          telephone,
          password: hashedPassword,
          adresse: adresseComplete,
          ville,
          code_postal
      });

      await sendWelcomeEmailPartenaire(email, nom, password);

      res.status(201).json({ message: "partenaire créé avec succès", partenaire });
    } catch (error) {
      console.error('Erreur lors de l\'ajout du partenaire : ', error);
      res.status(500).send('Erreur lors de l\'ajout du partenaire : ' + error.message);
  }
};
exports.deletePartenaire = async (req, res) => {
  const { email } = req.body; 
  const t = await sequelize.transaction();

  try {
    const partenaire = await Partenaire.findOne({ where: { email }, transaction: t });

    if (!partenaire) {
      await t.rollback();
      return res.status(404).json({ message: 'Partenaire non trouvé.' }); 
    }
    await Partenaire.destroy({ where: { email }, transaction: t });

    await t.commit();
    res.status(200).json({ message: 'Partenaire supprimé avec succès.' }); 
  } catch (error) {
    await t.rollback();
    console.error('Erreur lors de la suppression du partenaire:', error);
    res.status(500).json({ message: 'Erreur lors de la suppression du partenaire', error: error.message }); 
  }
};

exports.getAllPartenaires = async (req, res) => {
  try {
    const partenaires = await Partenaire.findAll({
      order: [['ID_Commercant', 'DESC']]  
    });

    if (!partenaires.length) {
      return res.status(404).json({ message: 'Aucun partenaire trouvé.' }); 
    }

    res.status(200).json(partenaires); 
  } catch (error) {
    console.error('Erreur lors de la récupération des partenaires:', error);
    res.status(500).json({ message: 'Erreur lors de la récupération des partenaires', error: error.message });
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
const Denree = require('../models/Denree');

exports.getVolunteersDisponibles = async (req, res) => {
  try {
      const { date, startTime } = req.query;  

      if (!date || !startTime ) {
          return res.status(400).send("All parameters are required.");
      }

      const jourDate = new Date(date + 'T00:00:00Z'); 

      const startDate = new Date(`${date}T${startTime}:00Z`); 

      const availableVolunteers = await Disponibilite.findAll({
          where: {
              jour: jourDate,
              heure_debut: {
                  [Op.lte]: startDate 
              }
              
          },
          include: [{
              model: Volunteer,
              as: 'benevole',
              attributes: ['nom', 'prenom', 'email', 'telephone'],
              where: { permis_conduire: "oui" } 
          }]
      });

      if (availableVolunteers.length === 0) {
          return res.status(404).send('No available volunteers found.');
      }

      res.json(availableVolunteers.map(vol => vol.benevole)); 
  } catch (error) {
      console.error('Error retrieving available volunteers:', error);
      res.status(500).send('Internal Server Error');
  }
};
exports.getLieuByPartner = async (req, res) => {
  try {
    const partnerId = req.params.partnerId; 
    const partner = await Partenaire.findByPk(partnerId);

    if (!partner) {
      return res.status(404).json({ error: 'Partenaire non trouvé' });
    }
    const lieu = await Lieu.findByPk(partner.ID_Adresse);

    if (!lieu) {
      return res.status(404).json({ error: 'Lieu non trouvé' });
    }
    res.status(200).json(lieu);
  } catch (error) {
    console.error('Erreur lors de la récupération du lieu:', error);
    res.status(500).json({ error: 'Erreur serveur lors de la récupération du lieu' });
  }
};

Partenaire.hasMany(Denree, { foreignKey: 'id_commercant' });
Denree.belongsTo(Partenaire, { foreignKey: 'id_commercant' });


exports.getAllEntrepots = async (req, res) => {
  try {
    const allEntrepots = await Entrepot.findAll();
    res.status(200).json({data: allEntrepots});
  } catch (error) {
    console.error("Error during execution : ", error);
    res.status(500).json({ error: "Internal server error" });
  }
}

exports.getPartnersWithGoods = async (req, res) => {
  try {
    const partners = await Partenaire.findAll({
      include: [{
        model: Denree,
        where: {
          id_maraude: null,
          id_stock: null
        },
        required: false 
      }]
    });
    const formattedPartners = partners.map(partner => {
      return {
        nom: partner.nom,
        id: partner.ID_Commercant,
        goods: partner.denrees.map(denree => ({
          ID_Denree: denree.ID_Denree,
          type: denree.type,
          date_peremption: denree.date_peremption,
          quantite: denree.quantite,
          ID_Stock: denree.ID_Stock,
          nom: denree.nom,
          id_commercant: denree.id_commercant,
          id_maraude: denree.id_maraude,
          Date_ajout: denree.Date_ajout
        }))
      };
    });
    res.status(200).json(formattedPartners);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching partners with goods' });
  }
};