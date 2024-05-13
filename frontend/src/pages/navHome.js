import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { NavLink } from 'react-router-dom';
import '../css/home.css';
import logoImage from '../assets/logo.png';
import LogoDark from '../assets/logo-dark.png';
function NavHome() {
    return (
        <>
         <div id="header">
            <div class="container">
                <h1>
                <a href="../assets/images/logo.png" class="logo">Au temps donnée</a>
                <img src={logoImage}class="logo"/>
                </h1>
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
                        <span>A Propos de Nous</span>

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

                <li>
                <a href="#" class="navbar-link" data-nav-link>
                <span>Contact</span>

                <ion-icon name="chevron-forward-outline" aria-hidden="true"></ion-icon>
                </a>
                </li>

                </ul>

                </nav>

                <div class="header-action">

                <button class="search-btn" aria-label="Search">
                <ion-icon name="search-outline"></ion-icon>
                </button>

                <button class="btn btn-primary">
                <span>Connexion</span>
                <ion-icon name="enter-outline"aria-hidden="true"></ion-icon>
                </button>

                </div>

            </div>
        </div>
                       
        </>
    );
}

export default NavHome;
