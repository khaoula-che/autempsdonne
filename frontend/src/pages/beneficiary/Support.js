import React, { useState, useEffect } from 'react';
import NavMenu from '../navMenuBeneficiary';

function Support() {
  const [titre, setTitre] = useState('');
  const [serviceDemande, setServiceDemande] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

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

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    try {
      const requestData = {
        id_beneficiaire: userInfo?.id, // Utilisation de l'opérateur de coalescence nulle pour accéder à userInfo.id en toute sécurité
        titre: titre,
        service: serviceDemande,
        message: message
      };

      const response = await fetch('https://au-temps-donne-api.onrender.com/api/beneficiary/sendServiceRequest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestData)
      });

      if (response.ok) {
        alert('Demande envoyée avec succès !');
        // Réinitialiser les champs après envoi réussi
        setTitre('');
        setServiceDemande('');
        setMessage('');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de l\'envoi de la demande.');
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la demande :', error);
      alert('Erreur lors de l\'envoi de la demande : ' + error.message);
    }

    setIsLoading(false);
  };

  return (
    <>
      <NavMenu />
      <section className="content">
        <section className="tables">
       
          <div style={{padding:"30px"}}className="main_table">
          <h2>Faire une demande de service privé</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="titre">Titre :</label>
              <input
                type="text"
                id="titre"
                value={titre}
                onChange={(e) => setTitre(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="service">Service demandé :</label>
              <select
                id="service"
                value={serviceDemande}
                onChange={(e) => setServiceDemande(e.target.value)}
                required
              >
                <option value="">Sélectionner un service</option>
                <option value="Support Psychologique">Support Psychologique</option>
                <option value="Soutien à l'Emploi">Soutien à l'Emploi</option>
                <option value="Conseil Juridique">Conseil Juridique</option>
                <option value="Services d'Accompagnement Intégral">Services d'Accompagnement Intégral</option>
                <option value="Aide à la Mobilité">Aide à la Mobilité</option>
                <option value="Autre">Autre</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="message">Message :</label>
              <textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              ></textarea>
            </div>
            <button type="submit" disabled={isLoading}>
              {isLoading ? 'Envoi en cours...' : 'Envoyer la demande'}
            </button>
          </form>
          </div>
        </section>
      </section>
    </>
  );
}

export default Support;
