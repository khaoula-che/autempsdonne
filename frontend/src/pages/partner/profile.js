import React, { useEffect, useState } from 'react';
import '../../css/profilec.css';
import NavMenu from './navMenu';
import { Link } from 'react-router-dom';

function Profileb() {
  const [userInfo, setUserInfo] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const userInfoResponse = await fetch('https://au-temps-donne-api.onrender.com/api/partenaire/getuserinfos', {
          method: 'GET',
          credentials: 'include'
        });

        if (!userInfoResponse.ok) {
          throw new Error('Failed to fetch user info');
        }

        const userData = await userInfoResponse.json();
        setUserInfo(userData.partenaire);
      } catch (error) {
        console.error('Error fetching user info:', error);
        setError('Failed to fetch user info');
      }
    }

    fetchData();
  }, []); 

  const handleDeleteAccount = async () => {
    try {
      const response = await fetch('https://au-temps-donne-api.onrender.com/api/partenaire/delete', {
        method: 'DELETE',
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('Failed to delete account');
      }
      setUserInfo(null);
      alert('Account deleted successfully');
    } catch (error) {
      console.error('Error deleting account:', error);
      alert('Failed to delete account');
    }
  };

  const handleModifyInformation = () => {
    // Navigate to update profile route
    window.location.href = '/Partenaire/updateprofile'; 
  };

  const handleChangePassword = () => {
    // Navigate to modify password route
    window.location.href = '/Partenaire/modifypassword';
  };

  const handlePartenaireChange = (e) => {
    const { name, value } = e.target;
    setUserInfo((prevUser) => ({
      ...prevUser,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const requestBody = { ...userInfo };

      const response = await fetch('https://au-temps-donne-api.onrender.com/api/partenaire/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error('Failed to update account');
      }

      alert('Account updated successfully');
    } catch (error) {
      console.error('Error updating account:', error);
      alert('Failed to update account');
    }
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <>
      <NavMenu />
      <div className="profilebbody">
        <section id="bigpieces">
          <div className="user-info">
            <h1>Informations de l'utilisateur</h1>
            {userInfo ? (
              <>
                <p><strong>Nom :</strong> {userInfo.nom} {userInfo.prenom}</p>
                <p><strong>Email :</strong> {userInfo.email}</p>
                <p><strong>Numéro de telephone :</strong> {userInfo.telephone}</p>
                <p><strong>Adresse :</strong> {userInfo.adresse}, {userInfo.ville}, {userInfo.code_postal}</p>

                <div className="btn-p">

                <button className="btn_profile"  to="#" onClick={() => {
                    document.getElementById('overlay2').style.display = 'block';
                    document.getElementById('popupForm2').style.display = 'block';
                }}>
                    Modifier
                </button>
                <button className="btn_profile" onClick={handleDeleteAccount}>Supprimer mon compte</button>
                <button className="btn_profile"  onClick={handleChangePassword}>Modifier mon mot de passe</button>
</div>
                <div id="overlay2" style={{ display: 'none' }}></div>
                    <div id="popupForm2" style={{ display: 'none' }}>
                    <button className="close-btn" onClick={() => {
                            document.getElementById('overlay2').style.display = 'none';
                            document.getElementById('popupForm2').style.display = 'none';
                        }}>
                            <span aria-hidden="true">×</span>
                        </button>
                    <form onSubmit={handleSubmit}>
                        
                            <label>
                                Nom:
                                <input type="text" name="nom" value={userInfo.nom || ''} onChange={handlePartenaireChange} />
                            </label>
                            <label>
                                Email:
                                <input type="text" name="email" value={userInfo.email || ''} onChange={handlePartenaireChange} />
                            </label>
                            <label>
                                Téléphone:
                                <input type="text" name="telephone" value={userInfo.telephone || ''} onChange={handlePartenaireChange} />
                            </label>
                            <label>
                                Adresse:
                                <input type="text" name="telephone" value={userInfo.adresse || ''} onChange={handlePartenaireChange} />
                            </label>

                            <label>
                                Ville:
                                <input type="text" name="telephone" value={userInfo.ville || ''} onChange={handlePartenaireChange} />
                            </label>

                            <label>
                                Code postal:
                                <input type="text" name="telephone" value={userInfo.code_postal || ''} onChange={handlePartenaireChange} />
                            </label>
                            <center><button className="btn_profile"  type="submit">Update</button></center>
                            </form>
                 </div>

                           
              </>
            ) : (
              <p>Chargement en cours...</p>
            )}
          </div>
        </section>
      </div>
    </>
  );
}

export default Profileb;
