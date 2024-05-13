const Problem = require('../models/Probleme');
const jwt = require('jsonwebtoken');

const createProblem = async (req, res) => {
  try {
    const accessToken = req.cookies.access_token;
    const decodedToken = jwt.decode(accessToken);
    const userId = decodedToken.id;
    const { description, type } = req.body;

    const problem = await Problem.create({
      description,
      type,
      created_by: userId
    });

    res.status(201).json({ message: 'Problem created successfully', problem });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

module.exports = {
  createProblem
};
