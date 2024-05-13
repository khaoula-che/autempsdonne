const Denree = require('../models/Denree');
const Partenaire = require("../models/Partenaire");

// Controller functions for denrees

exports.getAllDenrees = async (req, res) => {
  try {
    const denrees = await Denree.findAll({
      include: [{ model: Partenaire, as: 'commercant'}]
    });

    res.json(denrees);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.createDenree = async (req, res) => {
    try {
      const newDenree = await Denree.create(req.body);
      res.status(201).json(newDenree);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server Error' });
    }
};

exports.getDenreeById = async (req, res) => {
  const { id } = req.params;
  try {
    const denree = await Denree.findByPk(id);
    if (!denree) {
      return res.status(404).json({ message: 'Denree not found' });
    }
    res.json(denree);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.updateDenree = async (req, res) => {
  const { id } = req.params;
  try {
    const [updatedRows] = await Denree.update(req.body, {
      where: { ID_Denree: id }
    });
    if (updatedRows === 0) {
      return res.status(404).json({ message: 'Denree not found' });
    }
    res.json({ message: 'Denree updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};

exports.deleteDenree = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedRows = await Denree.destroy({
      where: { ID_Denree: id }
    });
    if (deletedRows === 0) {
      return res.status(404).json({ message: 'Denree not found' });
    }
    res.json({ message: 'Denree deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
};
