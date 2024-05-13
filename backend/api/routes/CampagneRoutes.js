const express = require('express');
const router = express.Router();
const campagneController = require('../controllers/campagneController');

// Route pour récupérer toutes les campagnes
router.get('/campagnes', campagneController.getAllCampaigns);

// Route pour créer une nouvelle campagne
router.post('/addCampagnes', campagneController.createCampaign);

// Route pour récupérer une campagne par son ID
router.get('/campagnes/:id', campagneController.getCampaignById);

// Route pour mettre à jour une campagne
router.put('/updateCampagnes/:id', campagneController.updateCampaign);

// Route pour supprimer une campagne
router.delete('/deleteCampagnes/:id', campagneController.deleteCampaign);

module.exports = router;
