import React, { useEffect, useState } from 'react';
import '../css/homepageb.css';
import { Link } from 'react-router-dom';
import NavMenu from './navMenuVolunteer';
import view from '../assets/voir_all.png';

function Dashboardv() {
  const [profileImagePath, setProfileImagePath] = useState('');
  const [articles, setArticles] = useState([]);
  const [userInfo, setUserInfo] = useState(null); 

  useEffect(() => {
    async function fetchUserData() {
      try {
        const response = await fetch('https://au-temps-donne-api.onrender.com/api/volunteer/userinfo', {
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

  const [currentDate, setCurrentDate] = useState(new Date());



  return (
    <>
        <body class="adminbody">

      <NavMenu />
      <section className="content">
        <section className="tables">
          <div className="main_table">
            <div>
              <h3 className="title_dashboard">Dernières notifications</h3>
            </div>
          </div>
          <div className="main_table">
            
          </div>
        </section>
        <div className="table_avenir">
          <h3 className="title_dashboard">À venir</h3>
          <p id="date">
          <p>Aujourd'hui : {currentDate.toLocaleDateString()}</p>
          </p>
        </div>
      </section> </body>
    </>
  );
}

export default Dashboardv;
