import React, { useEffect, useState } from 'react';
import '../css/admin.css';
import NavMenu from './navMenu';
import { Link, useNavigate } from 'react-router-dom';
import addIcon from '../assets/add.png';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { faEye  ,faInfoCircle , faTrash, faHandsHelping } from '@fortawesome/free-solid-svg-icons';

function MembreList() {
  const [admins, setAdmins] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [showSuccessAlert, setShowSuccessAlert] = useState(false);
  const [showSuccessAlertadd, setShowSuccessAlertadd] = useState(false);
  const [showFormType, setShowFormType] = useState('new');
  const [volunteers, setVolunteers] = useState([]);
  const [error, setError] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccessAlertAdd, setShowSuccessAlertAdd] = useState(false);

  const handleShowNewForm = () => {
    
    setShowFormType('new');
  };

  const handleShowVolunteerForm = () => {
    setShowFormType('volunteer');
  };

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        const response = await fetch('https://au-temps-donne-api.onrender.com/api/admin/admins');
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setAdmins(data);
      } catch (error) {
        console.error('Error fetching data:', error);
        alert('Failed to fetch: ' + error.message);
      }
    };

    const fetchVolunteers = async () => {
      try {
        const response = await fetch('https://au-temps-donne-api.onrender.com/api/admin/volunteersAdmin');
        if (!response.ok) {
          throw new Error('Réponse réseau non OK');
        }
        const data = await response.json();
        const acceptedVolunteers = data.filter(v => v.statut_validation.toLowerCase() === 'accepté');
        setVolunteers(acceptedVolunteers);
      } catch (error) {
        console.error('Erreur lors de la récupération des volontaires:', error);
      }
    };

    fetchAdmins();
    fetchVolunteers();

    if (sessionStorage.getItem('successMessage')) {
      setShowSuccessAlertadd(true);
      sessionStorage.removeItem('successMessage');
    } else if (sessionStorage.getItem('successMessageDelete')) {
      setShowSuccessAlert(true);
      sessionStorage.removeItem('successMessageDelete');
    }
  }, []);

  const handleSearchChange = event => setSearchQuery(event.target.value);

  const filteredAdmin = admins.filter(volunteer =>
    (`${volunteer.nom} ${volunteer.email || ''}`).toLowerCase().includes(searchQuery.toLowerCase())
  );

  const addNewAdmin = async event => {
    event.preventDefault();
    try {
      const newAdmin = {
        nom,
        prenom,
        email
      };
      const response = await fetch('https://au-temps-donne-api.onrender.com/api/admin/addAdmin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newAdmin)
      });

      if (!response.ok) {
        throw new Error('Erreur réseau ou du serveur');
      }

      const contentType = response.headers.get('content-type');
      let data;
      if (contentType && contentType.indexOf('application/json') !== -1) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = { text };
      }

      if (data.text) {
        console.log('Réponse en texte:', data.text);
      }
      sessionStorage.setItem('successMessage', 'Admin ajouté avec succès!');
      navigate(0);
    } catch (error) {
      console.error('Erreur lors de l\'ajout du partenaire:', error);
      alert('Erreur lors de l\'ajout du partenaire: ' + error.message);
    }
  };

  const deleteAdmin = email => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce admin?')) {
      fetch(` https://au-temps-donne-api.onrender.com/api/admin/delete`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Error during the deletion of the Partenaire');
          }

          setAdmins(prev => prev.filter(b => b.email !== email));
          console.log('Admin successfully deleted');
          sessionStorage.setItem('successMessageDelete', 'Admin supprimé avec succès!');
          navigate(0);
        })
        .catch(error => {
          console.error('Error during deletion:', error);
          alert('Error during the deletion of the admin: ' + error.message);
        });
    }
  };

  const addNewBAdmin = async (event, volunteerEmail) => {
    event.preventDefault();
  
    try {
      const newAdmin = {
        email: volunteerEmail
      };
  
      const response = await fetch(' https://au-temps-donne-api.onrender.com/api/admin/addVolunteerToAdmin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newAdmin)
      });
  
      if (!response.ok) {
        throw new Error('Erreur réseau ou du serveur');
      }
  
      const contentType = response.headers.get('content-type');
      let data;
  
      if (contentType && contentType.indexOf('application/json') !== -1) {
        data = await response.json();
      } else {
        const text = await response.text();
        data = { text };
      }
  
      if (data.text) {
        console.log('Réponse en texte:', data.text);
      }
  
      sessionStorage.setItem('successMessage', 'Admin ajouté avec succès!');
      navigate(0); // Assuming `navigate` is a function to redirect (e.g., from `react-router-dom`)
    } catch (error) {
      console.error('Erreur lors de l\'ajout du partenaire:', error);
      alert('Erreur lors de l\'ajout du partenaire: ' + error.message);
    }
  };

  return (
    <>
      <NavMenu />
      <section className="content">
        <section className="lists">
          <div className="table-header">
            <h2 className="title_dashboard">Gestionnaire des administrateurs</h2>
          </div>
          <div className="container_search">
            <div className="add_user">
              <Link id="add_link" to="#" className="view-all" onClick={() => {
                document.getElementById('overlay').style.display = 'block';
                document.getElementById('popupForm').style.display = 'block';
              }}>
                <img style={{ paddingRight: "10px" }} className="voir-all-icon" height="15px" width="17px" src={addIcon} alt="Voir tout" />
                Ajouter
              </Link>
            </div>
            <form className="search" onSubmit={e => e.preventDefault()}>
              <input
                type="text"
                id="searchField"
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </form>
          </div>
          {showSuccessAlert && (
            <div className="alert success">
              Admin supprimé avec succès!
            </div>
          )}
          {showSuccessAlertadd && (
            <div className="alert success">
              Admin ajouté avec succès!
            </div>
          )}
          <div className="table-header">
            <h3 className="title_dashboard">Liste des administrateurs</h3>
          </div>
          <div className="table_bnv">
            <table>
              <thead>
                <tr>
                  <th>Nom Complet</th>
                  <th>Email</th>
                  <th>Téléphone</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredAdmin.map(admin => (
                  <tr key={admin.email}>
                    <td>{admin.nom} {admin.prenom}</td>
                    <td>{admin.email}</td>
                    <td>{admin.telephone}</td>
                    <td className="action">
                      <Link to={`/consulter.php?nom=${encodeURIComponent(admin.nom)}&prenom=${encodeURIComponent(admin.prenom)}`} ><FontAwesomeIcon icon={faEye } style={{ color: 'blue', 'paddingRight': "10px" }}/></Link>
                      <button id="trash" onClick={() => deleteAdmin(admin.email)} ><FontAwesomeIcon icon={faTrash}/></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
        <div id="overlay" style={{ display: 'none' }}></div>
        <div id="popupForm" style={{ display: 'none' }}>
          <button className="close-btn" onClick={() => {
            document.getElementById('overlay').style.display = 'none';
            document.getElementById('popupForm').style.display = 'none';
          }}>
            <span aria-hidden="true">×</span>
            {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
            {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}

          </button>
          <div id="statutButtons">
            <button className={`btn_event_type ${showFormType === 'new' ? 'active' : ''}`} onClick={handleShowNewForm} id="newButton">Nouveau</button>
            <button className={`btn_event_type ${showFormType === 'volunteer' ? 'active' : ''}`} onClick={handleShowVolunteerForm} id="volunteerButton">Bénévole</button>
          </div>
          <form id="newForm" style={{ display: showFormType === 'new' ? 'block' : 'none' }} onSubmit={addNewAdmin}>
            <div className="scrollable-content">
              <label htmlFor="nom">Nom :</label>
              <input type="text" id="nom" name="nom" value={nom} onChange={e => setNom(e.target.value)} required />

              <label htmlFor="prenom">Prénom :</label>
              <input type="text" id="prenom" name="prenom" value={prenom} onChange={e => setPrenom(e.target.value)} required />

              <label htmlFor="email">Email :</label>
              <input type="email" id="email" name="email" value={email} onChange={e => setEmail(e.target.value)} required />

             
            </div>
            <input className="btn_event" type="submit" value="Ajouter" />
          </form>
          <form id="volunteerForm" style={{ display: showFormType === 'volunteer' ? 'block' : 'none' }}>
              <table>
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Prénom</th>
                    <th>Email</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {volunteers.map(volunteer => (
                    <tr key={volunteer.id}>
                      <td>{volunteer.nom}</td>
                      <td>{volunteer.prenom}</td>
                      <td>{volunteer.email}</td>
                      <td>
                        <button
                          onClick={(event) => addNewBAdmin(event, volunteer.email)}
                        >
              <FontAwesomeIcon icon={faPlusCircle} style={{ color: 'green', fontSize: '24px' }} /></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </form>
        </div>
      </section>
    </>
  );
}

export default MembreList;
