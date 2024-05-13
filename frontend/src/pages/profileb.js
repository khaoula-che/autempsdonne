import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../css/profileb.css';
import logoImage from '../assets/logo.png';
import home from '../assets/home-.png';
import profile from '../assets/profile.png';
import settings from '../assets/settings.png';
import exit from '../assets/exit.png';
import board from '../assets/fatrows.png';
import list from '../assets/1fatrows.png';
import calendar from '../assets/calendar-light.png';
import blog from '../assets/doc.png';
import loop from '../assets/loop.png';
import chat from '../assets/chat_.png';
import notif from '../assets/notif.png';

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
        const userInfoResponse = await fetch('https://au-temps-donne-api.onrender.com/api/beneficiary/userinfo', {
          method: 'GET',
          credentials: 'include'
        });

        if (!userInfoResponse.ok) {
          throw new Error('Failed to fetch user info');
        }

        const userData = await userInfoResponse.json();
        setUserInfo(userData.beneficiary);
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
      <body className="profilebbody">
        <nav className="nav-max">
          <ul className="menu">
            <li>
              <img src={logoImage} alt="Logo" id="logo-menu" />
            </li>
            <hr className="hr1" />
            <li className="menu_title">
              <strong>
                <span>MENU</span>
              </strong>
            </li>
            <li>
              <Link to="/Dashboardb">
                <img className="image" src={home} alt="Dashboard" />
                <span>Dashboard</span>
              </Link>
            </li>
            <li>
              <Link to="/profileb">
                <img className="image" src={profile} alt="Status" />
                <span>Profile</span>
              </Link>
            </li>
            <hr className="hr2" />
            <li className="menu_title">
              <strong>
                <span>SUPPORT</span>
              </strong>
            </li>
            <li>
              <img src={settings} alt="Settings" />
              <span>Paramètres</span>
            </li>
            <li onClick={logout}>
              <img src={exit} alt="Exit" />
              <span>Déconnexion</span>
            </li>
          </ul>
        </nav>
        <section id="horiz">
          <div className="nav_img">
            <img src={board} alt="Board Icon" />
            <Link className="nav-link" to="/dashboard">
              Board
            </Link>
          </div>
          <div className="nav_img">
            <img src={list} alt="List Icon" />
            <Link className="nav-link" to="/list">
              List
            </Link>
          </div>
          <div className="nav_img">
            <img src={calendar} alt="Calendar Icon" />
            <Link className="nav-link" to="/calendarb">
              Calendar
            </Link>
          </div>
          <div className="nav_img">
            <img src={blog} alt="Blog Icon" />
            <Link className="nav-link" to="/blog">
              Blog
            </Link>
          </div>
          <div className="search-container">
            <input type="text" placeholder="Search..." />
            <img height="20px" src={loop} alt="Search Icon" />
          </div>
          <div id="right1">
            <img height="20px" src={chat} alt="Chat Icon" />
          </div>
          <div id="right2">
            <img height="10px" src={notif} alt="Notification Icon" />
          </div>
          <div className="circle_profile">
            <Link to="/profile">
              <img id="picprofile" src={profile} alt="Profile" />
            </Link>
          </div>
        </section>
        <section id="bigpieces">
          <div className="user-info">
            <h1>Informations de l'utilisateur</h1>
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
            <p><strong>Avis Impôt :</strong> {userInfo ? userInfo.avis_impot || 'N/A' : ''}</p>
            <p><strong>Date d'inscription :</strong> {userInfo ? userInfo.date_inscription : ''}</p>
            <Link to="/UpdateProfileFormb">
              <button>Update</button>
            </Link>
          </div>
        </section>
      </body>
    </>
  );
}

export default Profileb;
