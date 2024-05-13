import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import '../css/admin.css';
import NavMenu from './navMenu';
import retour from '../assets/retour.png';
import jsPDF from 'jspdf';

function ParticipantsBenefList() {
    const { eventId } = useParams();
    const [participants, setParticipants] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [eventDetails, setEventDetails] = useState(null);
    const [sentReminders, setSentReminders] = useState([]);



    useEffect(() => {
        let isMounted = true;

        const fetchParticipants = () => {
            fetch(` https://au-temps-donne-api.onrender.com/api/event/activites/registrationsBenef/${eventId}`)
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

        const fetchEventDetails = () => {
            fetch(` https://au-temps-donne-api.onrender.com/api/event/activites/${eventId}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Failed to fetch event details');
                    }
                    return response.json();
                })
                .then(data => {
                    setEventDetails(data);
                })
                .catch(error => {
                    console.error('Error fetching event details:', error);
                    setError(error.message);
                });
        };


        fetchParticipants();
        fetchEventDetails();


        return () => {
            isMounted = false;
        };
    }, [eventId]);  

        
    const handleDelete = (ID_Beneficiaire) => {
        fetch(` https://au-temps-donne-api.onrender.com/api/event/activites/registrations/${eventId}/beneficiares/${ID_Beneficiaire}`, {
            method: 'DELETE'
        })
        .then(response => {
            if (response.ok) {
                alert("Participant removed successfully.");
                setParticipants(prevParticipants =>
                prevParticipants.filter(participant => participant.ID_Beneficiaire!== ID_Beneficiaire)
                );
            } else {
                alert("Failed to remove participant.");
            }
        })
        .catch(error => {
            console.error('Error removing participant:', error);
            alert("Error removing participant.");
        });
    };

    const handleReminder = (ID_Beneficiaire) => {
        const currentDate = new Date();
        const formattedDate = currentDate.toISOString().slice(0, 19).replace('T', ' '); 

        const eventMessage = `Rappel pour l'événement "${eventDetails.titre}" le ${eventDetails.date_activite} à ${eventDetails.heure_debut}: N'oubliez pas votre participation.`;

        fetch(` https://au-temps-donne-api.onrender.com/api/event/notifications`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id_beneficiaire: ID_Beneficiaire,
                titre: 'Rappel',
                message: eventMessage,
                date_envoi: formattedDate,
            })
        })
        .then(response => {
            if (response.ok) {
                alert("Rappel envoyé avec succès.");
            } else {
                alert("Échec de l'envoi du rappel.");
            }
        })
        .catch(error => {
            console.error('Error sending reminder:', error);
            alert("Erreur lors de l'envoi du rappel.");
        });
        setSentReminders([...sentReminders, ID_Beneficiaire]);
    };

    if (isLoading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <>
            <NavMenu />
            <section className="content">
                <div className="lists">
                    <div className="header">
                        <Link to={`/admin/activity-details/${eventId}`}>
                            <img id="retour" height="20px" width="20px" src={retour} alt="Retour" />
                        </Link>
                        <h3 className='title_event'>Bénéficiaire</h3>
                    </div>
                    <div className="box-container">
                        <div className="elm_boxdetails">
                            <table>
                                <thead>
                                    <tr>
                                        <th>Nom complet</th>
                                        <th>Date d'inscription</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {participants.map(participant => (
                                        <tr key={participant.ID_Beneficiaire}>
                                            <td>{participant.beneficiary.nom} {participant.beneficiary.prenom}</td>
                                            <td>{new Date(participant.Date_Inscription).toLocaleDateString()}</td>
                                            <td className='action_event'>
                                                <button
                                                    onClick={() => handleDelete(participant.ID_Beneficiaire)}
                                                    className="btn-link-supp"
                                                >
                                                    Supprimer
                                                </button>                                                
                                            {sentReminders.includes(participant.ID_Beneficiaire) ? (
                                                <button className="btn-link-env" disabled>Rappel envoyé</button>
                                            ) : (
                                                <button
                                                    onClick={() => handleReminder(participant.ID_Beneficiaire)}
                                                    className="btn-link-rappel"
                                                >
                                                    Envoyer rappel
                                                </button>
                                            )}

                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
    
                    </div>
                </div>
            </section>
        </>
    );
}

export default ParticipantsBenefList;
