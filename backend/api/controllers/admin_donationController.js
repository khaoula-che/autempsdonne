const Donation = require('../models/Donation');

const admin_donationController = {
  // Récupérer tous les dons
  getAllDonations: async (req, res) => {
    try {
      const donations = await Donation.findAll();
      res.status(200).json({ donations });
    } catch (error) {
      console.error('Erreur lors de la récupération des dons :', error);
      res.status(500).json({ error: 'Erreur lors de la récupération des dons' });
    }
  },

  // Récupérer un don par son ID
  getDonationById: async (req, res) => {
    const { id } = req.params;
    try {
      const donation = await Donation.findByPk(id);
      if (donation) {
        res.status(200).json({ donation });
      } else {
        res.status(404).json({ error: 'Don non trouvé' });
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du don :', error);
      res.status(500).json({ error: 'Erreur lors de la récupération du don' });
    }
  },

  // Mettre à jour le statut d'un don
  updateDonationStatus: async (req, res) => {
    const { id } = req.params;
    const { statut } = req.body;
    try {
      const donation = await Donation.findByPk(id);
      if (donation) {
        await donation.update({ statut });
        res.status(200).json({ donation });
      } else {
        res.status(404).json({ error: 'Don non trouvé' });
      }
    } catch (error) {
      console.error('Erreur lors de la mise à jour du statut du don :', error);
      res.status(500).json({ error: 'Erreur lors de la mise à jour du statut du don' });
    }
  }
};

module.exports = admin_donationController;
