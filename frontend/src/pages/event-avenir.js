import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import NavMenu from './navMenuVolunteer';
import viewIcon from '../assets/voir_all.png';
import horlogeIcon from '../assets/horloge.png';
import retour from '../assets/retour.png';

function Event() {
    const [events, setEvents] = useState([]);
    const [userInfo, setUserInfo] = useState(null);
    const [filter, setFilter] = useState('all');
    const [errorMessage, setErrorMessage] = useState('');

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
        async function fetchEvents() {
            if (userInfo) {
                try {
                    let response;
                    setErrorMessage('');

                    if (filter === 'Activités') {
                        response = await axios.get(`http://127.0.0.1:8000/api/volunteer/activities/${userInfo.id}`);
                    } else if (filter === 'ActivitésP') {
                        response = await axios.get(` https://au-temps-donne-api.onrender.com/api/volunteer/activities-prv/${userInfo.id}`);
                    } else if (filter === 'all') {
                        response = await axios.get(`https://au-temps-donne-api.onrender.com/api/volunteer/activities-all/${userInfo.id}`);
                    }
                    else if (filter === 'formations') {
                        response = await axios.get(` https://au-temps-donne-api.onrender.com/api/volunteer/formations/${userInfo.id}`);
                    }

                    if (response && response.status === 200) {
                        if (response.data.length === 0) {
                            setErrorMessage('Aucun événement trouvé.');
                            setEvents([]);
                        } else {
                            setEvents(response.data);
                        }
                    } else {
                        console.error('Failed to fetch events');
                        setErrorMessage('Erreur lors de la récupération des événements.');
                        setEvents([]);
                    }
                } catch (error) {
                    console.error('Error fetching events:', error);
                    setErrorMessage('Aucun événement trouvé.');
                    setEvents([]);
                }
            }
        }

        fetchEvents();
    }, [userInfo, filter]);

    const formatTime = (timeString) => {
        const timeOptions = { hour: '2-digit', minute: '2-digit' };
        const time = new Date(`1970-01-01T${timeString}Z`);
        return time.toLocaleTimeString([], timeOptions);
    };

    const renderTableRows = () => {
        return events.map((event, index) => (
            <div key={index} className="elm_box">
                <div className="infos">
                <div className="info">
                        <img height="180px" src={`/assets/${event.image}`} style={{ borderRadius: '25px' }} alt="Event" />
                        <div className="info-container">
                            <div className="hour">
                                <img id="img-time" height="20px" src={horlogeIcon} alt="Horloge" />
                                <p className="time">
                                {formatTime(event.activity && event.activity.heure_debut ? event.activity.heure_debut :event.heure_debut)} |  {event.activity?.date_activite ||  event.formation?.date_debut || event.date_activite}
                                </p>
                            </div>
                        </div>
                    </div>
                    <div className="info2">
                        <h3>{event.activity?.titre || event.titre || event.formation?.titre}</h3>
                        <hr />
                        <p>{event.activity?.description || event.description ||  event.formation?.description}</p>
                        <div className="adresse">
                            <p>{event.activity?.lieuA?.adresse || event.lieu?.adresse || event.formation?.lieuF?.adresse || 'Adresse non disponible'}</p>
                            <p>{event.activity?.lieuA?.code_postal || event.lieu?.code_postal || event.formation?.lieuF?.code_postal || ''} {event.activity?.lieuA?.ville || event.lieu?.ville || event.formation?.lieuF?.ville || ''}</p>
                        </div>

                    </div>
                </div>
                <Link
                to={
                    event.activity?.ID_Activite || event.ID_Activite || (event.formation?.ID_Formation && `/volunteer/formations/${event.formation.ID_Formation}`)
                }
                className="view"
            >
                Voir plus
                <img className="voir-all-icon" height="15px" width="17px" src={viewIcon} alt="Voir tout" />
            </Link>
            </div>
        ));
    };

    const buttonStyle = (buttonFilter) => ({
        color: filter === buttonFilter ? '#D23939' : 'inherit'
    });

    const handleFilterChange = (selectedFilter) => {
        setFilter(selectedFilter);
    };

    return (
        <>
            <NavMenu />
            <section className="content">
                <div className="lists">
                    <div className="container_search">
                        <div className="table-header">
                            <div className="header">
                                <Link to="/volunteer/evenements">
                                    <img id="retour" height="20px" width="20px" src={retour} alt="Retour" />
                                </Link>
                                <h3 className='title_event'>Mes événements à venir :</h3>
                            </div>
                        </div>
                        <form className="search">
                            <input
                                type="text"
                                id="searchField"
                                placeholder="Rechercher ..."
                            />
                        </form>
                    </div>
                    <div className="filters">
                        <button style={buttonStyle('all')} onClick={() => handleFilterChange('all')}>Tous</button>
                        <button style={buttonStyle('Activités')} onClick={() => handleFilterChange('Activités')}>Activités</button>
                        <button style={buttonStyle('ActivitésP')} onClick={() => handleFilterChange('ActivitésP')}>Activités privées</button>
                        <button style={buttonStyle('formations')} onClick={() => handleFilterChange('formations')}>formations</button>
                    </div>
                    <div className="box-container">
                        {errorMessage ? (
                            <p>{errorMessage}</p>
                        ) : (
                            events.length > 0 ? (
                                renderTableRows()
                            ) : (
                                <p>Aucun événement à venir.</p>
                            )
                        )}
                    </div>
                </div>
            </section>
        </>
    );
}

export default Event;
