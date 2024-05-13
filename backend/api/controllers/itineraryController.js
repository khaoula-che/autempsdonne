const axios = require('axios');
const fs = require('fs');
const qrcode = require('qrcode');
const Route = require('../models/Route');
const CircuitRamassage = require('../models/CircuitRamassage'); 
const CommercantCircuit = require('../models/CommercantCircuit');

const generateItinerary = async (req, res) => {
    try {
        const { addresses, date_circuit, selectedPartners } = req.body;
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
        
                const staticMapURL = `https://maps.googleapis.com/maps/api/staticmap?size=600x400&path=enc:${route.overview_polyline.points}&key=${apiKey}`;
        
                const imagePath = `./uploads/image_${Date.now()}.png`; 
                const imageResponse = await axios({
                    method: 'GET',
                    url: staticMapURL,
                    responseType: 'stream'
                });
                imageResponse.data.pipe(fs.createWriteStream(imagePath));
        
                const savedRoute = await Route.create({ plan_route: imagePath });
        
                const circuitRamassage = await CircuitRamassage.create({
                    date_circuit: date_circuit, 
                    ID_Route: savedRoute.ID_Route 
                });
        
                let allGoodsData = '';
                for (const partner of selectedPartners) {
                    if (partner.ID_Commercant !== null) {
                        await CommercantCircuit.create({
                            ID_Commercant: partner.id,
                            ID_Circuit: circuitRamassage.ID_Circuit 
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