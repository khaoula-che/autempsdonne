import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import '../css/admin.css';
import NavMenu from './navMenu';
import horlogeIcon from '../assets/horloge_red.png'; 
import lieu from  '../assets/lieu.png';
import date from  '../assets/date.png';
import retour from '../assets/retour.png';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

function EventprvDetails() {
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate(); 
    const { eventId } = useParams();
    const [event, setEvent] = useState(null);
    const [participants, setParticipants] = useState([]);
    const [participantsBenef, setParticipantsBenef] = useState([]);
    const [mode, setMode] = useState('view');
    const [volunteers, setVolunteers] = useState([]);
    const [beneficiaries, setBeneficiaries] = useState([]);
    const [selectedVolunteer, setSelectedVolunteer] = useState('');
    const [selectedBeneficiary, setSelectedBeneficiary] = useState('');
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const [showSuccessAlertadd, setShowSuccessAlertadd] = useState(false);
   
    const [editMode, setEditMode] = useState(false);

    const [formData, setFormData] = useState({
        ID_Activite: '',
        titre: '',
        description: '',
        heure_debut: '',
        heure_fin: '',
        date_activite: '',
        adresseComplete: '',
        ville: '',
        code_postal: ''
    });
    const fetchEventDetails = () => {
        fetch(` https://au-temps-donne-api.onrender.com/api/event/activites_prives/${eventId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erreur réseau');
                }
                return response.json();
            })
            .then(data => {
                setEvent(data);
                setFormData({
                    ID_Activite:  data.ID_Activite,
                    titre: data.titre,
                    description: data.description,
                    heure_debut: data.heure_debut,
                    heure_fin: data.heure_fin,
                    date_activite: data.date_activite,
                    adresseComplete: data.lieu.adresse,
                    ville: data.lieu.ville,
                    code_postal: data.lieu.code_postal
                });
            })
            .catch(error => {
                console.error('Erreur lors de la récupération des détails de l’événement:', error);
            });
    };
/*
    const fetchVolunteers = () => {
        fetch(`http://127.0.0.1:8000/api/admin/volunteers`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch participants');
                }
                return response.json();
            })
            .then(data => {
                if (isMounted) {
                    setVolunteers(data);
                    setIsLoading(false);
                }
            })
            .catch(error => {
                if (isMounted) {
                    console.error('Error fetching participants:', error);
                    setError(error.message);
                    setIsLoading(false);
                }
            });
    };
    */


    useEffect(() => {
        fetchEventDetails();
        fetchParticipants();
        fetchParticipantsBenef();
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
    let isMounted = true;

    const fetchParticipants = () => {
        fetch(` https://au-temps-donne-api.onrender.com/api/event/activitesprv/registrations/${eventId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch participants');
                }
                return response.json();
            })
            .then(data => {
                if (isMounted) {
                    setParticipants(data);
                    setIsLoading(false);
                }
            })
            .catch(error => {
                if (isMounted) {
                    console.error('Error fetching participants:', error);
                    setError(error.message);
                    setIsLoading(false);
                }
            });
    };
    const fetchParticipantsBenef = () => {
        fetch(` https://au-temps-donne-api.onrender.com/api/event/activites/registrationsBenef/${eventId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch participants');
                }
                return response.json();
            })
            .then(data => {
                if (isMounted) {
                    setParticipantsBenef(data);
                    setIsLoading(false);
                }
            })
            .catch(error => {
                if (isMounted) {
                    console.error('Error fetching participants:', error);
                    setError(error.message);
                    setIsLoading(false);
                }
            });
    };


    const handleSubmit = (e) => {
        e.preventDefault();
        fetch(` https://au-temps-donne-api.onrender.com/api/event/activites_prives/update/${eventId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData)
        })
        .then(response => {
            if (response.ok) {
                alert('Événement mis à jour avec succès!');
                setMode('view');
                fetchEventDetails(); 

            } else {
                throw new Error('Erreur lors de la mise à jour');
            }
        })
        .catch(error => {
            console.error('Erreur lors de la mise à jour:', error);
            alert('Erreur lors de la mise à jour');
        });
    };

    function deleteEvent(eventId) {
        fetch(` https://au-temps-donne-api.onrender.com/api/event/activites_prives/delete/${eventId}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (response.ok) {
                return response.json();
            } else {
                throw new Error('Failed to delete event');
            }
        })
        .then(data => {
            alert(data.message); 
            sessionStorage.setItem('successMessageDelete', 'Evenement supprimé avec succès!');
            navigate('/admin/activiteprv');
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error deleting event: ' + error.message); 
        });
    }
    
    const handleDownloadPDF = () => {
        const doc = new jsPDF();
    
        const title = "Détails de l'Événement";
        const titleX = 105;
        const titleY = 10;
    
        doc.setFontSize(16); 
        doc.text(title, titleX, titleY, { align: 'center' }); 
    
        const eventDetailsColumns = [
            { header: 'Propriété', dataKey: 'property' },
            { header: 'Valeur', dataKey: 'value' }
        ];
        const eventDetailsRows = [
            { property: 'Titre', value: event.titre },
            { property: 'Description', value: event.description },
            { property: 'Heure de début', value: event.heure_debut },
            { property: 'Heure de fin', value: event.heure_fin },
            { property: 'Date', value: new Date(event.date_activite).toLocaleDateString() },
            { property: 'Adresse', value: `${event.lieu.adresse}, ${event.lieu.ville}, ${event.lieu.code_postal}` },
            { property: 'Bénévole', value: `${event.volunteer.nom} ${event.volunteer.prenom}` },
            { property: 'Bénéficiaire', value: `${event.beneficiary.nom} ${event.beneficiary.prenom}` },
        ];
    
        doc.autoTable(eventDetailsColumns, eventDetailsRows, {
            startY: titleY + 10, 
            theme: 'grid',
            styles: { overflow: 'linebreak' },
            columnStyles: {
                property: { cellWidth: 50 },
                value: { cellWidth: 140 }
            },
            headStyles: { fillColor: [115, 3, 192] },
            margin: { horizontal: 5 },
            bodyStyles: { valign: 'top' },
            showHead: 'firstPage'
        });
    
        doc.save('Event_Details.pdf');
    };
    
    
    if (!event) {
        return <div>Loading...</div>;
    }

    const formatTime = (timeString) => {
        const timeOptions = { hour: '2-digit', minute: '2-digit' };
        const time = new Date(`1970-01-01T${timeString}Z`);
        return time.toLocaleTimeString([], timeOptions);};
    
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
                                    <form onSubmit={handleSubmit}>
                                        <div class="event-g">

                                        <label>Titre:
                                            <input
                                                id="input_modif"
                                                type="text"
                                                name="titre"
                                                value={formData.titre}
                                                onChange={handleInputChange}
                                            />
                                        </label>
                                        </div>
                                        <div class="event-g">
                                        <label>Description:
                                            <textarea
                                                id="input_modif"
                                                name="description"
                                                value={formData.description}
                                                onChange={handleInputChange}
                                            />
                                        </label>
                                        </div>
                                        <div class="event-group">
                                        <label>Heure début:
                                            <input
                                                 id="input_modif"
                                                type="time"
                                                name="heure_debut"
                                                value={formData.heure_debut}
                                                onChange={handleInputChange}
                                            />
                                        </label>
                                        <label>Heure fin:
                                            <input
                                                id="input_modif"
                                                type="time"
                                                name="heure_fin"
                                                value={formData.heure_fin}
                                                onChange={handleInputChange}
                                            />
                                        </label>
                                        <label>Date de l'activité:
                                            <input
                                                id="input_modif"
                                                type="date"
                                                name="date_activite"
                                                value={formData.date_activite}
                                                onChange={handleInputChange}
                                            />
                                        </label>
                                        </div>
                                        <div class="event-group">
                                            <div class="event-child">
                                            <label>Adresse:
                                            <input
                                                id="input_modif"
                                                type="text"
                                                name="adresseComplete"
                                                value={formData.adresseComplete}
                                                onChange={handleInputChange}
                                            />
                                        </label>
                                            </div>
                                            <div class="event-child">
                                            <label>Ville:
                                            <input
                                                id="input_modif"
                                                type="text"
                                                name="ville"
                                                value={formData.ville}
                                                onChange={handleInputChange}
                                            />
                                        </label>
                                            </div>
                                        
                                        <label className="postalCode">Code Postal:
                                            <input 
                                                id="input_modif"
                                                type="text"
                                                name="code_postal"
                                                value={formData.code_postal}
                                                onChange={handleInputChange}
                                            />
                                        </label>
                                            </div>
                                            <div className="event-group">
                                          
                                        </div>
                                        <center><button className="btn_act" type="submit">Enregistrer</button></center>
                                    </form>
                                    </div>
                                    </div>
                                    </div>
                                ) : (
                                    <div>
                                    <div className="header">
                                        <Link to="/admin/activiteprv"> 
                                            <img id="retour" height="20px" width="20px" src={retour} alt="Retour" /> 
                                        </Link>
                                        <h3 className='title_event'>Détails de l'événement</h3>
                                    </div>
                                    <div className="box-container">
                                        <div className="elm_box_details">
                                    <div className="infos">
                                        <div>
                                            <p id="service">{event.nom_service}</p>
                                            <h3>{event.titre}</h3>
                                            <p className="p_details"><strong>Description:</strong> {event.description || 'No description provided'}</p>
                                            <p className="p_details"><strong>Bénévole:</strong> {event.volunteer.nom }  {event.volunteer.prenom }</p>
                                            <p className="p_details"><strong>Bénéficiaire:</strong> {event.beneficiary.nom }  {event.beneficiary.prenom }</p>
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
                                    <div id="btn_grp">
                                        <button type="button" className="btn_act" onClick={() => setMode('edit')}>Modifier</button>
                                        <button type="button" className="btn_act" onClick={() => deleteEvent(event.ID_Activite)}>Supprimer</button>
                                        <button  type="button" className="btn_act" onClick={handleDownloadPDF}>Télécharger</button>
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

export default EventprvDetails;
