import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import '../css/home.css';
import '../css/signup.css';  
import '../css/admin.css';
import { Link } from 'react-router-dom';
import logo from '../assets/logo.png';
import img1 from '../assets/img1.png';
import img2 from '../assets/cover-personnes-agees.jpeg';
import img3 from '../assets/Maraude 5 - Une 675.jpeg';
import img4 from '../assets/img4.jpeg';
import img5 from '../assets/deco-img.png';
import img6 from'../assets/subtitle-img-white.png';
import partenaire from '../assets/partenaires.png';
import benevoleimg from '../assets/benevole-img.png';
import benevoles from '../assets/benevoles.png';
import donation from '../assets/donation.png';
import dons from '../assets/dons.png';
import collecte from '../assets/collecte.png';
import aide from '../assets/aide.png';

import youtube from '../assets/youtube.png';
import whatsapp from '../assets/whatsapp.png';
import instagram from '../assets/instagram.png';
import facebook from '../assets/facebook.png';
import logoFooter from '../assets/logo_white.png'
import OneSignalManager from '../components/OneSignalManager';

function Home() {
    const email = "autempsdonne.info@gmail.com";
    const currentYear = new Date().getFullYear(); 
    const handleSignupClick = () => {
      window.location.href = '/signup'; 
    };
    const navigate = useNavigate();

    useEffect(() => {
        const form = document.getElementById('newsletterForm');
        const handleSubmit = (event) => {
            event.preventDefault();
            const email = document.getElementById('emailInput').value;
            const currentDate = new Date().toISOString().slice(0, 10);

            fetch(' https://au-temps-donne-api.onrender.com/api/newsletter/add', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email: email, date_inscription: currentDate })
            })
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
                throw new Error('Erreur lors de l\'inscription à la newsletter');
            })
            .then(data => {
                alert('Vous êtes maintenant inscrit à notre newsletter !');
            })
            .catch(error => {
                document.getElementById('newsletterMessage').innerText = 'Une erreur est survenue. Veuillez réessayer plus tard.';
                console.error('Erreur lors de l\'inscription à la newsletter:', error);
            });
        };
        form.addEventListener('submit', handleSubmit);
        return () => form.removeEventListener('submit', handleSubmit);
    }, []);
  return (
    <>
      <html lang="en" id="html_home">
      <body>
        <header class="header"  data-header>
          <div class="container">
            <div class="div_logo">
            <img src={logo} class="logo"/>
              <p class="logo_title">Au temps donnée</p>
            </div>
            <select name="language" class="lang-switch">
              <option value=""></option>
              <option value="english">English</option>
              <option value="french">French</option>
      
            </select>
            <button class="nav-open-btn" aria-label="Open Menu" data-nav-open-btn>
              <ion-icon name="menu-outline"></ion-icon>
            </button>
      
            <nav class="navbar" data-navbar>
      
              <button class="nav-close-btn" aria-label="Close Menu" data-nav-close-btn>
                <ion-icon name="close-outline"></ion-icon>
              </button>
      
              <img href="../assets/images/logo.png" class="logo"/>
      
              <ul class="navbar-list">
      
                <li>
                  <a href="#Accueil" class="navbar-link" data-nav-link>
                    <span>Accueil</span>
      
                    <ion-icon name="chevron-forward-outline" aria-hidden="true"></ion-icon>
                  </a>
                </li>
      
                <li>
                  <a href="#A_Propost" class="navbar-link" data-nav-link>
                    <span>A Propos</span>
      
              <ion-icon name="chevron-forward-outline" aria-hidden="true"></ion-icon>
          </a>
        </li>
      
        <li>
          <a href="#Evenements" class="navbar-link" data-nav-link>
            <span>Evenements</span>
      
            <ion-icon name="chevron-forward-outline" aria-hidden="true"></ion-icon>
          </a>
        </li>
      
        <li>
          <a href="#Dons" class="navbar-link" data-nav-link>
            <span>Dons</span>
      
            <ion-icon name="chevron-forward-outline" aria-hidden="true"></ion-icon>
          </a>
        </li>
      
        <li>
          <a href="#Blogt" class="navbar-link" data-nav-link>
            <span>Blog</span>
      
            <ion-icon name="chevron-forward-outline" aria-hidden="true"></ion-icon>
          </a>
        </li>
      
    
      
      </ul>
      
      </nav>
      
      <div class="header-action">
        <button class="search-btn" aria-label="Search">
          <ion-icon name="search-outline"></ion-icon>
        </button>
      
        <form action="/loginb">
          <button type="submit" class="btn btn-primary">
              <span>Connexion</span>
              <ion-icon name="enter-outline" aria-hidden="true"></ion-icon>
          </button>
      </form>
      
      </div>
      
      </div>
          </header>
          <main>
            <article>
           
              <section class="hero" id="home">
                <div class="container">

                
                  <p class="section-subtitle">
                    <span>Bienvenue Au temps Donnée</span>
                  </p>
                  <h2 class="h1 hero-title">
                    Ensemble,<br></br><strong>Changeons les choses</strong>
                  </h2>
        
                  <p class="hero-text">
                    Donnons un coup de main à ceux dans le besoin
                  </p>
                  <form action="signup">
                    <button type="submit" onClick={handleSignupClick} class="btn btn-primary">
                        <span>Inscription</span>
                        <ion-icon name="enter-outline" aria-hidden="true"></ion-icon>
                    </button>
                </form>
                </div>
              </section>
              <section>
                <h1 className="title1">Agissez avec nous !</h1>
                <div className="image-container">
                    <div className="image-overlay">
                        <img src={benevoleimg} alt="Bénévole"/>
                        <div className="overlay">
                            <img src={benevoles} height="50px" style={{borderRadius: '30px'}}/>
                            <p style={{fontSize:'20px', paddingBottom:'10px'}}>Bénévoles</p>
                            <p>Votre temps et énergie peuvent transformer des vies. Engagez-vous à nos côtés pour le changement.</p>
                        </div>
                    </div>
                    <div className="image-overlay">
                        <img src={donation} alt="Donation"/>
                        <div className="overlay">
                            <img src={dons} height="50px" style={{borderRadius: '30px'}}/>
                            <p style={{fontSize:'20px', paddingBottom:'10px'}}>Dons</p>
                            <p>Votre générosité est notre force. Aidez-nous à faire la différence avec un simple geste de soutien.</p>
                        </div>
                    </div>
                    <div className="image-overlay">
                        <img src={collecte} alt="Collecte"/>
                        <div className="overlay">
                            <img src={aide} height="50px"/>
                            <p style={{fontSize:'20px', paddingBottom:'10px'}}>Collecte</p>
                            <p>Chaque euro collecté nous rapproche de notre but. Rejoignez notre mission et investissez dans l'avenir.</p>
                        </div>
                    </div>
                </div>
                </section>
              <section class="section about" id="about">
                <div class="container">

                <div class="about-banner">

                    <h2 class="deco-title">About Us</h2>

                    <img src={img5} width="58" height="261" alt="" class="deco-img"/>

                    <div class="banner-row">

                    <div class="banner-col">
                        <img src={img1} width="315" height="380" loading="lazy" alt="Aide_sdf"
                        class="about-img w-100"/>

                        <img src={img2} width="386" height="250" loading="lazy" alt="Personnes_ages"
                        class="about-img about-img-2 w-100"/>
                    </div>

                    <div class="banner-col">
                        <img src={img3} width="250" height="277" loading="lazy" alt="Maraude_5"
                        class="about-img about-img-3 w-100"/>
                        <img src={img4}  width="315" height="380" loading="lazy" alt="Creche"
                        class="about-img w-100"/>
                    </div>
                    </div>
                </div>

                <div class="about-content">

                    <p class="section-subtitle">
                    <img src={img6} width="32" height="7" alt="Wavy line"/>

                    <span>Pourquoi nous rejoindre </span>
                    </p>

                    <h2 class="h2 section-title">
                    Pour tendre une main <strong> à son prochain</strong>
                    </h2>

                    <ul class="tab-nav">

                    <li>
                        <button class="tab-btn active">Notre Mission</button>
                    </li>

                    <li>
                        <button class="tab-btn">Notre Vision</button>
                    </li>

                    <li>
                        <button class="tab-btn">Nos Plans</button>
                    </li>

                    </ul>
                    <div class="tab-content">

                    <p class="section-text">
                    Notre mission est de fournir un soutien continu et essentiel aux communautés les plus vulnérables en facilitant l'accès aux ressources nécessaires telles que la nourriture, l'abri et l'éducation. Nous nous engageons à promouvoir l'égalité, l'inclusion et la dignité pour tous, en concentrant nos efforts sur les interventions directes et le développement de programmes durables qui adressent les causes profondes de la pauvreté et de l'exclusion sociale.
                       
                    </p>

                    <ul class="tab-list">

                        <li class="tab-item">
                        <div class="item-icon">
                            <ion-icon name="checkmark-circle"></ion-icon>
                        </div>

                        <p class="tab-text">Dons pour l'alimentaire</p>
                        </li>

                        <li class="tab-item">
                        <div class="item-icon">
                            <ion-icon name="checkmark-circle"></ion-icon>
                        </div>

                        <p class="tab-text">Dons pour l'éducation</p>
                        </li>

                        <li class="tab-item">
                        <div class="item-icon">
                            <ion-icon name="checkmark-circle"></ion-icon>
                        </div>

                        <p class="tab-text">Assistance administrative </p>
                        </li>

                        <li class="tab-item">
                        <div class="item-icon">
                            <ion-icon name="checkmark-circle"></ion-icon>
                        </div>

                        <p class="tab-text">Assistance personelle</p>
                        </li>

                    </ul>

                    <button class="btn btn-secondary">
                        <span>A propos de nous</span>

                        <ion-icon name="" aria-hidden="true"></ion-icon>
                    </button>

                    </div>
                    </div>

                </div>
            </section>
     
     

  
        <section>
            <div class="newsletter">
                <h1 class="title_newletter">Abonnez-vous à notre newsletter !</h1>
                <p class="p_news">Recevez les dernières actualités, des événements à venir, et des histoires inspirantes de notre association.</p>
                <form class="email_box" id="newsletterForm">
                    <input class="tbox" type="email" name="email" id="emailInput" placeholder="Entrez votre email" required/>
                    <button  class="boxNews"type="submit">Inscription</button>
                </form>
            </div>
        </section>
            </article>

            </main>
            <footer>
        <div class="main_menu">
            <div class ="banner_footer">
                <div class="title_footer">
                    <img src={logoFooter} width="70px" height="60px"/>
                    <p class="footer_title">Au temps donné</p>
                </div>
                <h3>Ensemble changeons les choses</h3>
            </div>
            <div class="second_menu">
                <div class ="menu_footer">
                    <h3 class="title_list">Service</h3>
                    <a href="">Faire un Don</a>
                    <a href="">Devenir Bénévole</a>
                    <a href="">Nos Partenaires</a>
                    <a href="">Evènements</a>
                </div>
                <div class ="menu_footer">
                    <h3 class="title_list">A propos</h3>
                    <a href="">Notre histoire</a>
                    <a href="">Comment ça marche</a>
                    <a href="">S'engager avec Nous</a>
                </div>
                <div className="menu_footer">
                    <h3 className="title_list">Contact</h3>
                    <a href={`mailto:${email}`} className="email_link">Email</a>
                </div>
                <div class ="menu_footer">
                    <h3 class="title_list">Suivez nous</h3>
                    <div class="social-icons">
                        <a href="URL_YOUTUBE"><img src={youtube} alt="YouTube"/></a>
                        <a href="URL_INSTAGRAM"><img src={instagram} alt="Instagram"/></a>
                        <a href="URL_FACEBOOK"><img src={facebook} alt="Facebook"/></a>
                        <a href="URL_WHATSAPP"><img src={whatsapp} alt="WhatsApp"/></a>
                    </div>
                </div>
            </div>
        </div>
        <div class="">
            <hr class="featurette-divider"/>
            <p className="copyright">
            © {currentYear} Au temps donné
        </p>
        </div>
    </footer>

        </body>
        </html>
    </>
  );
}

export default Home;
