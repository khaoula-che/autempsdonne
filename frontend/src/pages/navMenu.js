import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import useDocumentTitle from './hooks/useDocumentTitle'; 
import logoImage from '../assets/logo.png';
import home from '../assets/home-.png';
import add from '../assets/add_membre.png';
import membre from '../assets/membre.png';
import event from '../assets/gestion.png';
import board from '../assets/fatrows.png';
import list from '../assets/1fatrows.png';
import calendar from '../assets/calendar-light.png';
import blog from '../assets/doc.png';
import loop from '../assets/loop.png';
import chat from '../assets/chat_.png';
import notif from '../assets/notif.png';
import settings from '../assets/settings.png';
import exit from '../assets/exit.png';
import mard from '../assets/messages.png';
import '../css/admin.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTruck,faEye,faMap,faSearch , faTrash, faHandsHelping } from '@fortawesome/free-solid-svg-icons';
function NavMenu() {
  const location = useLocation();
  const [highlight, setHighlight] = useState({});
  const [userInfo, setUserInfo] = useState(null); 


  const titles = {
    "/admin/dashboard": "Dashboard",
    "/admin/status": "Status à valider",
    "/admin/membres": "Membres",
    "/admin/events": "Événements",
    "/admin/maraude": "Maraudes",
    "/admin/documents": "Documents"

  };
  useEffect(() => {
    async function fetchUserData() {
      try {
        const response = await fetch(' https://au-temps-donne-api.onrender.com/api/admin/userinfo', {
          method: 'GET',
          credentials: 'include'
        });

        if (response.ok) {
          const userData = await response.json();
          setUserInfo(userData.admin); 
        } else {
          console.error('Failed to fetch user info');
        }
      } catch (error) {
        console.error('Error fetching user info:', error);
      }
    }

    fetchUserData();
  }, []);

  useDocumentTitle(titles[location.pathname] || "Default App Title");
  useEffect(() => {
    const pathHighlight = {
      "/admin/dashboard": "Dashboard",
      "/admin/status": "Status à valider",
      "/admin/membres": "Membres",
      "/admin/events": "Événements",
      "/admin/maraude": "Maraudes",
      "/admin/documents": "Documents"

    };
    setHighlight({
      ...highlight,
      [location.pathname]: pathHighlight[location.pathname]
    });
  }, [location, highlight]);

  const currentPath = location.pathname.replace(/\/$/, "");

  useEffect(() => {
    const navLinks = document.querySelectorAll('#horiz .nav-link');
    navLinks.forEach(link => {
        const linkPath = new URL(link.href).pathname.replace(/\/$/, "");
        if (linkPath === currentPath) {
            link.style.color = "#000000";
            link.style.fontWeight = "bold"; 
            const img = link.previousElementSibling; 
            if (img && img.tagName === 'IMG') {
                img.style.filter = "sepia(1) saturate(10) hue-rotate(-50deg) brightness(0.9) contrast(1.2)";
            }
        }
    });
  }, [currentPath]);

  return (
    <>
    <nav className="nav-max">
      <ul className='menu'>
        <li>
          <img src={logoImage} alt="Logo" id="logo-menu" />
        </li>
        <div className="user-info">
        {userInfo && (
          <div>
            <center><h3 >Bienvenue {userInfo.prenom}</h3></center>

          </div>
        )}
      </div>
        <hr className="hr1"/>
        <li className="menu_title">
          <strong><span>MENU</span></strong>
        </li>
        <li className={highlight['/admin/dashboard'] ? "highlighted" : ""}>
          <Link className='nav-link' to="/admin/dashboard">
            <img className="image" src={home} alt="Dashboard"/>
            <span>Dashboard</span>
          </Link>
        </li>
        <li className={highlight['/admin/status'] ? "highlighted" : ""}>
          <Link className='nav-link' to="/admin/status">
            <img className="image" src={add} alt="Status"/>
            <span>Status à valider</span>
          </Link>
        </li>
        <li className={highlight['/admin/membres'] ? "highlighted" : ""}>
          <Link className='nav-link' to="/admin/membres">
            <img className="image" src={membre} alt="Members"/>
            <span>Membres</span>
          </Link>
        </li>
        <li className={highlight['/admin/events'] ? "highlighted" : ""}>
          <Link className='nav-link' to="/admin/events">
            <img className="image" src={event} alt="Events"/>
            <span>Événements</span>
          </Link>
        </li>
        <li className={highlight['/admin/maraude'] ? "highlighted" : ""}>
          <Link className='nav-link' to="/admin/maraude">
          <FontAwesomeIcon icon={faTruck} style={{ marginLeft:'25px' }} />
            <span>Maraudes</span>
          </Link>
        </li>
        <hr className="hr2"/>
        <li className="menu_title">
          <strong><span>SUPPORT</span></strong>
        </li>
        <li>
          <Link className='nav-link' to="/admin/settings">
            <img src={settings} alt="/admin/Settings"/>
            <span>Paramètres</span>
          </Link>
        </li>
        <li>
          <Link className='nav-link' to="/logout">
            <img src={exit} alt="Exit"/>
            <span>Déconnexion</span>
          </Link>
        </li>
      </ul>
    </nav>
    <section id="horiz">
      <div className="nav_img">
        <img src={board} alt="Board Icon"/>
        <Link className="nav-link" to="/admin/dashboard">Board</Link>
      </div>
      <div className="nav_img">
        <img src={list} alt="List Icon"/>
        <Link className="nav-link" to="/admin/list">List</Link>
      </div>
      <div className="nav_img">
        <img src={calendar} alt="Calendar Icon"/>
        <Link className="nav-link" to="/admin/calendar">Calendar</Link>
      </div>
      <div className="nav_img">
        <img src={blog} alt="Blog Icon"/>
        <Link className="nav-link" to="/admin/blog">Blog</Link>
      </div>
      <div className="search-container">
          <input type="text" placeholder="Search..."/>
          <img height="20px" src={loop} alt="Search Icon"/>
      </div>
      <div id="right1">
          <img height="20px" src={chat} alt="Chat Icon"/>
      </div>
      <div id="right2">
          <img height="10px" src={notif} alt="Notification Icon"/>
      </div>
      <div className="circle">
          <Link to="/admin/profile"><img src="assets/gojo.jpg" alt="Profile"/></Link>
      </div>
    </section>
    
  </>
  );
}

export default NavMenu;

