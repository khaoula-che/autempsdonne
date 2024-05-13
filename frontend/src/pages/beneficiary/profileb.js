import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../../css/profileb.css';
import NavMenu from '../navMenuBeneficiary';

function Profileb() {
  const [userInfo, setUserInfo] = useState(null);
  const [error, setError] = useState(null);

  const logout = async () => {
    try {
      const response = await fetch('https://au-temps-donne-api.onrender.com/api/beneficiary/logout', {
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

  useEffect(() => {
    async function fetchData() {
      try {
        // Try fetching beneficiary info
        const beneficiaryInfoResponse = await fetch('https://au-temps-donne-api.onrender.com/api/beneficiary/userinfo', {
          method: 'GET',
          credentials: 'include'
        });
    
        if (beneficiaryInfoResponse.ok) {
          const beneficiaryData = await beneficiaryInfoResponse.json();
          setUserInfo(beneficiaryData.beneficiary);
        } else {
          // If fetching beneficiary info fails, try fetching volunteer info
          const volunteerInfoResponse = await fetch('https://au-temps-donne-api.onrender.com/api/volunteer/userinfo', {
            method: 'GET',
            credentials: 'include'
          });
    
          if (volunteerInfoResponse.ok) {
            const volunteerData = await volunteerInfoResponse.json();
            setUserInfo(volunteerData.volunteer);
          } else {
            throw new Error('Failed to fetch user info');
          }
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
        setError('Failed to fetch user info');
      }
    }
    

    fetchData();
  }, []);

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <>
    <NavMenu />
      <body className="profilebbody">
        <section id="bigpieces">
          <div className="user-info">
            <h2 id="profile_title">Informations de l'utilisateur</h2>
            <p><strong>ID :</strong> {userInfo ? userInfo.id : ''}</p>
            <p><strong>Nom :</strong> {userInfo ? userInfo.nom : ''} {userInfo ? userInfo.prenom : ''}</p>
            <p><strong>Date de naissance :</strong> {userInfo ? userInfo.date_de_naissance : ''}</p>
            <p><strong>Email :</strong> {userInfo ? userInfo.email : ''}</p>
            <p><strong>Téléphone :</strong> {userInfo ? userInfo.telephone : ''}</p>
            <p><strong>Adresse :</strong> {userInfo ? userInfo.adresse : ''}, {userInfo ? userInfo.ville : ''}, {userInfo ? userInfo.code_postal : ''}</p>
            <p><strong>Date d'adhésion :</strong> {userInfo ? userInfo.date_adhesion : ''}</p>
            <p><strong>Statut de validation :</strong> {userInfo ? userInfo.statut_validation : ''}</p>
            <p><strong>Genre :</strong> {userInfo ? userInfo.genre : ''}</p>
            <p><strong>Besoin :</strong> {userInfo ? userInfo.besoin : ''}</p>
            <p><strong>Avis Impôt :</strong> <a href= {userInfo ? userInfo.avis_impot || 'N/A' : ''} target="_blank" rel="noopener noreferrer">Voir le document</a></p>
            <p><strong>Date d'inscription :</strong> {userInfo ? userInfo.date_inscription : ''}</p>
            <Link to="/beneficiary/UpdateProfileFormb">
              <button  className="btn_update" >Update</button>
            </Link>
          </div>
        </section>
      </body>
    </>
  );
}

export default Profileb;
