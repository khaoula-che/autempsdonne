const Campagne = require('../models/Campagne');


// Créer une nouvelle campagne de don
exports.createCampaign = async (req, res) => {
    try {
        const { titre, description, montant_cible, montant_actuel, date_debut, date_fin, statut } = req.body;

        console.log(req.body); 

        // Vérifier les valeurs reçues
        if (!titre || !description || !montant_cible || !date_debut || !date_fin || !statut) {
            return res.status(400).json({ success: false, message: "Certains champs requis sont manquants." });
        }

        // Créer la campagne dans la base de données
        const campagne = await Campagne.create({
            titre,
            description,
            montant_cible,
            montant_actuel: montant_actuel || 0,
            date_debut,
            date_fin,
            statut
        });

        // Répondre avec la campagne créée
        res.status(201).json({ success: true, data: campagne });
    } catch (err) {
        console.error('Erreur lors de la création de la campagne :', err);
        res.status(500).json({ success: false, message: 'Erreur lors de la création de la campagne' });
    }
};// Obtenir toutes les campagnes de dons
exports.getAllCampaigns = async (req, res) => {
    try {
        // Récupérer toutes les campagnes de dons depuis la base de données
        const campagnes = await Campagne.findAll();

        // Répondre avec la liste des campagnes de dons
        res.status(200).json({ success: true, data: campagnes });
    } catch (err) {
        console.error('Erreur lors de la récupération des campagnes de dons :', err);
        res.status(500).json({ success: false, message: 'Erreur lors de la récupération des campagnes de dons' });
    }
};

// Obtenir une campagne de don par son identifiant
exports.getCampaignById = async (req, res) => {
    try {
        const campagneId = req.params.id;
        
        // Récupérer la campagne de don par son identifiant depuis la base de données
        const campagne = await Campagne.findByPk(campagneId);

        // Vérifier si la campagne existe
        if (!campagne) {
            return res.status(404).json({ success: false, message: 'Campagne de don non trouvée' });
        }

        // Répondre avec la campagne de don
        res.status(200).json({ success: true, data: campagne });
    } catch (err) {
        console.error('Erreur lors de la récupération de la campagne de don :', err);
        res.status(500).json({ success: false, message: 'Erreur lors de la récupération de la campagne de don' });
    }
};

// Mettre à jour une campagne de don
exports.updateCampaign = async (req, res) => {
    try {
        const campagneId = req.params.id;
        const { title, description, goal_amount } = req.body;
        
        // Vérifier si la campagne de don existe
        const campagne = await Campagne.findByPk(campagneId);
        if (!campagne) {
            return res.status(404).json({ success: false, message: 'Campagne de don non trouvée' });
        }

        // Mettre à jour la campagne de don dans la base de données
        campagne.title = title;
        campagne.description = description;
        campagne.goal_amount = goal_amount;
        await campagne.save();

        // Répondre avec la campagne de don mise à jour
        res.status(200).json({ success: true, data: campagne });
    } catch (err) {
        console.error('Erreur lors de la mise à jour de la campagne de don :', err);
        res.status(500).json({ success: false, message: 'Erreur lors de la mise à jour de la campagne de don' });
    }
};

// Supprimer une campagne de don
exports.deleteCampaign = async (req, res) => {
    try {
        const campagneId = req.params.id;
        
        // Supprimer la campagne de don de la base de données
        const deletedCampaign = await Campagne.destroy({ where: { ID_Campagne: campagneId } });

        // Vérifier si la campagne de don a été supprimée avec succès
        if (!deletedCampaign) {
            return res.status(404).json({ success: false, message: 'Campagne de don non trouvée' });
        }

        // Répondre avec un message de succès
        res.status(200).json({ success: true, message: 'Campagne de don supprimée avec succès' });
    } catch (err) {
        console.error('Erreur lors de la suppression de la campagne de don :', err);
        res.status(500).json({ success: false, message: 'Erreur lors de la suppression de la campagne de don' });
    }
};
