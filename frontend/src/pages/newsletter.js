import React, { useEffect, useState } from 'react';
import '../css/admin.css';
import NavMenu from './navMenu';
import { Link, redirect, useLocation,useNavigate } from 'react-router-dom';
import addIcon from '../assets/add.png';
function Newsletter() {
    const [newsletter, setNewsletters] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const location = useLocation();
    const currentPath = location.pathname;
    const [email, setEmail] = useState('');
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const [showSuccessAlertadd, setShowSuccessAlertadd] = useState(false);
    const navigate = useNavigate();



    useEffect(() => {
        const fetchNewsletter = async () => {
            try {
                const response = await fetch(' https://au-temps-donne-api.onrender.com/api/newsletter/');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setNewsletters(data);
            } catch (error) {
                console.error('Error fetching  data:', error);
                alert('Failed to fetch : ' + error.message);
            }
        };
        fetchNewsletter();

        if (sessionStorage.getItem('successMessage')) {
            setShowSuccessAlertadd(true);
            sessionStorage.removeItem('successMessage'); 
        }else if (sessionStorage.getItem('successMessageDelete')){
            setShowSuccessAlert(true);
            sessionStorage.removeItem('successMessageDelete'); 

        }
    }, []);

    const addNewsletter = (event) => {
        event.preventDefault();

        const newsletter = {
            email
        };

        fetch(' https://au-temps-donne-api.onrender.com/api/newsletter/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newsletter)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erreur lors de l\'ajout ');
            }
            return response.json();
        })
        .then(data => {
            setNewsletters(prevnewsletter => [...prevnewsletter, data]);
            sessionStorage.setItem('successMessage', ' Ajout avec succès!');
            navigate(0)
        })
        .catch(error => {
            console.error('Erreur lors de l\'ajout:', error);
            alert('Erreur lors de l\'ajout : ' + error.message);
        });

        setEmail('');
    };

    const deleteNewsletter = (email) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ?')) {
            fetch(` https://au-temps-donne-api.onrender.com/api/newsletter/delete`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error during the deletion');
                }


                setNewsletters(prev => prev.filter(b => b.email !== email));
                console.log(' successfully deleted');
                sessionStorage.setItem('successMessageDelete', 'Suppression avec succès!');
                navigate(0)


            })
            .catch(error => {
                console.error('Error during deletion:', error);
                alert('Error during the deletion : ' + error.message);
            });
        }
    };
    
    const handleSearchChange = (event) => setSearchQuery(event.target.value);

    const filteredNewsletter = newsletter.filter(user =>
        (`${user.email || ''}`).toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    
    
    return (
        <>
            <NavMenu />
            <section className="content">
                <section className="lists">
                    <div className="list_type">
                        <Link to="/admin/list" className={currentPath === '/admin/list' ? 'active' : 'link_list'}>Bénévole</Link>
                        <Link to="/admin/beneficiaires" className={currentPath === '/admin/beneficiaires' ? 'active' : 'link_list'} style={currentPath === '/admin/beneficiaires' ? { color: '#D23939' } : null}>Bénéficiaries</Link>
                        <Link to="/admin/partners" className={currentPath === '/admin/partners' ? 'active' : 'link_list'} style={currentPath === '/admin/partners' ? { color: '#D23939' } : null}>Partenaires</Link>
                        <Link to="/admin/newsletter" className={currentPath === '/admin/newsletter' ? 'active' : 'link_list'} style={currentPath === '/admin/newsletter' ? { color: '#D23939' } : null}>Newsletter</Link>
                    </div>
                    <div className="container_search">
                        <div className="add_user">
                            <Link id="add_link" to="#" className="view-all" onClick={() => {
                                document.getElementById('overlay').style.display = 'block';
                                document.getElementById('popupForm').style.display = 'block';
                            }}>
                                <img className="voir-all-icon" style={{paddingRight:"10px"}} height="15px" width="17px" src={addIcon} alt="Voir tout"/>
                                Ajouter
                            </Link>
                        </div>
                        <form className="search" onSubmit={e => e.preventDefault()}>
                            <input
                                type="text"
                                id="searchField"
                                placeholder="Search..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                            />
                        </form>
                    </div>
                    {showSuccessAlert && (
                        <div className="alert delete">
                          Suppression avec succès!
                        </div>
                    )}
                    {showSuccessAlertadd && (
                        <div className="alert success">
                            Ajout avec succès!
                        </div>
                    )}
                    <div className="table-header">
                        <h3 className="title_dashboard">Liste des inscriptions</h3>
                    </div>
                    <div className="table_bnv">
                        <table>
                            <thead>
                                <tr>
                                    <th>Email</th>
                                    <th>Date d'inscription :</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredNewsletter.map(user => (
                                    <tr key={user.email}>
                                        <td>{user.email}</td>
                                        <td>{new Date(user.date_inscription).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })}</td>
                                        <td className="action">
                                            <a className="action-btn details">Envoyer</a>
                                            <button onClick={() => deleteNewsletter(user.email)} className="action-btn refuser">Supprimer</button>
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
                    </button>
                   
                    <form id="volunteerForm" onSubmit={addNewsletter}>
                        <div className="scrollable-content">
                           <label htmlFor="email">Email :</label>
                            <input type="email" id="email" name="email" value={email} onChange={e => setEmail(e.target.value)} required/>
                        </div>
                        <input className="btn_event" type="submit" value="Ajouter"/>
                    </form>
                </div>
            </section>
        </>
    );
}

export default Newsletter;
