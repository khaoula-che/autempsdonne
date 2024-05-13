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

function FormationDetails() {
    const { ID_Formation } = useParams();
    const navigate = useNavigate(); 
    const [event, setEvent] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [participants, setParticipants] = useState([]);
    const [participantsBenef, setParticipantsBenef] = useState([]);
    const [mode, setMode] = useState('view');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
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
    const fetchEventDetails = () => {
        fetch(`https://au-temps-donne-api.onrender.com/api/event/formations/${ID_Formation}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erreur réseau');
                }
                return response.json();
            })
            .then(data => {
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
            })
            .catch(error => {
                console.error('Erreur lors de la récupération des détails de l’événement:', error);
            });
    };

    useEffect(() => {
        fetchEventDetails();
        fetchParticipants();
        fetchParticipantsBenef();
    }, [ID_Formation]);

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
        fetch(` https://au-temps-donne-api.onrender.com/api/event/activites/registrations/${ID_Formation}`)
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
        fetch(` https://au-temps-donne-api.onrender.com/api/event/activites/registrationsBenef/${ID_Formation}`)
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
        fetch(` https://au-temps-donne-api.onrender.com/api/event/activites/update/${ID_Formation}`, {
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

    const handleDownloadPDF = () => {
        const doc = new jsPDF();
    
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
        ];
    
        doc.autoTable(eventDetailsColumns, eventDetailsRows, {
            startY: 10,
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
    
        const participantColumns = [
            { header: 'Nom', dataKey: 'nom' },
            { header: 'Prénom', dataKey: 'prenom' }
        ];
        const participantRows = participants.map(participant => ({
            nom: participant.volunteer.nom,
            prenom: participant.volunteer.prenom
        }));
    
        let finalY = doc.lastAutoTable.finalY || 10;
        if (finalY === undefined || finalY >= 280) {
            doc.addPage();
            finalY = 10;
        }
    
        doc.autoTable(participantColumns, participantRows, {
            startY: finalY + 10,
            theme: 'grid',
            styles: { overflow: 'linebreak' },
            columnStyles: { nom: { cellWidth: 90 }, prenom: { cellWidth: 100 } },
            headStyles: { fillColor: [115, 3, 192] }, // Purple header
            margin: { horizontal: 5 },
            bodyStyles: { valign: 'top' },
            showHead: 'firstPage'
        });
    
        doc.save('details_evenement_participants.pdf');
    };

    const handleDownloadBenefPDF = () => {
        const doc = new jsPDF();
    
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
        ];
    
        doc.autoTable(eventDetailsColumns, eventDetailsRows, {
            startY: 10,
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
    
        const participantColumns = [
            { header: 'Nom', dataKey: 'nom' },
            { header: 'Prénom', dataKey: 'prenom' }
        ];
        const participantRows = participantsBenef.map(participantBenef => ({
            nom: participantBenef.beneficiary.nom,
            prenom: participantBenef.beneficiary.prenom
        }));
    
        let finalY = doc.lastAutoTable.finalY || 10;
        if (finalY === undefined || finalY >= 280) {
            doc.addPage();
            finalY = 10;
        }
    
        doc.autoTable(participantColumns, participantRows, {
            startY: finalY + 10,
            theme: 'grid',
            styles: { overflow: 'linebreak' },
            columnStyles: { nom: { cellWidth: 90 }, prenom: { cellWidth: 100 } },
            headStyles: { fillColor: [115, 3, 192] }, // Purple header
            margin: { horizontal: 5 },
            bodyStyles: { valign: 'top' },
            showHead: 'firstPage'
        });
    
        doc.save('details_evenement_participants.pdf');
    };

    function deleteEvent(ID_Formation) {
        fetch(`https://au-temps-donne-api.onrender.com/api/event/formations/delete/${ID_Formation}`, {
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
            navigate('/admin/formations');
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error deleting event: ' + error.message); 
        });
    }
    

    
    useEffect(() => {
        fetchEventDetails();
        fetchParticipants();
    }, [ID_Formation]);
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
                                        <h3>Détails de l'événement</h3>
                                    </div>
                                    <div className="box-container">
                                    <div className="elm_box_details">
                                    <form onSubmit={handleSubmit}>
                                        <div class="event-g">

                                        <label>Titre:
                                            <input
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
                                                name="description"
                                                value={formData.description}
                                                onChange={handleInputChange}
                                            />
                                        </label>
                                        </div>
                                        <div class="event-group">
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
                                        <div class="event-group">
                                            <div class="event-child">
                                            <label>Adresse:
                                            <input
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
                                                type="text"
                                                name="ville"
                                                value={formData.ville}
                                                onChange={handleInputChange}
                                            />
                                        </label>
                                            </div>
                                        
                                        <label>Code Postal:
                                            <input id="postalCode"
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
                                        <Link to="/allEvents"> 
                                            <img id="retour" height="20px" width="20px" src={retour} alt="Retour" /> 
                                        </Link>
                                        <h3 className='title_event'>Détails de l'événement</h3>
                                    </div>
                                    <div className="box-container">
                                        <div className="elm_box_details">
                                    <div className="infos">
                                        <div>
                                        <p id="service">Formation bénévole</p>
                                            <p id="service">{event.nom_service}</p>
                                            <h2>{event.titre}</h2>
                                            <p className="p_details">Description: {event.description || 'No description provided'}</p>
                                        
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
                                            <p>{event.date_debut} - {event.date_fin}</p>
                                        </div>
                                        </div>
                                    </div>
                                    <div id="btn_grp">
                                    <button type="button" className="btn_act" onClick={() => setMode('edit')}>Modifier</button>
                                    <button type="button" className="btn_act" onClick={() => deleteEvent(event.ID_Formation)}>Supprimer</button>


                                    </div>

                                    </div>
                                    </div>
                                    <div className="participant-list">
                                       <div className="header">
                                        <h3 className='title_event'>Liste des participants</h3>
                                        </div>
                                        <div className="list-container">
                                            <div className="list-card">
                                                <h4>Bénévoles</h4>
                                                <Link id="voir" to={`/admin/volunteersF/${ID_Formation}`} className="btn-link">Voir la liste</Link>
                                                <div className="download-button">
                                                    <button  id="download" className="btn-link" onClick={handleDownloadPDF}>Télécharger</button>
                                                </div>
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

export default FormationDetails;