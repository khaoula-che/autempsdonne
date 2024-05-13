// controllers/uploadController.js
const handleFileUpload = (req, res) => {
    try {
      res.send('Fichier téléchargé avec succès');
    } catch (error) {
      console.log(error);
      res.sendStatus(400);
    }
  };
  
  module.exports = { handleFileUpload };
  