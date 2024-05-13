import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import useDocumentTitle from '../hooks/useDocumentTitle'; 
import logoImage from '../../assets/logo.png';
import home from '../../assets/home-.png';
import add from '../../assets/add_membre.png';
import membre from '../../assets/membre.png';
import event from '../../assets/gestion.png';
import board from '../../assets/fatrows.png';
import list from '../../assets/1fatrows.png';
import calendar from '../../assets/calendar-light.png';
import blog from '../../assets/doc.png';
import loop from '../../assets/loop.png';
import chat from '../../assets/chat_.png';
import notif from '../../assets/notif.png';
import settings from '../../assets/settings.png';
import exit from '../../assets/exit.png';
import mard from '../../assets/messages.png';
import '../../css/admin.css';

function NavMenu() {
  const location = useLocation();
  const [highlight, setHighlight] = useState({});
  const [userInfo, setUserInfo] = useState(null); 


  const titles = {
    "/partner/dashboard": "Dashboard",
    "/partner/profile": "Profile",
    "/partner/documents": "Documents"

  };
  useEffect(() => {
    async function fetchUserData() {
      try {
        const response = await fetch('https://au-temps-donne-api.onrender.com/api/partenaire/getMe', {
          method: 'GET',
          credentials: 'include'
        });

        if (response.ok) {
          const userData = await response.json();
          setUserInfo(userData.nom); 
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
      "/partner/dashboard": "Dashboard",
      "/partner/profile": "Profile",
      "/partner/documents": "Documents"

    };
    setHighlight({
      ...highlight,
      [location.pathname]: pathHighlight[location.pathname]
    });
  }, [location, highlight]);

  const currentPath = location.pathname.replace(/\/$/, "");

  useEffect(() => {
    const navLinks = document.querySelectorAll('#horiz .nav-link');
    if (navLinks.length > 0) {
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
    }
}, [currentPath]);


  return (
    <>
    <nav className="nav-max">
      <ul className='menu'>
        <li>
          <img src={logoImage} alt="Logo" id="logo-menu" />
        </li>
        <div className="user-info">
          <div>
            <center><h3 >Bienvenue Partenaire</h3></center>

          </div>
      </div>
        <hr className="hr1"/>
        <li className="menu_title">
          <strong><span>MENU</span></strong>
        </li>
        <li className={highlight['/partner/dashboard'] ? "highlighted" : ""}>
          <Link className='nav-link' to="/partner/dashboard">
            <img className="image" src={home} alt="Dashboard"/>
            <span>Dashboard</span>
          </Link>
        </li>
        <li className={highlight['/partner/profile'] ? "highlighted" : ""}>
          <Link className='nav-link' to="/partner/profile">
            <img className="image" src={membre} alt="Members"/>
            <span>Profile</span>
          </Link>
        </li>
        <li className={highlight['/partner/documents'] ? "highlighted" : ""}>
          <Link className='nav-link' to="/partner/documents">
            <img className="image" src={event} alt="Events"/>
            <span>Documents</span>
          </Link>
        </li>

        <hr className="hr2"/>
        <li className="menu_title">
          <strong><span>SUPPORT</span></strong>
        </li>
        <li>
          <Link className='nav-link' to="/partner/Support">
            <img src={settings} alt="/partner/Support"/>
            <span>Contact Support</span>
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
    <section id="horiz2">
      <div className="nav_img">
        <img src={board} alt="Board Icon"/>
        <Link className="nav-link" to="/partner/dashboard">Board</Link>
      </div>
      <div className="nav_img">
        <img src={list} alt="List Icon"/>
        <Link className="nav-link" to="/partner/list">List</Link>
      </div>
      <div className="nav_img">
        <img src={blog} alt="Blog Icon"/>
        <Link className="nav-link" to="/Blogs">Blog</Link>
      </div>
      <div className="search-container">
          <input type="text" placeholder="Search..."/>
          <img height="20px" src={loop} alt="Search Icon"/>
      </div>
      <div id="right1">
          <img height="20px" src={chat} alt="Chat Icon"/>
      </div>
      <div id="right2">
          <img height="20px" src={notif} alt="Notification Icon"/>
      </div>

    </section>
    
  </>
  );
}

export default NavMenu;

