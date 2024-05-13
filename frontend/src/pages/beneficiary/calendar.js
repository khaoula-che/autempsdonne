import React, { useState, useEffect } from 'react';
import '../../css/calendarb.css';
import { Link } from 'react-router-dom';
import NavMenu from '../navMenuBeneficiary';

function WeeklyPlanner() {
  const currentDate = new Date();

  const [currentWeekStartDate, setCurrentWeekStartDate] = useState(getStartOfWeek(currentDate));
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedActivity, setSelectedActivity] = useState(null);

  function getStartOfWeek(date) {
    const dayOfWeek = date.getDay();
    const diff = date.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    return new Date(date.setDate(diff));
  }

  const hours = [];
  for (let i = 7; i <= 20; i++) {
    hours.push(i.toString().padStart(2, '0') + ':00');
  }

  const handlePrevWeek = () => {
    const prevWeekStartDate = new Date(currentWeekStartDate);
    prevWeekStartDate.setDate(prevWeekStartDate.getDate() - 7);
    setCurrentWeekStartDate(prevWeekStartDate);
  };

  const handleNextWeek = () => {
    const nextWeekStartDate = new Date(currentWeekStartDate);
    nextWeekStartDate.setDate(nextWeekStartDate.getDate() + 7);
    setCurrentWeekStartDate(nextWeekStartDate);
  };

  async function fetchActivities() {
    try {
      const response = await fetch('https://au-temps-donne-api.onrender.com/api/beneficiary/activites_prives', {
        method: 'GET',
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to fetch activities');
      }

      const data = await response.json();
      console.log('Fetched activities:', data);
      setActivities(data.activites);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching activities:', error);
      setError('Failed to fetch activities. Please try again later.');
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchActivities();
  }, [currentWeekStartDate]);

  const filterActivities = (date, hour) => {
    return activities && Array.isArray(activities) ? activities.filter(activity => {
      const activityDate = new Date(activity.date_activite);
      const activityHour = parseInt(activity.heure_debut.split(':')[0], 10);
      const activityMinute = parseInt(activity.heure_debut.split(':')[1], 10);

      const isSameDate = activityDate.getFullYear() === date.getFullYear() &&
        activityDate.getMonth() === date.getMonth() &&
        activityDate.getDate() === date.getDate();

      const isInRange = activityHour === hour && activityMinute <= 15;

      return isSameDate && isInRange;
    }) : [];
  };

  const handleActivityClick = (activity) => {
    setSelectedActivity(activity);
  };

  const closePopup = () => {
    setSelectedActivity(null);
  };

  const isActivityInPast = (activityDate) => {
    return new Date(activityDate) < currentDate;
  };

  const renderCancelButton = () => {
    if (selectedActivity && isActivityInPast(selectedActivity.date_activite)) {
      return (
        <button type="cancel">Annuler</button>
      );
    }
    return null;
  };

  return (
    <>
    <NavMenu />
    <div id="calendarbodyb">
   
      <div className="weekly-planner">
        <div className="navigation">
          <button onClick={handlePrevWeek}>&lt;</button>
          <span>{currentWeekStartDate.toLocaleDateString('fr-FR', { month: 'long', day: 'numeric' })} - {new Date(currentWeekStartDate.getTime() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR', { month: 'long', day: 'numeric' })}</span>
          <button onClick={handleNextWeek}>&gt;</button>
        </div>
        <table>
          <thead>
            <tr>
              <th>Heure</th>
              {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => (
                <th key={dayIndex}>{new Date(currentWeekStartDate.getTime() + dayIndex * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR', { weekday: 'short' })}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {hours.map((hour, hourIndex) => (
              <tr key={hourIndex}>
                <td>{hour}</td>
                {[0, 1, 2, 3, 4, 5, 6].map((dayIndex) => (
                  <td key={dayIndex}>
                    {filterActivities(new Date(currentWeekStartDate.getTime() + dayIndex * 24 * 60 * 60 * 1000), hourIndex + 7).map(activity => (
                      <center><p key={activity.ID_Activite} onClick={() => handleActivityClick(activity)}>
                        <strong>{activity.titre}</strong>:<br /> {activity.description}
                      </p></center>
                    ))}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Popup for displaying more info */}
      {selectedActivity && (
        <div className="popup">
          <div className="popup-content">
            <span className="close" onClick={closePopup}>&times;</span>
            <h2>{selectedActivity.titre}</h2>
            <p>Date: {selectedActivity.date_activite}</p>
            <p>Description: {selectedActivity.description}</p>
            <p>Heure de début: {selectedActivity.heure_debut}</p>
            <p>Heure de fin: {selectedActivity.heure_fin}</p>
            <p>Bénévole: {selectedActivity.id_benevole}</p>
            <p>Nom Service: {selectedActivity.nom_service}</p>
            {renderCancelButton()}
          </div>
        </div>
      )}
    </div>
    </>
  );
}

export default WeeklyPlanner;