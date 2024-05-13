const express = require('express');
const router = express.Router();
const UserDonationController = require('../controllers/userDonationController');
const AdminDonationController = require('../controllers/AdminDonationController');

// Middleware pour l'authentification de l'administrateur
const isAdminAuthenticated = require('../middlewares/isAdminAuthenticated');
// Récupérer tous les dons
router.get('/donations', isAdminAuthenticated, AdminDonationController.getAllDonations);
// Récupérer un don par son ID
router.get('/donations/:id', isAdminAuthenticated, AdminDonationController.getDonationById);
// Mettre à jour le statut d'un don
router.put('/donations/:id', isAdminAuthenticated, AdminDonationController.updateDonationStatus);


module.exports = router;
