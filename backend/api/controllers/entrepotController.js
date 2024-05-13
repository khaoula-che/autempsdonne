const multer = require('multer');
const Admin = require('../models/Admin');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const AWS = require('aws-sdk');

const { Op } = require('sequelize'); 
const argon2 = require('argon2');
const Entrepot = require('../models/Entrepot'); 
const Denree = require('../models/Denree');
const Maraude = require('../models/Maraude');
const Volunteer = require('../models/Volunteer');
const Disponibilite = require('../models/Disponibilite');

const Stocks = require('../models/Stocks');

require('dotenv').config(); 
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


const createEntrepot = async (req, res) => {
    const { nom, adresse, ville, code_postal, capacite } = req.body;
    try {
        const entrepot = await Entrepot.create({
            nom,
            adresse,
            ville,
            code_postal,
            capacite
        });
        res.status(201).json(entrepot);
    } catch (error) {
        console.error('Erreur lors de la création de l\'entrepôt:', error);
        res.status(500).json({ message: 'Erreur lors de la création de l\'entrepôt.' });
    }
};
const getAllEntrepots = async (req, res) => {
    try {
        const entrepots = await Entrepot.findAll();
        res.status(200).json(entrepots);
    } catch (error) {
        console.error('Erreur lors de la récupération des entrepôts:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des entrepôts.' });
    }
};

const updateEntrepot = async (req, res) => {
    const { id } = req.params;
    const { nom, adresse, ville, code_postal, capacite } = req.body;
    try {
        const entrepot = await Entrepot.findByPk(id);
        if (!entrepot) {
            return res.status(404).json({ message: 'Entrepôt non trouvé.' });
        }
        entrepot.nom = nom;
        entrepot.adresse = adresse;
        entrepot.ville = ville;
        entrepot.code_postal = code_postal;
        entrepot.capacite = capacite;
        await entrepot.save();
        res.status(200).json(entrepot);
    } catch (error) {
        console.error('Erreur lors de la mise à jour de l\'entrepôt:', error);
        res.status(500).json({ message: 'Erreur lors de la mise à jour de l\'entrepôt.' });
    }
};

const deleteEntrepot = async (req, res) => {
    const { id } = req.params;
    try {
        const entrepot = await Entrepot.findByPk(id);
        if (!entrepot) {
            return res.status(404).json({ message: 'Entrepôt non trouvé.' });
        }
        await entrepot.destroy();
        res.status(204).end();
    } catch (error) {
        console.error('Erreur lors de la suppression de l\'entrepôt:', error);
        res.status(500).json({ message: 'Erreur lors de la suppression de l\'entrepôt.' });
    }
};

const Stock = require('../models/Stocks');



const getAllStockedDenrees = async (req, res) => {
    try {
        const entrepots = await Stock.findAll({
            include: [
                { 
                    model: Entrepot, 
                    as: 'entrepot'                },
                { 
                    model: Denree, 
                    as: 'denree'
                }
            ]
        });
        res.status(200).json(entrepots);
    } catch (error) {
        console.error('Erreur lors de la récupération des entrepôts:', error);
        res.status(500).json({ message: 'Erreur lors de la récupération des entrepôts.' });
    }
};
const deleteStock = async (req, res) => {
    const { id } = req.params;
    try {
        const numDestroyed = await Stock.destroy({
            where: { ID_Stock: id }
        });
        if (numDestroyed) {
            return res.status(200).json({ message: 'Stock deleted successfully' });
        } else {
            return res.status(404).json({ message: 'Stock not found' });
        }
    } catch (error) {
        console.error('Error deleting stock:', error);
        return res.status(500).json({ message: 'Error deleting stock', error: error.message });
    }
};
const updateStock = async (req, res) => {
    const { id } = req.params;
    const { date_collecte, ID_Entrepot, ID_Denree } = req.body;

    try {
        const stock = await Stock.findByPk(id);
        if (stock) {
            stock.date_collecte = date_collecte;
            stock.ID_Entrepot = ID_Entrepot;
            stock.ID_Denree = ID_Denree;
            await stock.save();
            return res.status(200).json({ message: 'Stock updated successfully', stock });
        } else {
            return res.status(404).json({ message: 'Stock not found' });
        }
    } catch (error) {
        console.error('Error updating stock:', error);
        return res.status(500).json({ message: 'Error updating stock', error: error.message });
    }
};



const addMaraude = async (req, res) => {
    const { nom, lieuDepart, lieuArrivee, dateDebut, description, chauffeurID, stockID } = req.body;
    
    try {
        // Check if the referenced Stock and Chauffeur exist
        const stock = await Stock.findByPk(stockID);
        const chauffeur = await Volunteer.findByPk(chauffeurID);

        if (!stock || !chauffeur) {
            return res.status(404).json({
                message: "Stock or Chauffeur not found"
            });
        }

        // Create the new Maraude
        const newMaraude = await Maraude.create({
            Nom: nom,
            LieuDepart: lieuDepart,
            LieuArrivee: lieuArrivee,
            DateDebut: dateDebut,
            Description: description,
            ChauffeurID: chauffeurID,
            StockID: stockID
        });

        return res.status(201).json({
            message: "Maraude successfully created",
            maraude: newMaraude
        });
    } catch (error) {
        console.error("Error creating maraude: ", error);
        return res.status(500).json({
            message: "Failed to create maraude",
            error: error.message
        });
    }
};

const getVolunteersDisponibles = async (req, res) => {
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
                attributes: ['id','nom', 'prenom', 'email', 'telephone'],
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
const axios = require('axios');


const generateItinerary = async (req, res) => {
    try {
        const { addresses } = req.body;
        const apiKey = 'AIzaSyB3KofdS-3nitMbrTB0JVftrZXYU5WYxt4';

        const resolveAddress = async (address) => {
            try {
                const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
                    params: {
                        address: address,
                        key: apiKey
                    }
                });

                if (response.data.results && response.data.results.length > 0) {
                    const location = response.data.results[0].geometry.location;
                    const coordinates = `${location.lat},${location.lng}`;
                    console.log(`Resolved address "${address}" to coordinates: ${coordinates}`);
                    return { address, coordinates };
                } else {
                    throw new Error('Address not found');
                }
            } catch (error) {
                console.error(`Error resolving address "${address}":`, error);
                throw new Error(`Failed to resolve address "${address}"`);
            }
        };

        const resolvedPoints = await Promise.all(addresses.map(resolveAddress));

        const waypoints = resolvedPoints.map(point => `via:${point.coordinates}`).join('|');
        const routeRequestURL = `https://maps.googleapis.com/maps/api/directions/json?origin=${resolvedPoints[0].coordinates}&destination=${resolvedPoints[resolvedPoints.length - 1].coordinates}&waypoints=${waypoints}&key=${apiKey}`;

        const routeResponse = await axios.get(routeRequestURL);

        
        const estimatedCarTimeInSeconds = routeResponse.data.routes[0].legs.reduce((total, leg) => total + leg.duration.value, 0);

        const hours = Math.floor(estimatedCarTimeInSeconds / 3600);
        const minutes = Math.ceil((estimatedCarTimeInSeconds % 3600) / 60);

        const route = routeResponse.data.routes[0];

        const routeCoordinates = route.legs.flatMap(leg => leg.steps.map(step => [step.start_location.lat, step.start_location.lng]));

        const startAddress = resolvedPoints[0].address;
        const destinationAddress = resolvedPoints[resolvedPoints.length - 1].address;

        console.log(`Estimated car time: ${hours} hours and ${minutes} minutes`);

        // Prepare response
        const itineraryData = {
            routeCoordinates,
            startAddress,
            destinationAddress,
            estimatedCarTime: { hours, minutes } 
        };

        res.json(itineraryData);
    } catch (error) {
        console.error('Error generating itinerary:', error);
        res.status(500).json({ error: 'Failed to generate itinerary' });
    }
};
const getMaraude = async (req, res) => {
    try {
  
      const maraudes = await Maraude.findAll({
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


const fs = require('fs');
const qrcode = require('qrcode');
const Route = require('../models/Route');
const CircuitRamassage = require('../models/CircuitRamassage'); 
const CommercantCircuit = require('../models/CommercantCircuit');
const addCollecte = async (req, res) => {
    try {
        const { date_collecte, LieuDepart, LieuArrivee, id_chauffeur,id_denree } = req.body;

        // Create a new collecte record
        const newCollecte = await CircuitRamassage.create({
            date_collecte,
            LieuDepart,
            LieuArrivee,
            id_chauffeur,
            id_denree

        });

        res.status(201).json({
            message: 'Collecte successfully created!',
            collecte: newCollecte
        });
    } catch (error) {
        console.error('Failed to add collecte:', error);
        res.status(500).json({
            message: 'Failed to add collecte',
            error: error.message
        });
    }
};
const generateItineraryCollecte = async (req, res) => {
    try {
        const { addresses} = req.body;
        const apiKey = 'AIzaSyB3KofdS-3nitMbrTB0JVftrZXYU5WYxt4';

                const resolveAddress = async (address) => {
                    try {
                        const response = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
                            params: {
                                address: address,
                                key: apiKey
                            }
                        });
        
                        if (response.data.results && response.data.results.length > 0) {
                            const location = response.data.results[0].geometry.location;
                            const coordinates = `${location.lat},${location.lng}`;
                            console.log(`Resolved address "${address}" to coordinates: ${coordinates}`);
                            return { address, coordinates };
                        } else {
                            throw new Error('Address not found');
                        }
                    } catch (error) {
                        console.error(`Error resolving address "${address}":`, error);
                        throw new Error(`Failed to resolve address "${address}"`);
                    }
                };
        
                const resolvedPoints = await Promise.all(addresses.map(resolveAddress));
        
                const waypoints = resolvedPoints.map(point => `via:${point.coordinates}`).join('|');
                const routeRequestURL = `https://maps.googleapis.com/maps/api/directions/json?origin=${resolvedPoints[0].coordinates}&destination=${resolvedPoints[resolvedPoints.length - 1].coordinates}&waypoints=${waypoints}&key=${apiKey}`;
        
                const routeResponse = await axios.get(routeRequestURL);
        
                const route = routeResponse.data.routes[0];
        
                const startAddress = resolvedPoints[0].address;
                const destinationAddress = resolvedPoints[resolvedPoints.length - 1].address;
        
                const routeCoordinates = decodePolyline(route.overview_polyline.points);
                
               
                let allGoodsData = '';
                for (const partner of selectedPartners) {
                    if (partner.ID_Commercant !== null) {
                        await CommercantCircuit.create({
                            ID_Commercant: partner.id,
                            id_collecte: CircuitRamassage.id_collecte 
                        });
                    } else {
                        console.log('ID_Commercant is null for partner:', partner);
                    }

                    console.log(`Goods for partner ${partner.id}:`);
                    partner.goods.forEach(good => {
                        console.log(good.ID_Denree);
                        allGoodsData += good.ID_Denree + ',';
                    });
                }
                
        const arrivalEntrepot = addresses[addresses.length - 1];
        allGoodsData += `${arrivalEntrepot},`;

        allGoodsData = allGoodsData.slice(0, -1);

        const qrCodePath = `./qrcodes/all_goods_qrcode.png`;
        await qrcode.toFile(qrCodePath, allGoodsData);
        console.log(`QR code for all partners' goods and arrival entrepot generated at: ${qrCodePath}`);


                const itineraryData = {
                    routeCoordinates,
                    startAddress,
                    destinationAddress,
                    mapImage: imagePath 
                };
        
                res.json(itineraryData);
            } catch (error) {
                console.error('Error generating itinerary:', error);
                res.status(500).json({ error: 'Failed to generate itinerary' });
            }
        };
        
        const decodePolyline = (encoded) => {
            let index = 0;
            const len = encoded.length;
            const array = [];
            let lat = 0;
            let lng = 0;
        
            while (index < len) {
                let b;
                let shift = 0;
                let result = 0;
                do {
                    b = encoded.charCodeAt(index++) - 63;
                    result |= (b & 0x1f) << shift;
                    shift += 5;
                } while (b >= 0x20);
                const dlat = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
                lat += dlat;
                shift = 0;
                result = 0;
                do {
                    b = encoded.charCodeAt(index++) - 63;
                    result |= (b & 0x1f) << shift;
                    shift += 5;
                } while (b >= 0x20);
                const dlng = ((result & 1) !== 0 ? ~(result >> 1) : (result >> 1));
                lng += dlng;
                array.push([lat * 1e-5, lng * 1e-5]);
            }
            return array;
        };
        
        module.exports = { generateItinerary };
        

        
module.exports = { generateItinerary };
module.exports = {
    generateItineraryCollecte,
    getMaraude,
    addCollecte,
    generateItinerary,
    getVolunteersDisponibles,
    addMaraude,
    getAllStockedDenrees,
    createEntrepot,
    getAllEntrepots,
    updateEntrepot,
    deleteEntrepot,
    deleteStock,
    updateStock
};