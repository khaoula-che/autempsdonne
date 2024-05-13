import React, { useEffect, useState } from 'react';
import '../../css/admin.css';
import NavMenu from '../navMenuBeneficiary';
import viewIcon from '../../assets/voir_all.png';
import addIcon from '../../assets/add.png';
import horlogeIcon from '../../assets/horloge.png';
import { Link, useLocation } from 'react-router-dom';
import axios from 'axios';

function Event() {
    const [activities, setActivities] = useState([]);
    const location = useLocation();
    const currentPath = location.pathname;
    const [events, setEvents] = useState([]);
    useEffect(() => {
        fetch('https://au-temps-donne-api.onrender.com/api/event/activites')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erreur réseau');
                }
                return response.json();
            })
            .then(data => {
                setActivities(data);
            })
            .catch(error => {
                console.error('Erreur lors de la récupération des données:', error);
            });
    }, []);

    const formatTime = (timeString) => {
        const timeOptions = { hour: '2-digit', minute: '2-digit' };
        const time = new Date(`1970-01-01T${timeString}Z`);
        return time.toLocaleTimeString([], timeOptions);};
    

    return (
        <>
            <NavMenu />
            <section className="content">
                <div className="lists">
                    
                    <div className="box-container">
                        {activities.map((activity, index) => (
                            <div key={index} className="elm_box">
                                <div className="infos">
                                    <div className="info">
                                        <img height="180px" src={`assets/${activity.image}`} style={{ borderRadius: '25px' }} />
                                        <div className="info-container">
                                            <div className="hour">
                                                <img id="img-time" height="20px" src={horlogeIcon} />
                                                <p className="time">{formatTime(activity.heure_debut)} | {(activity.date_activite)}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="info2">
                                        <h3>{activity.titre}</h3>
                                        <hr />
                                        <p>{activity.description}</p>
                                        <div className="adresse">
                                            <p>{activity.lieu.adresse}</p>
                                            <p>{activity.lieu.code_postal} {activity.lieu.ville}</p>
                                        </div>
                                    </div>
                                </div>
                                <Link to={`/beneficiary/activity-details/${activity.ID_Activite}`} className="view">Voir plus<img className="voir-all-icon" height="15px" width="17px" src={viewIcon} alt="Voir tout" /></Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </>
    );
}

export default Event;
