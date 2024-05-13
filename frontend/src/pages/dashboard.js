import React, { useEffect, useState } from 'react';
import '../css/admin.css';
import NavMenu from './navMenu';
import view from '../assets/voir_all.png';

function Dashboard() {
  const [userInfo, setUserInfo] = useState(null);
  const [events, setEvents] = useState([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tomorrowDate, setTomorrowDate] = useState(new Date(new Date().setDate(new Date().getDate() + 1)));

  useEffect(() => {
    async function fetchUserData() {
      try {
        const response = await fetch(' https://au-temps-donne-api.onrender.com/api/admin/all/latest');
        if (response.ok) {
          const data = await response.json();
          console.log('Données des bénévoles et bénéficiaires récupérées:', data);
          // Traitez les données et mettez à jour l'état userInfo si nécessaire
        } else {
          console.error('Failed to fetch user info');
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    }

    async function fetchUpcomingEvents() {
      try {
        const response = await fetch(' https://au-temps-donne-api.onrender.com/api/event/AllActivitesAvenir', {
          method: 'GET',
          credentials: 'include'
        });
        if (response.ok) {
          const eventData = await response.json();
          setEvents(eventData);
        } else {
          console.error('Failed to fetch upcoming events');
        }
      } catch (error) {
        console.error('Error fetching upcoming events:', error);
      }
    }

    fetchUserData();
    fetchUpcomingEvents();
  }, []);

  const formatTime = (timeString) => {
    const timeOptions = { hour: '2-digit', minute: '2-digit' };
    const time = new Date(`1970-01-01T${timeString}Z`);
    return time.toLocaleTimeString([], timeOptions);
  };

  const upcomingEventsToday = events.filter(event => {
    const eventDate = event.date_activite ? new Date(event.date_activite) : (event.activity ? new Date(event.activity.date_activite) : null);
    return eventDate && eventDate.toDateString() === currentDate.toDateString();
  });

  const upcomingEventsTomorrow = events.filter(event => {
    const eventDate = event.date_activite ? new Date(event.date_activite) : null;
    return eventDate && eventDate.toDateString() === tomorrowDate.toDateString();
  });

  return (
    <div className="adminbody">
      <NavMenu />
      <section className="content">
        <section className="tables">
          <div className="main_table">
            <h3 className="title_dashboard">Dernières notifications</h3>
            {/* Affichez les notifications ici */}
          </div>
          <div className="main_table">
            <div className="table-header">
              <h3 className="title_dashboard">Statut des candidats</h3>
              <a href="/admin/status" className="view-all">Voir Tout<img className="voir-all-icon" src={view} alt="View All" /></a>
            </div>
            <div className="table_bnv">
              <table>
                <thead>
                  <tr>
                    <th>Nom Complet</th>
                    <th>Rôle</th>
                    <th>Statut</th>
                  </tr>
                </thead>
                <tbody>
                </tbody>
              </table>
            </div>
          </div>
        </section>
        <div className="table_avenir">
          <h3>À venir</h3>
          <p>Aujourd'hui : {currentDate.toLocaleDateString()}</p>
          {upcomingEventsToday.length ? (
            upcomingEventsToday.map(event => (
              <div className="avenir_div" key={event.id}>
                <p className="time-board">{formatTime(event.activity && event.activity.heure_debut ? event.activity.heure_debut : event.heure_debut)}</p>
                <div>
                  <h3 id="avenir-title">{event.activity && event.activity.titre ? event.activity.titre : event.titre}</h3>
                  <p>{event.activity && event.activity.lieuA && event.activity.lieuA.adresse ? event.activity.lieuA.adresse : event.lieu.adresse}</p>
                  <p>{event.activity && event.activity.lieuA && event.activity.lieuA.code_postal ? event.activity.lieuA.code_postal : event.lieu.code_postal} {event.activity && event.activity.lieuA && event.activity.lieuA.ville ? event.activity.lieuA.ville : event.lieu.ville}</p>
                </div>
              </div>
            ))
          ) : (
              <p>Aucun événement prévu pour aujourd'hui.</p>
            )}
          <hr />
          <p id="date-d">Demain : {tomorrowDate.toLocaleDateString()}</p>
          {upcomingEventsTomorrow.length ? (
            upcomingEventsTomorrow.map(event => (
              <div className="avenir_div" key={event.id}>
                <p className="time-board">{formatTime(event.activity && event.activity.heure_debut ? event.activity.heure_debut : event.heure_debut)}</p>
                <div>
                  <h3 id="avenir-title">{event.activity && event.activity.titre ? event.activity.titre : event.titre}</h3>
                  <p>{event.activity && event.activity.lieuA && event.activity.lieuA.adresse ? event.activity.lieuA.adresse : event.lieu.adresse}</p>
                  <p>{event.activity && event.activity.lieuA && event.activity.lieuA.code_postal ? event.activity.lieuA.code_postal : event.lieu.code_postal} {event.activity && event.activity.lieuA && event.activity.lieuA.ville ? event.activity.lieuA.ville : event.lieu.ville}</p>
                </div>
              </div>
            ))
          ) : (
              <p>Aucun événement prévu pour demain.</p>
            )}
        </div>
      </section>
    </div>
  );
}

export default Dashboard;
