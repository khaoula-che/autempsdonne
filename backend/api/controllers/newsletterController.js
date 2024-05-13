const Newsletter = require('../models/Newsletter');

exports.getAllNewsletters = async (req, res) => {
  try {
    const newsletters = await Newsletter.findAll({
      order: [['id', 'DESC']]  
    });
    res.status(200).json(newsletters);
  } catch (error) {
    console.error('Erreur lors de la récupération des newsletters :', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des newsletters.' });
  }
};


exports.createNewsletter = async (req, res) => {
  const { email } = req.body;  
  
  try {
    const existingEmail = await Newsletter.findOne({ where: { email } });
    
    if (existingEmail) {
      return res.status(409).json({ message: 'Cet email est déjà inscrit à la newsletter.' });
    }

    const date_inscription = new Date();

    const newsletter = await Newsletter.create({ date_inscription, email });
    res.status(201).json(newsletter);
  } catch (error) {
    console.error('Erreur lors de la création de la newsletter :', error);
    res.status(500).json({ message: 'Erreur serveur lors de la création de la newsletter.' });
  }
};

exports.deleteNewsletter = async (req, res) => {
  const { email } = req.body; 

  if (!email) {
      return res.status(400).json({ message: 'Email is required for deletion.' });
  }

  try {
      const result = await Newsletter.findOne({ where: { email } });
      if (!result) {
          return res.status(404).json({ message: 'Newsletter with the given email not found.' });
      }

      await Newsletter.destroy({ where: { email } });
      res.status(200).json({ message: 'Newsletter deleted successfully.' });
  } catch (error) {
      console.error('Error during the deletion:', error);
      res.status(500).json({ message: 'Error during the deletion of the newsletter.' });
  }
};



