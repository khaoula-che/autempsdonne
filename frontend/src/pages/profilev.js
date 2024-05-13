import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import DatePicker, { registerLocale } from 'react-datepicker';
import fr from 'date-fns/locale/fr'; // Importer le locale français
import 'react-datepicker/dist/react-datepicker.css';
import 'react-calendar/dist/Calendar.css';
import Calendar from 'react-calendar';
import '../css/profileb.css';
import '../css/admin.css';

import NavMenu from './navMenuVolunteer';

function Profileb() {
  const [userInfo, setUserInfo] = useState(null);
  const [error, setError] = useState(null);


  const logout = async () => {
    try {
      const response = await fetch(' https://au-temps-donne-api.onrender.com/api/beneficiary/logout', {
        method: 'GET',
        credentials: 'include'
      });

      if (response.ok) {
        window.location.href = '/loginb';
      } else {
        console.error('Logout failed:', response.statusText);
      }
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };
  const fetchUserInfo = async () => {
    try {
        const volunteerInfoResponse = await fetch(' https://au-temps-donne-api.onrender.com/api/volunteer/userinfo', {
            method: 'GET',
            credentials: 'include'
          });
    
          if (volunteerInfoResponse.ok) {
            const volunteerData = await volunteerInfoResponse.json();
            setUserInfo(volunteerData.volunteer);
          } else {
            throw new Error('Failed to fetch user info');
          }
    } catch (error) {
      console.error('Error fetching user info:', error);
      setError('Failed to fetch user info');
    }
  };
  const handleDeleteAccount = async () => {
    try {
      const response = await fetch(' https://au-temps-donne-api.onrender.com/api/volunteer/delete', {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        window.location.href = '/loginb';
      } else {
        throw new Error('Failed to delete account');
      }
    } catch (error) {
      console.error('Error deleting account:', error);
      setError('Failed to delete account');
    }
  };
  const handleExportPDF = async () => {
    try {
      const response = await fetch(' https://au-temps-donne-api.onrender.com/api/volunteer/getpdf', {
        method: 'GET',
        credentials: 'include'
      });
  
      if (response.ok) {
        const pdfBlob = await response.blob();
        const url = window.URL.createObjectURL(new Blob([pdfBlob]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'volunteer_info.pdf');
        document.body.appendChild(link);
        link.click();
      } else {
        throw new Error('Failed to export volunteer information as PDF');
      }
    } catch (error) {
      console.error('Error exporting volunteer information as PDF:', error);
      setError('Failed to export volunteer information as PDF');
    }
  };


  registerLocale('fr', fr);

  const [availability, setAvailability] = useState([]);
  const [availabilityData, setAvailabilityData] = useState({
    jour: null,
    heure_debut: '',
    heure_fin: ''
  });
  const [selectedDateAvailability, setSelectedDateAvailability] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedAvailabilityId, setSelectedAvailabilityId] = useState(null);

  const fetchAvailability = async () => {
    try {
      const response = await fetch(' https://au-temps-donne-api.onrender.com/api/volunteer/availability', {
        method: 'GET',
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        const formattedAvailability = data.map(avail => ({
          ...avail,
          jour: new Date(avail.jour + 'T00:00:00Z') // Assurez-vous que les dates sont traitées en tant qu'UTC
        }));
        setAvailability(formattedAvailability);
      } else {
        console.error('Failed to fetch availability:', response.statusText);
      }
    } catch (error) {
      console.error('Error fetching availability:', error);
    }
  };

  const handleAddOrUpdateAvailability = async (e) => {
    e.preventDefault();
    const url = isEditing
      ? ` https://au-temps-donne-api.onrender.com/api/volunteer/updateAvailability/${selectedAvailabilityId}`
      : ' https://au-temps-donne-api.onrender.com/api/volunteer/add-to-availability';

    const method = isEditing ? 'PUT' : 'POST';

    const formattedData = {
      ...availabilityData,
      jour: availabilityData.jour.toISOString().split('T')[0] // Envoyer seulement la date sans l'heure
    };

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify(formattedData)
    });

    if (response.ok) {
      console.log(`Availability ${isEditing ? 'updated' : 'created'} successfully`);
      fetchAvailability();
    } else {
      console.error(`Failed to ${isEditing ? 'update' : 'create'} availability:`, response.statusText);
    }
  };

  const handleEditAvailability = (id) => {
    const avail = availability.find(avail => avail.id_disponibilite === id);
    if (avail) {
      setAvailabilityData({
        jour: new Date(avail.jour),
        heure_debut: avail.heure_debut,
        heure_fin: avail.heure_fin
      });
      setIsEditing(true);
      setSelectedAvailabilityId(id);
    } else {
      console.error(`Availability with ID ${id} not found.`);
    }
  };

  const handleDeleteAvailability = async (id) => {
    try {
      const response = await fetch(` https://au-temps-donne-api.onrender.com/api/volunteer/deleteAvailability/${id}`, {
        method: 'DELETE',
        credentials: 'include'
      });

      if (response.ok) {
        console.log('Availability deleted successfully');
        fetchAvailability();
      } else {
        console.error('Failed to delete availability:', response.statusText);
      }
    } catch (error) {
      console.error('Error deleting availability:', error);
    }
  };

  const handleDateClick = (date) => {
    const selectedDate = new Date(date);
    selectedDate.setHours(0, 0, 0, 0); 
    setAvailabilityData({
      ...availabilityData,
      jour: selectedDate
    });
    const formattedDate = selectedDate.toISOString().split('T')[0];
    const availForDate = availability.find(avail => {
      return new Date(avail.jour).toISOString().split('T')[0] === formattedDate;
    });
    setSelectedDateAvailability(availForDate);
  };

  useEffect(() => {
    fetchAvailability();
    fetchUserInfo();

  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <>
      <NavMenu />
      <div className="profilebbody">
        <section id="bigpieces">
        <div className="user-info">
            <h2 className="title-profile">Information de l'utilisateur :</h2>
            <p><strong>Nom :</strong> {userInfo ? userInfo.nom : ''} {userInfo ? userInfo.prenom : ''}</p>
            <p><strong>Date de naissance :</strong> {userInfo ? userInfo.date_de_naissance : ''}</p>
            <p><strong>Email :</strong> {userInfo ? userInfo.email : ''}</p>
            <p><strong>Téléphone :</strong> {userInfo ? userInfo.telephone : ''}</p>
            <p><strong>Adresse :</strong> {userInfo ? userInfo.adresse : ''}, {userInfo ? userInfo.ville : ''}, {userInfo ? userInfo.code_postal : ''}</p>
            <p><strong>Date d'adhésion :</strong> {userInfo ? userInfo.date_adhesion : ''}</p>
            <p><strong>Genre :</strong> {userInfo ? userInfo.genre : ''}</p>
            <p><strong>Permis de conduire :</strong> {userInfo ? userInfo.permis_conduire : ''}</p>
            <p><strong>Langues :</strong> {userInfo ? userInfo.langues : ''}</p>
            <p><strong>Compétences :</strong> {userInfo ? userInfo.competences : ''}</p>
            <p><strong>Qualités :</strong> {userInfo ? userInfo.qualites : ''}</p>
            <div className="btn-p">

            <button  className="btn_profile"onClick={handleDeleteAccount}>Delete Account</button>
            <button className="btn_profile" onClick={handleExportPDF}>Export as PDF</button>
            <Link to="/updateUserInfo">
              <button className="btn_profile">Update User Info</button>
            </Link>
            </div>
          </div>
          </section>
          <section id="bigpieces">
          <div >
            <h2 className="title-profile">Disponibilités :</h2>
            
            <Calendar
              value={new Date()} // Valeur par défaut du calendrier
              onClickDay={handleDateClick} // Gérer le clic sur une journée
              tileContent={({ date, view }) => {
                const formattedDate = date.toISOString().split('T')[0];
                const hasAvailability = availability.some(avail => avail.jour.toISOString().split('T')[0] === formattedDate);


                return hasAvailability ? <center><p className="day-c"></p></center> : null;

              }}
            />
            {selectedDateAvailability && (
              <div className="selected-availability">
                <p>Le {selectedDateAvailability.jour.toLocaleDateString()} de {selectedDateAvailability.heure_debut} - {selectedDateAvailability.heure_fin}</p>
                <div className="btn-p">
                <button className="btn_profile"onClick={() => handleEditAvailability(selectedDateAvailability.id_disponibilite)}>Modifier</button>
                <button className="btn_profile" onClick={() => handleDeleteAvailability(selectedDateAvailability.id_disponibilite)}>Supprimer</button>
             
                </div>
                </div>
            )}
            
          </div>
          <div className="availability-form">
            <h3 className="title-profile">{isEditing ? 'Modifier la disponibilité' : 'Ajouter une disponibilité'}</h3>
            <form onSubmit={handleAddOrUpdateAvailability}>
              <div className="form-group">
                <label htmlFor="jour">Sélectionner la date :</label>
                <DatePicker
                  selected={availabilityData.jour}
                  onChange={(date) => setAvailabilityData({ ...availabilityData, jour: date })}
                  dateFormat="dd/MM/yyyy"
                  isClearable
                  required
                  showYearDropdown
                  scrollableYearDropdown
                  yearDropdownItemNumber={15}
                  placeholderText="JJ/MM/AAAA"
                  locale="fr" // Utiliser le locale français
                  className="form-control"
                />
              </div>
              <div className="form-group">
                <label htmlFor="heure_debut">Heure de début :</label>
                <input
                  type="time"
                  id="heure_debut"
                  name="heure_debut"
                  value={availabilityData.heure_debut}
                  onChange={(e) => setAvailabilityData({ ...availabilityData, heure_debut: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="heure_fin">Heure de fin :</label>
                <input
                  type="time"
                  id="heure_fin"
                  name="heure_fin"
                  value={availabilityData.heure_fin}
                  onChange={(e) => setAvailabilityData({ ...availabilityData, heure_fin: e.target.value })}
                  required
                />
              </div>
              <button className="btn_profile" type="submit">{isEditing ? 'Modifier' : 'Ajouter'}</button>
            </form>
          </div>
        </section>
      </div>
    </>
  );
}

export default Profileb;
