require('dotenv').config();
const argon2 = require('argon2');
const jwt = require('jsonwebtoken');
const Partenaire = require('../models/Partenaire');
const nodemailer = require('nodemailer');
const Denree = require('../models/Denree');
const { json } = require('body-parser');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const Lieu = require('../models/Lieu');



const sendWelcomeEmail = async (email, name) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USERNAME,
            pass: process.env.EMAIL_PASSWORD,
        }
    });

    const mailOptions = {
        from: process.env.EMAIL_USERNAME,
        to: email,
        subject: 'Bienvenue chez notre plateforme!',
        text: `Bonjour ${name},\n\nBienvenue sur notre plateforme !`,
        html: `<p>Bonjour <strong>${name}</strong>,</p><p>Bienvenue sur notre plateforme !</p>`,
    };
    try {
        await transporter.sendMail(mailOptions);
        console.log('Welcome email sent successfully');
    } catch (error) {
        console.error('Error sending welcome email', error);
    }
};



const registerPartenaire = async (req, res) => {
    try {
        console.log('LOL '+JSON.stringify(req.body));
        const { email, nom, password, telephone, adresse } = req.body;
        
        const hashedPassword = await argon2.hash(password);

        const newPartenaire = await Partenaire.create({
            nom,
            email,
            password: hashedPassword,
            telephone,
            adresse
        });

        await sendWelcomeEmail(email, nom);

        res.status(201).json({ message: 'Registration successful', partenaire: newPartenaire });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
const generateToken = (id, email) => {
    return jwt.sign({ id, email }, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1h' });
  };
const loginPartenaire = async (req, res) => {
    try {
        const { email, password } = req.body;
  
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
  
        const partenaire = await Partenaire.findOne({ where: { email } });
  
        if (!partenaire) {
            return res.status(404).json({ error: 'User not found' });
        }
  
        const passwordMatch = await argon2.verify(partenaire.password, password);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid password' });
        }
  
  
        const token = generateToken(partenaire.ID_Commercant,  partenaire.email);
  
        const userType = "partner"
  
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

const changePassword = async (req, res) => {
    try {
        const jwtSecret = "your_secret_key_here";
        const token = req.cookies.access_token;

        if (!token) {
            return res.status(401).json({ error: 'No token found' });
        }

        const decoded = jwt.verify(token, jwtSecret);
        const idPartenaire = decoded.id; 

        const { currentPassword, newPassword } = req.body;

        // Find the partenaire by ID
        const partenaire = await Partenaire.findOne({ where: { ID_Commercant: idPartenaire } });
        if (!partenaire) {
            return res.status(404).json({ error: 'Partenaire not found' });
        }

        // Verify the current password
        const validPassword = await argon2.verify(partenaire.password, currentPassword);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid current password' });
        }

        // Hash the new password
        const hashedNewPassword = await argon2.hash(newPassword);

        // Update the partenaire's password
        await Partenaire.update({ password: hashedNewPassword }, { where: { ID_Commercant: idPartenaire } });

        res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
        console.error('Error changing password:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};




const getProductsForPartenaire = async (req, res) => {
    try {
       
        const token = req.cookies.access_token;
    
        if (!token) {
            return res.status(401).json({ error: 'No token found' });
        }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const idPartenaire = decoded.id; 


        const partenaire = await Partenaire.findOne({ where: { ID_Commercant: idPartenaire } });

        if (partenaire) {
            const idCommercant = partenaire.ID_Commercant;

            const allDenree = await Denree.findAll({
                where: {
                    id_commercant: idCommercant
                }
            });

            if(allDenree){
                console.log('Test : '+JSON.stringify(allDenree));
                return res.status(200).json({ data: allDenree });
            }else{
                return res.status(200).json({ data: {} });
            }
          } else {
          }
        
    } catch (error) {
        console.error('Error during execution :', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}



async function generateAnnualReportController(req, res) {
    const { year } = req.params;

    try {
        const token = req.cookies.access_token;

        if (!token) {
            throw new Error('JWT token not provided');
        }

        // Decode the token without verifying it
        const decoded = jwt.decode(token);
        
        if (!decoded || !decoded.id) {
            throw new Error('Invalid JWT token');
        }

        const idPartenaire = decoded.id;

        // Retrieve information of the partenaire
        const partenaire = await Partenaire.findOne({
            where: {
                ID_Commercant: idPartenaire
            }
        });

        if (!partenaire) {
            throw new Error('Partenaire not found');
        }

        // Retrieve all denrees for the partenaire
        const reportData = await Denree.findAll({
            where: {
                id_commercant: idPartenaire
            }
        });

        // Generate the annual report PDF
        const pdfBuffer = await generateAnnualReport(parseInt(year), partenaire, reportData);

        res.set({
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename=annual_report_${year}.pdf`
        });

        res.send(pdfBuffer);
    } catch (error) {
        console.error('Error generating annual report:', error);
        res.status(500).send('Error generating annual report');
    }
}

async function generateAnnualReport(year, partenaire, reportData) {
    return new Promise(async (resolve, reject) => {
        try {
            // Create a new PDF document
            const doc = new PDFDocument();

            // Create a buffer to store the PDF data
            let pdfBuffer = Buffer.from([]);

            // Stream the PDF data into the buffer
            doc.on('data', chunk => {
                pdfBuffer = Buffer.concat([pdfBuffer, chunk]);
            });

            // Handle end of document
            doc.on('end', () => {
                resolve(pdfBuffer);
            });

            // Add header
            doc.fontSize(20).text(`Rapport Annuel ${year}`, { align: 'center' });

            // Add date
            doc.moveDown();
            doc.fontSize(12).text(`Date: ${new Date().toLocaleDateString()}`, {
                align: 'right'
            });

            // Add partenaire information
            doc.moveDown();
            doc.fontSize(16).text(`Partenaire: ${partenaire.nom}`);

            // Filter reportData by the year of Date_ajout
            const denreesOfYear = reportData.filter(denree => {
                const dateAjout = new Date(denree.Date_ajout);
                return dateAjout.getFullYear() === year && !isNaN(dateAjout.getTime()); // Ensure Date_ajout is a valid Date
            });

            // Add content
            doc.moveDown();
            if (denreesOfYear.length === 0) {
                // Display a message when denreesOfYear is empty
                doc.fontSize(12).text(`Aucune denrée ajoutée en ${year}.`, { align: 'center' });
            } else {
                // Loop through the denreesOfYear and display the denrees details
                for (const denree of denreesOfYear) {
                    doc.moveDown();
                    doc.fontSize(16).text(`Denree: ${denree.nom}`);
                    doc.fontSize(12).text(`Type: ${denree.type}`);
                    doc.fontSize(12).text(`Date Peremption: ${denree.date_peremption}`);
                    doc.fontSize(12).text(`Quantite: ${denree.quantite}`);

                    // Check if Date_ajout is a valid Date before formatting
                    const dateAjout = new Date(denree.Date_ajout);
                    if (!isNaN(dateAjout.getTime())) {
                        doc.fontSize(12).text(`Date d'ajout: ${dateAjout.toLocaleDateString()}`);
                    } else {
                        doc.fontSize(12).text(`Date d'ajout: N/A (invalid date format)`);
                    }
                }
            }

            // Add footer
            doc.fontSize(10).text(
                "Ce rapport a été généré par l'association Au Temps Donné ",
                50,
                doc.y + 50, // Adjust the vertical position if needed
                { align: 'right' }
            );

            // Finalize the PDF document
            doc.end();
        } catch (error) {
            reject(error);
        }
    });
}






const addProductForPartenaire = async (req, res) => {
    try {
        
        const token = req.cookies.access_token;
    
        if (!token) {
            return res.status(401).json({ error: 'No token found' });
        }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);;
        if (!decoded || !decoded.id) { 
            return res.status(401).json({ error: 'Invalid token' });
        }

        const { datePeremption, quantite, nomProduit, categorie } = req.body;
        console.log('CATATA : '+categorie);
        const idPartenaire = decoded.id; 

        console.log('PARTENZIRE : '+ idPartenaire);

        const partenaire = await Partenaire.findOne({ where: { ID_Commercant: idPartenaire } });
        console.log('PARTENZIRE ELEEMENT : '+ JSON.stringify(partenaire));


        if (partenaire) {
            const idCommercant = partenaire.ID_Commercant;

            const mappedData = {
                id_commercant: idCommercant,
                categorie: categorie,
                quantite: quantite,
                date_peremption: datePeremption,
                nom: nomProduit
            }

            console.log('TETTETT : '+ JSON.stringify(mappedData));

            const created = await Denree.create(
                mappedData
            );
            
            return res.status(201).json({ data: created });
            
        } else {
            return res.status(500).json({ error: 'Partenaire not found' });
        }
        
    } catch (error) {
        console.error('Error during execution :', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}


const deleteProductForPartenaire = async (req, res) => {
    try {
        const jwtSecret = "your_secret_key_here";
        const token = req.cookies.access_token;

        if (!token) {
            return res.status(401).json({ error: 'No token found' });
        }

        const decoded = jwt.verify(token, jwtSecret);
        const idPartenaire = decoded.id; 

        const { idDenree } = req.params;
        console.log('YEYEY : '+idPartenaire);

        const partenaire = await Partenaire.findOne({ where: { ID_Commercant: idPartenaire } });

        if (partenaire) {
            const idCommercant = partenaire.ID_Commercant;
            console.log('HAHAH : '+idCommercant);
            const denreeToDelete = await Denree.destroy({
                where: {
                    id_commercant: idCommercant,
                    ID_Denree: idDenree
                }
            });

            return res.status(200).json({ success: true, message: 'Product deleted' });
        } else {
            return res.status(500).json({ error: 'Partenaire not found' });
        }   
        
    } catch (error) {
        console.error('Error during execution :', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}


const updateProductForPartenaire = async (req, res) => {
    try {
        
            const token = req.cookies.access_token;
    
            if (!token) {
                return res.status(401).json({ error: 'No token found' });
            }
    
            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const idPartenaire = decoded.id; 
        const { datePeremption, quantite, nomProduit, caregorie, idMaraude } = req.body;
        const { idDenree } = req.params; 

        const partenaire = await Partenaire.findOne({ where: { ID_Commercant: idPartenaire } });

        let idCommercant;
        if (partenaire) {
            idCommercant = partenaire.idCommercant;

            let mappedData;
            if(idMaraude == null | undefined){
                mappedData = {
                    id_commercant: idCommercant,
                    type: caregorie,
                    quantite: quantite,
                    date_peremption: datePeremption,
                    nom_produit: nomProduit
                }
            } else {
                mappedData = {
                    id_commercant: idCommercant,
                    type: caregorie,
                    quantite: quantite,
                    date_peremption: datePeremption,
                    nom_produit: nomProduit,
                    id_maraude: idMaraude
                }
            }
            
            console.log('PAPAPOKPOK : '+partenaire.ID_Commercant);

            const updated = await Denree.update(mappedData, {
                where: { id_commercant: partenaire.ID_Commercant, ID_Denree: idDenree }
            });

            if (updated) {
                return res.status(200).json({ success: true, message: 'Product updated successfully', data: updated });
              } else {
                return res.status(500).json({ error: 'Failed to update product' });
              }
                        
        } else {
            return res.status(500).json({ error: 'Partenaire not found' });
        }
        
    } catch (error) {
        console.error('Error during execution :', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}


const getPartenaireInfo = async (req, res) => {
    try {
        const token = req.cookies.access_token;

        if (!token) {
            return res.status(401).json({ error: 'No token found' });
        }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        if (!decoded || !decoded.id) { 
            return res.status(401).json({ error: 'Invalid token' });
        }

        const userId = decoded.id; 
        const idCommercant = decoded.id;
        const email = decoded.email;

        console.log('ID_Commercant:', idCommercant);
        console.log('Email:', email);
        return res.status(200).json({ success: true, id: userId });
        
    } catch (error) {
        console.error('Error during execution:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
// Update account function
const updateAccount = async (req, res) => {
    try {
        
        const token = req.cookies.access_token;

        if (!token) {
            return res.status(401).json({ error: 'No token found' });
        }

        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        if (!decoded || !decoded.id) { 
            return res.status(401).json({ error: 'Invalid token' });
        }

        const userId = decoded.id; 

        const { nom, email, telephone, adresse, ville , code_postal, } = req.body;
        console.log('Received user data:', { nom, email, telephone, adresse, ville , code_postal});

        const [updatedRows] = await Partenaire.update(
            { nom, email, telephone, adresse, ville , code_postal },
            { where: { ID_Commercant: userId } }
        );

        console.log('Updated rows for Partenaire:', updatedRows);

        res.status(200).json({ message: 'Account updated successfully' });
    } catch (error) {
        console.error('Error updating account:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};


// Delete account function
const deleteAccount = async (req, res) => {
    try {
        const token = req.cookies.access_token;
        await Partenaire.destroy({ where: { token } });
        res.clearCookie('access_token'); 
        res.status(200).json({ message: 'Account deleted successfully' });
    } catch (error) {
        console.error('Error deleting account:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};
const getAllPartenaireInfo = async (req, res) => {
    try {
        const token = req.cookies.access_token;
  
        if (!token) {
            return res.status(401).json({ error: 'Aucun token trouvé' });
        }
  
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        if (!decoded) {
            return res.status(401).json({ error: 'Token invalide' });
        }
  
      const partenaire = await Partenaire.findByPk(decoded.id);
        if (!partenaire) {
            return res.status(404).json({ error: 'Utilisateur non trouvé' });
        }
  
        res.status(200).json({ partenaire });
        console.log({partenaire});
    } catch (error) {
        console.error('Erreur lors de l\'obtention des informations utilisateur :', error);
        res.status(500).json({ error: 'Erreur interne du serveur' });
    }
  };
  


module.exports = { registerPartenaire,loginPartenaire, addProductForPartenaire, deleteProductForPartenaire, getProductsForPartenaire, updateProductForPartenaire, getPartenaireInfo, generateAnnualReportController, generateAnnualReport, updateAccount, deleteAccount, getAllPartenaireInfo, changePassword };
