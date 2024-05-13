import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../../css/admin.css';
import NavMenu from '../navMenuBeneficiary';
import viewIcon from '../../assets/voir_all.png';
import addIcon from '../../assets/add.png';
import horlogeIcon from '../../assets/horloge.png';
import axios from 'axios';

function Event() {
    const [activities, setActivities] = useState([]);
    const [userInfo, setUserInfo] = useState(null);
    const [events, setEvents] = useState([]);

    useEffect(() => {
      async function fetchUserData() {
          try {
              const response = await fetch('https://au-temps-donne-api.onrender.com/api/beneficiary/userinfo', {
                  method: 'GET',
                  credentials: 'include'
              });

              if (response.ok) {
                  const userData = await response.json();
                  
                  setUserInfo(userData.beneficiary);
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
        if (userInfo) {
            fetch(`https://au-temps-donne-api.onrender.com/api/beneficiary/activities-all/${userInfo.id}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Erreur réseau');
                    }
                    return response.json();
                })
                .then(data => {
                    const limitedEvents = data.slice(0, 2);
                    setEvents(limitedEvents);
                })
                .catch(error => {
                    console.error('Erreur lors de la récupération des données:', error);
                });
        }
    }, [userInfo]);

    useEffect(() => {
        fetch('https://au-temps-donne-api.onrender.com/api/event/activities/latest')
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


    document.addEventListener('DOMContentLoaded', function() {
      fetch('https://au-temps-donne-api.onrender.com/api/event/activities/latest') 
        .then(response => {
          if (!response.ok) {
            throw new Error('Erreur réseau');
          }
          return response.json();
        })
        .then(activities => {
          const container = document.getElementById('boxContainer');
          container.innerHTML = '';
          activities.forEach(activity => {
            const box = document.createElement('div');
            box.className = 'elm_box';
    
            const date = new Date(activity.date_activite);
            const formattedDate = `${date.getHours()}:${date.getMinutes()} ${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;
    
            box.innerHTML = `
              <div class="infos">
                <div class="info">
                  <img height="180px" src="assets/benevole-img.png" style="border-radius: 25px;">
                  <div class="info-container">
                    <div class="hour">
                      <img height="20px" src="assets/horloge.png" style="padding-top:10px;"><p class="time"> className="time-board"> {formatTime(event.activity && event.activity.heure_debut ? event.activity.heure_debut :event.heure_debut)}
                      </p>
                    </div>
                  </div>
                </div>
                <div class="info2">
                  <h3>${activity.titre}</h3>
                  <hr>
                  <p class="description">${activity.description}</p>
                  <div class="adresse">
                    <p>${activity.lieu.adresse}</p>
                    <p>${activity.lieu.code_postal} ${activity.lieu.ville}</p>
                  </div>
                </div>
              </div>
              <a id="details_link" href="javascript:void(0);" class="view">Voir plus<img class="voir-all-icon" height="15px" width="17px" src="assets/voir_all.png" alt="Voir tout"></a>
            `;
    
            container.appendChild(box);
          });
        })
        .catch(error => {
          console.error('Erreur lors de la récupération des données:', error);
        });
    });
    const formatTime = (timeString) => {
        const timeOptions = { hour: '2-digit', minute: '2-digit' };
        const time = new Date(`1970-01-01T${timeString}Z`);
        return time.toLocaleTimeString([], timeOptions);};
    

    return (
        <>
            <NavMenu />
            <section className="content">
                <div className="lists">
                 
                    <div className="table-header">
                        <h3 className="title_dashboard" >Mes evenements a venir :</h3>
                        <Link to="/beneficiary/activity-avenir/${userInfo.id}" className="view-all">Voir Tout<img className="voir-all-icon" src={viewIcon} alt="Voir tout" /></Link>
                        
                    </div>
                    <div className="box-container">
                    {events.map((event, index) => (
                        <div key={index} className="elm_box">
                            <div className="infos">
                                <div className="info">
                                    <img height="180px" src={`${event.image}`} style={{ borderRadius: '25px' }} />
                                    <div className="info-container">
                                        <div className="hour">
                                            <img id="img-time" height="20px" src={horlogeIcon} />
                                            <p className="time"> {formatTime(event.activity && event.activity.heure_debut ? event.activity.heure_debut : event.heure_debut)} | {event.activity && event.activity.date_activite ? event.activity.date_activite : event.date_activite}</p>

                                           </div>
                                    </div>
                                </div>
                                <div className="info2">
                                    <h3>{event.activity && event.activity.titre ? event.activity.titre : event.titre}</h3>
                                    <hr />
                                    <p>{event.activity && event.activity.description  ? event.activity.description : event.description}</p>
                                    <div className="adresse">
                                        <p>{event.activity && event.activity.lieuA && event.activity.lieuA.adresse ? event.activity.lieuA.adresse : event.lieu.adresse}</p>
                                        <p>{event.activity && event.activity.lieuA && event.activity.lieuA.code_postal  ? event.activity.lieuA.code_postal : event.lieu.code_postal} {event.activity && event.activity.lieuA && event.activity.lieuA.ville  ? event.activity.lieuA.ville : event.lieu.ville}</p>
                                    </div>
                                </div>
                            </div>
                            <Link to={`/beneficiary/activity-details/${event.activity && event.activity.ID_Activite  ? event.activity.ID_Activite : event.ID_Activite}`} className="view">
                                Voir plus
                                <img className="voir-all-icon" height="15px" width="17px" src={viewIcon} alt="Voir tout" />
                            </Link>
                        </div>
                    ))}

                    </div>
                    <div></div>
                    <div className="table-header">
                        <h3 className="title_dashboard" >Tous les évènements</h3>
                        <Link to="/beneficiary/all-events" className="view-all">Voir Tout<img className="voir-all-icon" src={viewIcon} alt="Voir tout" /></Link>
                       
                    </div>
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