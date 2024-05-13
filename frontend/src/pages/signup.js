import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/signup.css';  
import '../css/home.css';
import '../css/admin.css';
import logo from '../assets/logo.png';  

function Signup() {
    const navigate = useNavigate();
    const [role, setRole] = useState('beneficiary');
    const [currentPage, setCurrentPage] = useState(1);
    const [services, setServices] = useState([]);
    const [permis_conduire, setPermis] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');

    const [formData, setFormData] = useState({
        email: '',
        prenom: '',
        nom: '',
        mot_de_passe: '',
        confirmPassword: '',
        telephone: '',
        genre: '',
        adresse: '',
        ville: '',
        code_postal: '',
        jour: '',
        mois: '',
        annee: '',
        besoin: '',
        avis_impot: null,
        qualites: null,
        message_candidature: null,
        competences: null,
        casier_judiciaire: null,
        permis_conduire: null,
        justificatif_permis: null,
    });

    useEffect(() => {
        fetchServices();
    }, []);

    const handleInputChange = (e) => {
        const { name, value, type, files } = e.target;
        if (type === 'file') {
            setFormData(prev => ({ ...prev, [name]: files[0] }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
        if (name === 'confirmPassword' || name === 'mot_de_passe') {
            setErrorMessage('');
        }
    };

    const fetchServices = async () => {
        try {
            const response = await fetch('https://au-temps-donne-api.onrender.com/api/admin/services', {
                method: 'GET',
                headers: { 'Accept': 'application/json' },
            });
            if (!response.ok) throw new Error('Problème de réponse réseau');
            const services = await response.json();
            setServices(services);
        } catch (error) {
            console.error("Il y a eu un problème avec l'opération fetch: " + error.message);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.mot_de_passe !== formData.confirmPassword) {
            setErrorMessage('Les mots de passe ne correspondent pas.');
            return;
        }
        if (currentPage === 1) {
            setCurrentPage(2);
        } else if (currentPage === 2 && role === 'volunteer'){
            setCurrentPage(3);
        }
        else {
            try {
                const formDataToSend = createFormData();
                const response = await fetch(`https://au-temps-donne-api.onrender.com/api/${role === 'beneficiary' ? 'beneficiary/registerBeneficiary' : 'volunteer/registerVolunteer'}`, {
                    method: 'POST',
                    body: formDataToSend,
                });
                if (!response.ok) throw new Error('Erreur lors de la soumission du formulaire');
                const data = await response.json();
                navigate('/signup_success');
            } catch (error) {
                console.error('Submission error:', error.message);
            }
        }
    };

    const createFormData = () => {
        const data = new FormData();
        Object.entries(formData).forEach(([key, value]) => {
            if (value != null) data.append(key, value);
        });
        data.append('date_de_naissance', `${formData.annee}-${formData.mois}-${formData.jour}`);
        return data;
    };

    const toggleJustificatif = (value) => {
        setPermis(value);
        setFormData(prev => ({ ...prev, permis_conduire: value }));
    };

    return (
        <>
            <header>
                <img src={logo} alt="Your Logo" className="logo" />
            </header>
            <div className="form-box">
                <center>
                <div className="breadcrumb">
                    {Array.from({ length: 5 }, (_, i) => i % 2 === 0 ? (
                        <div className="dot" key={i}></div>
                    ) : (
                        <div className="line" key={i}></div>
                    ))}
                </div>
                </center>
               
                {currentPage === 1 && (
                    <div>
                        <center>
                            <h1>Inscription</h1>
                            <p><strong>Déjà un compte chez nous ? <a href="#">Connectez-vous</a></strong></p>
                        </center>
                        <div className="button-box">
                        <button 
                        type="button" 
                        onClick={() => setRole('beneficiary')}
                        className={`toggle-btn ${role === 'beneficiary' ? 'active' : ''}`}
                        style={{
                            color: role === 'beneficiary' ? 'white' : '#F96262', 
                            backgroundColor: role === 'beneficiary' ? '#D23939' : 'transparent' 
                        }}>
                        Bénéficiaire
                    </button>
                    <button 
                        type="button" 
                        onClick={() => setRole('volunteer')}
                        className={`toggle-btn ${role === 'volunteer' ? 'active' : ''}`}
                        style={{
                            color: role === 'volunteer' ? 'white' : '#F96262', 
                            backgroundColor: role === 'volunteer' ? '#D23939' : 'transparent' 
                        }}>
                        Bénévole
                    </button>

                        </div>
                        <center>
                        {errorMessage && <p className="error-message">{errorMessage}</p>}

                        </center>

                        <form onSubmit={handleSubmit} className="input-group">
                            <div class="form-group">
                                <div class="input-group email">
                                    <label for="email">Email:</label>
                                    <input type="email" name="email" value={formData.email} onChange={handleInputChange} required  />
                                </div>
                            </div>
                            <div class="form-group">
                                <div class="input-group">
                                    <label for="prenom">Prenom :</label>
                                    <input type="text" name="prenom" value={formData.prenom} onChange={handleInputChange} required  />
                                </div>
                            </div>
                            <div class="form-group">
                                <div class="input-group">
                                    <label for="nom">Nom:</label>
                                    <input type="text" name="nom" value={formData.nom} onChange={handleInputChange} required />
                                </div>
                            </div>
                            <div class="form-group">
                                <div class="input-group">
                                    <label for="mot_de_passe">Mot de passe :</label>
                                    <input type="password" name="mot_de_passe" value={formData.mot_de_passe} onChange={handleInputChange} required  />
                                </div>
                            </div>
                            <div class="form-group">
                                <div class="input-group">
                                    <label for="confirmPassword">Confirmation de mot passe :</label>
                                    <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} required  />
                                </div>
                            </div>
                            
                            <center><button class="submit-btn" type="submit">Suivant</button></center>
                            
                        </form>
                    </div>
                )}
                {currentPage === 2 && (
                    
                    <div>
                        <form onSubmit={handleSubmit} className="input-group">
                             <div  style={{marginTop: '50px'}}  className="form-group" id="info_group">
                                <div className="input-group">
                                <label htmlFor="telephone">Numéro de téléphone :</label>
                                  <input type="tel" name="telephone" value={formData.telephone} onChange={handleInputChange} required  pattern="[0-9]{10}" />
                                </div>
                                <div className="input-group" id="genre_grp">
                                    <label htmlFor="genre">Genre :</label>
                                    <select name="genre" value={formData.genre} onChange={handleInputChange} required>
                                        <option value=""></option>
                                        <option value="homme">Homme</option>
                                        <option value="femme">Femme</option>
                                    </select>
                                </div>
                            </div>
                            <div className="input-group">
                                <label htmlFor="adresse">Adresse :</label>
                                <input type="text" id="adresse-input" name="adresse" value={formData.adresse} onChange={handleInputChange} required placeholder="Adresse" />
                            </div>
                            <div className="form-group" id="adresse">
                               <div class="input-group">
                                <input type="text" name="ville" value={formData.ville} onChange={handleInputChange} required placeholder="Ville" />
                               </div>
                               <div class="input-group" id="code_grp">
                               <input type="text" id="ville-b"  name="code_postal" value={formData.code_postal} onChange={handleInputChange} required placeholder="Code Postal" />
                                </div>
                            </div>
                            <div className="input-group">
                            <label htmlFor="avis_impot">Date de naissance :</label>
                                <div class="dob-group">
                                <div className="input-group">
                                  <input type="number" name="jour" value={formData.jour} onChange={handleInputChange} required placeholder="Jour" min="1" max="31" />
                                  </div>
                                <div className="input-group" id="grp">
                                <select name="mois" value={formData.mois} onChange={handleInputChange} required>
                                    <option value="">Mois</option>
                                    <option value="1">Janvier</option>
                                    <option value="2">Février</option>
                                    <option value="3">Mars</option>
                                    <option value="4">Avril</option>
                                    <option value="5">Mai</option>
                                    <option value="6">Juin</option>
                                    <option value="7">Juillet</option>
                                    <option value="8">Août</option>
                                    <option value="9">Septembre</option>
                                    <option value="10">Octobre</option>
                                    <option value="11">Novembre</option>
                                    <option value="12">Décembre</option>
                                </select>
                                </div>
                                <div className="input-group" id="grp">
                                   <input type="number" name="annee" value={formData.annee} onChange={handleInputChange} required placeholder="Année" min="1900" max={new Date().getFullYear()} />
                                </div>
                                </div>
                            </div>
                            {role === 'beneficiary' && (
                                <div>
                                    <div className="form-group">
                                    <div className="input-group" id="justificatif-group">
                                        <label htmlFor="avis_impot">Avis d'impot (PDF):</label>
                                        <input  type="file" id="avis_impot" name="avis_impot" onChange={handleInputChange} />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <label for="besoin">Votre besoin:</label>
                                    <select id="besoin" name="besoin">
                                        <option value="">Sélectionnez un service</option>
                                    </select>
                                </div>
                                <center><button class="submit-btn" type="submit">Retour</button></center>
                                <center><button class="submit-btn" id="btn_va" type="submit">Valider</button></center>
                                </div>
                                
                            )}
                           {role === 'volunteer' && (
                            <div>
                                <div className="form-group" id="permis_group">
                                    <div className="input-group">
                                        <label htmlFor="permis">Permis de conduire:</label>
                                        <div className="check">
                                            <input 
                                                type="radio" 
                                                id="permis_conduire_oui" 
                                                name="permis_conduire" 
                                                onChange={() => toggleJustificatif('oui')} 
                                                checked={permis_conduire === 'oui'}
                                                required
                                            />
                                            <label htmlFor="permis_conduire_oui">Oui</label>
                                            <input 
                                                type="radio" 
                                                id="permis_conduire_non" 
                                                name="permis_conduire" 
                                                onChange={() => toggleJustificatif('non')} 
                                                checked={permis_conduire === 'non'}
                                                required
                                            />
                                            <label htmlFor="permis_conduire_non">Non</label>
                                        </div>
                                    </div>
                                    
                                    <div className="input-group" style={{ display: permis_conduire === 'oui' ? 'block' : 'none' }}>
                                        <label htmlFor="justificatif_permis">Justificatif de permis (PDF):</label>
                                        <input type="file" id="justificatif_permis" name="justificatif_permis" onChange={handleInputChange}/>
                                    </div>
                                </div>
                                <center><button class="submit-btn" type="submit">Retour</button></center>
                                <center><button class="submit-btn" id="btn_va" type="submit">Suivant</button></center>

                            </div>
                
                        )}
                        
                        </form>
                    </div>                    
                )}
                 {currentPage === 3 && role === 'volunteer' && (

                    <div >
                        <center>
                        <div className="breadcrumb">
                            {Array.from({ length: 5 }, (_, i) => i % 2 === 0 ? (
                                <div className="dot" key={i}></div>
                            ) : (
                                <div className="line" key={i}></div>
                            ))}
                        </div>
                        </center>
                        <form  onSubmit={handleSubmit}  className="form-group" enctype="multipart/form-data">
                        <div  style={{marginTop: '50px'}} className="form-group">
                            <div class="input-group">
                                <label htmlFor="Langues">Langues :</label>
                                <input type="text" id="langues" value={formData.langues} onChange={handleInputChange} name="Langues" required/>
                            </div>
                        </div>
                        <div className="form-group">
                            <div className="input-group">
                                <label htmlFor="Competences">Compétences :</label>
                                <input type="text" id="competences" value={formData.competences} onChange={handleInputChange} name="Competences" required/>
                            </div>
                            <div className="input-group">
                                <label htmlFor="Qualites">Qualités (3 max):</label>
                                <input type="text" id="qualites" value={formData.qualites} onChange={handleInputChange} name="Qualites" required/>
                            </div>
                            <div className="input-group" id="justificatif-group" >
                                <label htmlFor="casier">Casier judiciaire:</label>
                                <input type="file" id="casier" onChange={handleInputChange} name="casier_judiciaire"/>
                            </div>
                        </div>
                        <div className="form-group">
                            <div class="mb-3">
                                <label htmlFor="message_candidature" className="form-label">Message de candidature :</label>
                                <textarea className="form-control" value={formData.message_candidature} onChange={handleInputChange} id="message_candidature" name="message_candidature" rows="3" required></textarea>
                            </div>
                        </div>
                        <center><button className="submit-btn" onClick={() => setCurrentPage(2)}>Retour</button></center>
                        <center><button className="submit-btn" id="btn_va" type="submit">Valider</button></center>
                    </form>
                    </div>
               )}
            </div>
        </>
    );
}

export default Signup;
