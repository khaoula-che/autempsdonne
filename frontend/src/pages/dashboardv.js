import React, { useEffect, useState } from 'react';
import NavMenu from './navMenuVolunteer'; // Removed unused imports: Link, viewIcon, and horlogeIcon

function Dashboardv() {
  const [userInfo, setUserInfo] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [tomorrowDate, setTomorrowDate] = useState(new Date(new Date().setDate(new Date().getDate() + 1)));

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
          const response = await fetch(` https://au-temps-donne-api.onrender.com/api/volunteer/activities-all/${userInfo.id}`);
          if (response.ok) {
            const eventData = await response.json();
            setEvents(eventData);
          } else {
            console.error('Failed to fetch events');
          }
        } catch (error) {
          console.error('Error fetching events:', error);
        }
      }
    }
    fetchEvents();
  }, [userInfo]);

  const upcomingEventsToday = events.filter(event => {
    const eventDate = event.date_activite ? new Date(event.date_activite) :
      event.activity ? new Date(event.activity.date_activite) : null;
    return eventDate && eventDate.toDateString() === currentDate.toDateString();
  });

  const upcomingEventsTomorrow = events.filter(event => {
    const eventDate = event.date_activite ? new Date(event.date_activite) : null;
    return eventDate && eventDate.toDateString() === tomorrowDate.toDateString();
  });
  const formatTime = (timeString) => {
    const timeOptions = { hour: '2-digit', minute: '2-digit' };
    const time = new Date(`1970-01-01T${timeString}Z`);
    return time.toLocaleTimeString([], timeOptions);};

  return (
    <>
          <NavMenu />
      <section className="content">
        <section className="tables">
          <div className="main_table">
            <div>
              <h3 className="title_dashboard">Dernières notifications</h3>
            </div>
          </div>
        </section>
        <div className="table_avenir">
  <h3>À venir</h3>
  <p>Aujourd'hui : {currentDate.toLocaleDateString()}</p>
  {upcomingEventsToday.length ? (
    upcomingEventsToday.map(event => (
    <>
      <div className="avenir_div">
        <p className="time-board"> {formatTime(event.activity && event.activity.heure_debut ? event.activity.heure_debut :event.heure_debut)}</p>
        <div>
        <h3 id="avenir-title">
        {event.activity && event.activity.titre ? event.activity.titre :event.titre}
        </h3>
        <p>{event.activity && event.activity.lieuA && event.activity.lieuA.adresse ? event.activity.lieuA.adresse : event.lieu.adresse}</p>
         <p>{event.activity && event.activity.lieuA && event.activity.lieuA.code_postal  ? event.activity.lieuA.code_postal : event.lieu.code_postal} {event.activity && event.activity.lieuA && event.activity.lieuA.ville  ? event.activity.lieuA.ville : event.lieu.ville}</p>
      
        </div>
      </div>
    </>
 ))

) : (
    <p>Aucun événement prévu pour aujourd'hui.</p>
  )}
  <hr />

  <p id="date-d">Demain : {tomorrowDate.toLocaleDateString()}</p>
  {upcomingEventsTomorrow.length ? (
    upcomingEventsTomorrow.map(event => (
      <>
      <div className="avenir_div">
        <p className="time-board"> {formatTime(event.activity && event.activity.heure_debut ? event.activity.heure_debut :event.heure_debut)}</p>
        <div>
        <h3 id="avenir-title">
        {event.activity && event.activity.titre ? event.activity.titre :event.titre}
        </h3>
        <p>{event.activity && event.activity.lieuA && event.activity.lieuA.adresse ? event.activity.lieuA.adresse : event.lieu.adresse}</p>
         <p>{event.activity && event.activity.lieuA && event.activity.lieuA.code_postal  ? event.activity.lieuA.code_postal : event.lieu.code_postal} {event.activity && event.activity.lieuA && event.activity.lieuA.ville  ? event.activity.lieuA.ville : event.lieu.ville}</p>
      
        </div>
      </div>
    </>
    ))
  ) : (
      <p>Aucun événement prévu pour demain.</p>
      
    )}
</div>
      </section>
    </>
  );
}

export default Dashboardv;
