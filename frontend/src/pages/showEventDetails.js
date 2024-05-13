import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import '../css/admin.css';
import NavMenu from './navMenuVolunteer';
import horlogeIcon from '../assets/horloge_red.png';
import lieu from '../assets/lieu.png';
import date from '../assets/date.png';
import retour from '../assets/retour.png';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import axios from 'axios';

function Activity() {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [event, setEvent] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [participants, setParticipants] = useState([]);
    const [participantsBenef, setParticipantsBenef] = useState([]);
    const [mode, setMode] = useState('view');
    const [isLoading, setIsLoading] = useState(true);
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState(null);
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const [showDeleteAlert, setShowDeleteAlert] = useState(false);
    const [userInfo, setUserInfo] = useState(null);
    const [formData, setFormData] = useState({
        titre: '',
        description: '',
        heure_debut: '',
        heure_fin: '',
        date_activite: '',
        adresseComplete: '',
        ville: '',
        code_postal: ''
    });

    const fetchEventDetails = async () => {
        try {
            const response = await fetch(` https://au-temps-donne-api.onrender.com/api/event/activites/${eventId}`);
            if (!response.ok) {
                throw new Error('Erreur réseau');
            }
            const data = await response.json();
            setEvent(data);
            setFormData({
                titre: data.titre,
                description: data.description,
                heure_debut: data.heure_debut,
                heure_fin: data.heure_fin,
                date_activite: data.date_activite,
                adresseComplete: data.lieu.adresse,
                ville: data.lieu.ville,
                code_postal: data.lieu.code_postal
            });
        } catch (error) {
            console.error('Erreur lors de la récupération des détails de l’événement:', error);
        }
     
    };
    const fetchEventPDetails = async () => {
        try {
            const response = await fetch(` https://au-temps-donne-api.onrender.com/api/event/activites_prives/${eventId}`);
            if (!response.ok) {
                throw new Error('Erreur réseau');
            }
            const data = await response.json();
            setEvent(data);
            setFormData({
                titre: data.titre,
                description: data.description,
                heure_debut: data.heure_debut,
                heure_fin: data.heure_fin,
                date_activite: data.date_activite,
                adresseComplete: data.lieu.adresse,
                ville: data.lieu.ville,
                code_postal: data.lieu.code_postal,
                id_beneficiaire:data.id_beneficiaire

            });
        } catch (error) {
            console.error('Erreur lors de la récupération des détails de l’événement:', error);
        }
     
    };

    useEffect(() => {
        fetchEventDetails();
        fetchEventPDetails();
    }, [eventId]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleBackClick = () => {
        setMode('view');
        fetchEventDetails();
    };

    useEffect(() => {
        async function fetchUserData() {
          try {
            const response = await fetch(' https://au-temps-donne-api.onrender.com/api/volunteer/userinfo', {
              method: 'GET',
              credentials: 'include'
            });
    
            if (response.ok) {
              const userData = await response.json();
              setUserInfo(userData.volunteer);
            } else {
              console.error('Failed to fetch user info');
            }
          } catch (error) {
            console.error('Error fetching user info:', error);
          }
        }
    
        fetchUserData();
      }, []);
    
      useEffect(() => {
        async function checkRegistrationStatus() {
          if (userInfo) {
            try {
              const ID_Benevole = userInfo.id; 
              const response = await axios.get(` https://au-temps-donne-api.onrender.com/api/volunteer/registrations/${eventId}/${ID_Benevole}`);
              if (response.status === 200) {
                setShowSuccessAlert(true);
              }
            } catch (error) {
              console.error('Error checking registration status:', error);
            }
          }
        }
    
        checkRegistrationStatus();
      }, [eventId, userInfo]);
    
  

    const handleRegistration = async (eventId, benevoleId) => {
        setLoading(true);
        setError(null);

        try {
            const response = await axios.post(` https://au-temps-donne-api.onrender.com/api/volunteer/activites/registrations/${eventId}`, {
                ID_event: eventId,
                ID_Benevole: benevoleId
            });

            if (response.status === 201) {
                setSuccess(true);
                setShowSuccessAlert(false);
                setShowDeleteAlert(false);

            } else {
                setError('Failed to register for the event');
            }
        } catch (error) {
            setError('Internal Server Error');
            console.error('Error registering for event:', error);
        } finally {
            setLoading(false);
        }
    };
    
    const cancelRegistration = async (eventId, benevoleId) => {
        setLoading(true);
        setError(null);
    
        try {
            const response = await axios.delete(` https://au-temps-donne-api.onrender.com/api/volunteer/registrations/delete/${eventId}/${benevoleId}`);
    
            if (response.status === 200) {
                setSuccess(false);
                setShowSuccessAlert(false);
                setShowDeleteAlert(true);

            } else {
                setError('Failed to cancel registration for the event');
            }
        } catch (error) {
            setError('Internal Server Error');
            console.error('Error cancelling registration for event:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!event) {
        return <div>Loading...</div>;
    }

    const formatTime = (timeString) => {
        const timeOptions = { hour: '2-digit', minute: '2-digit' };
        const time = new Date(`1970-01-01T${timeString}Z`);
        return time.toLocaleTimeString([], timeOptions);
    };

    return (
        <>
            <NavMenu />
            <section className="content">
                <div className="lists">
                    {mode === 'edit' ? (
                        <div>
                            <div className="header">
                                <button onClick={handleBackClick} className="back-button">
                                    <img id="retour" height="20px" width="20px" src={retour} alt="Retour" />
                                </button>
                                <h3 className='title_event'>Détails de l'événement</h3>
                            </div>
                            <div className="box-container">
                                <div className="elm_box_details">
                                    <form>
                                        <div className="event-g">
                                            <label>Titre:
                                                <input
                                                    type="text"
                                                    name="titre"
                                                    value={formData.titre}
                                                    onChange={handleInputChange}
                                                />
                                            </label>
                                        </div>
                                        <div className="event-g">
                                            <label>Description:
                                                <textarea
                                                    name="description"
                                                    value={formData.description}
                                                    onChange={handleInputChange}
                                                />
                                            </label>
                                        </div>
                                        <div className="event-group">
                                            <label>Heure début:
                                                <input
                                                    type="time"
                                                    name="heure_debut"
                                                    value={formData.heure_debut}
                                                    onChange={handleInputChange}
                                                />
                                            </label>
                                            <label>Heure fin:
                                                <input
                                                    type="time"
                                                    name="heure_fin"
                                                    value={formData.heure_fin}
                                                    onChange={handleInputChange}
                                                />
                                            </label>
                                            <label>Date de l'activité:
                                                <input
                                                    type="date"
                                                    name="date_activite"
                                                    value={formData.date_activite}
                                                    onChange={handleInputChange}
                                                />
                                            </label>
                                        </div>
                                        <div className="event-group">
                                            <div className="event-child">
                                                <label>Adresse:
                                                    <input
                                                        type="text"
                                                        name="adresseComplete"
                                                        value={formData.adresseComplete}
                                                        onChange={handleInputChange}
                                                    />
                                                </label>
                                            </div>
                                            <div className="event-child">
                                                <label>Ville:
                                                    <input
                                                        type="text"
                                                        name="ville"
                                                        value={formData.ville}
                                                        onChange={handleInputChange}
                                                    />
                                                </label>
                                            </div>
                                            <label>Code Postal:
                                                <input
                                                    id="postalCode"
                                                    type="text"
                                                    name="code_postal"
                                                    value={formData.code_postal}
                                                    onChange={handleInputChange}
                                                />
                                            </label>
                                        </div>
                                        <button className="btn_act" type="submit">Enregistrer</button>
                                    </form>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div>
                            <div className="header">
                                <Link to="/volunteer/evenements">
                                    <img id="retour" height="20px" width="20px" src={retour} alt="Retour" />
                                </Link>
                                <h3 className='title_event'>Détails de l'événement</h3>
                            </div>
                            {showSuccessAlert && (
                                <div className="alert success">
                                    Vous êtes déjà inscrit !
                                </div>
                            )}
                             {showDeleteAlert && (
                                <div className="alert success">
                                    Votre inscription a été annulé !
                                </div>
                            )}
                            {success && (
                                <div className="alert success">
                                  Inscription réussie !

                                </div>
                            )}
                            <div className="box-container">
                                <div className="elm_box_details">
                                    <div className="infos">
                                        <div>
                                            <p id="service">{event.nom_service}</p>
                                            <h2>{event.titre}</h2>
                                            <p className="p_details">Description: {event.description || 'No description provided'}</p><br></br>
                                            <div></div>
                                            {event.id_beneficiaire && (
                                            <div>
                                                <p>Bénéficiaire : {event.beneficiary.nom} {event.beneficiary.prenom}</p>
                                            </div>
                                        )}
                                        </div>
                                        
                                        <div>
                                            <div className="heure_d">
                                                <img className="voir-all-icon" height="15px" width="17px" src={horlogeIcon} alt="Voir tout" />
                                                <p>{formatTime(event.heure_debut)} à {formatTime(event.heure_fin)}</p>
                                            </div>
                                            <div className="adresse_d">
                                                <img id="img_lieu" height="25px" src={lieu} alt="Lieu" />
                                                <p>{event.lieu ? event.lieu.adresse : 'Not specified'},</p>
                                                <p>{event.lieu ? event.lieu.ville : 'Not specified'}</p>
                                                <p>{event.lieu ? event.lieu.code_postal : 'Not specified'}</p>
                                            </div>
                                            <div className="adresse_d">
                                                <img id="img_date" height="18px" src={date} alt="Date" />
                                                <p>{event.date_activite ? new Date(event.date_activite).toLocaleDateString() : 'Date not available'}</p>
                                            </div>
                                            
                                        </div>
                                    </div>
                                    <div>
                                    
                                        { userInfo && (
                                            <div>
                                                {showSuccessAlert || success ? (
                                                    <center>
                                                        <button onClick={() => cancelRegistration(event.ID_Activite, userInfo.id)} className="btn_act">
                                                            Annuler l'inscription
                                                        </button>
                                                    </center>
                                                ) : (
                                                    <center>
                                                        <button className="btn_act" onClick={() => handleRegistration(event.ID_Activite, userInfo.id)} disabled={loading || success}>
                                                            S'inscrire
                                                        </button>
                                                    </center>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                    
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}

export default Activity;
