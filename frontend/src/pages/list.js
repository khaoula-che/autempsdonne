import React, { useEffect, useState } from 'react';
import '../css/admin.css';
import NavMenu from './navMenu';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import addIcon from '../assets/add.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { faEye  ,faInfoCircle , faTrash, faHandsHelping } from '@fortawesome/free-solid-svg-icons';

function List() {
    const [volunteers, setVolunteers] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const navigate = useNavigate();
    const [nom, setNom] = useState('');
    const [prenom, setPrenom] = useState('');
    const [email, setEmail] = useState('');
    const location = useLocation();
    const currentPath = location.pathname;
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const [showSuccessAlertadd, setShowSuccessAlertadd] = useState(false);

    useEffect(() => {
        fetch(' https://au-temps-donne-api.onrender.com/api/admin/volunteers')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erreur réseau');
                }
                return response.json();
            })
            .then(data => {
                const acceptedVolunteers = data.filter(v => v.statut_validation.toLowerCase() === 'accepté');
                setVolunteers(acceptedVolunteers);
            })
            .catch(error => {
                console.error('Erreur lors de la récupération des données:', error);
            });
            if (sessionStorage.getItem('successMessage')) {
                setShowSuccessAlertadd(true);
                sessionStorage.removeItem('successMessage'); 
            }else if (sessionStorage.getItem('successMessageDelete')){
                setShowSuccessAlert(true);
                sessionStorage.removeItem('successMessageDelete'); 
    
            }
    }, []);

    const confirmerSuppression = (email) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce bénévole ?')) {
            fetch(` https://au-temps-donne-api.onrender.com/api/admin/volunteers/delete`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Erreur lors de la suppression du bénévole');
                }
                setVolunteers(prevVolunteers => prevVolunteers.filter(v => v.email !== email));
                console.log('Bénévole supprimé avec succès');
                sessionStorage.setItem('successMessageDelete', 'Bénévole supprimé avec succès!');
                navigate(0)
            })
            .catch(error => {
                console.error('Erreur lors de la suppression:', error);
                alert('Erreur lors de la suppression du bénévole: ' + error.message);
            });
        }
    };

    const ajouterBenevole = (event) => {
        event.preventDefault();

        const newVolunteer = {
            nom,
            prenom,
            email,
        };

        fetch(' https://au-temps-donne-api.onrender.com//api/admin/addVolunteer', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newVolunteer)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erreur lors de l\'ajout du bénévole');
            }
            return response.json();
        })
        .then(data => {
            setVolunteers(prevVolunteers => [...prevVolunteers, data]);
            console.log('Bénévole ajouté avec succès');
            sessionStorage.setItem('successMessage', 'Bénévole ajouté avec succès!');
            navigate(0)
        })
        .catch(error => {
            console.error('Erreur lors de l\'ajout:', error);
            alert('Erreur lors de l\'ajout du bénévole: ' + error.message);
        });

        setNom('');
        setPrenom('');
        setEmail('');
    };
    const handleSearchChange = (event) => setSearchQuery(event.target.value);

    const filteredVolunteer = volunteers.filter(volunteer =>
        (`${volunteer.nom} ${volunteer.email || ''}`).toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <>
            <NavMenu />
            <section className="content">
                <section className="lists">
                    <div className="list_type">
                        <Link to="/admin/list" className={currentPath === '/admin/list' ? 'active' : ''} style={{ color: currentPath === '/admin/list' ? '#D23939' : '' }}>Bénévoles</Link>
                        <Link to="/admin/beneficiaires" className={currentPath === '/admin/beneficiaires' ? 'active link_list' : 'link_list'}>Bénéficiaires</Link>
                        <Link to="/admin/partners" className={currentPath === '/admin/partners' ? 'active link_list' : 'link_list'}>Partenaires</Link>
                        <Link to="/admin/newsletter" className={currentPath === '/admin/newsletter' ? 'active' : ''}>Newsletter</Link>
                    </div>
                    <div className="container_search">
                        <div className="add_user">
                            <Link id="add_link" to="#" className="view-all" onClick={() => {
                                document.getElementById('overlay').style.display = 'block';
                                document.getElementById('popupForm').style.display = 'block';
                            }}><img style={{paddingRight:"10px"}} className="voir-all-icon" height="15px" width="17px" src={addIcon} alt="Voir tout"/>
                                Ajouter
                            </Link>
                        </div>
                        <form className="search" onSubmit={e => e.preventDefault()}>
                            <input
                                type="text"
                                id="searchField"
                                placeholder="Search by name or email..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                            />
                        </form>
                    </div>
                    {showSuccessAlert && (
                        <div className="alert success">
                            Bénévole supprimé avec succès!
                        </div>
                    )}
                    {showSuccessAlertadd && (
                        <div className="alert success">
                            Bénévole ajouté avec succès!
                        </div>
                    )}
                    <div className="table-header">
                        <h3 className="title_dashboard">Liste des Bénévoles</h3>
                    </div>
                    <div className="table_bnv">
                        <table>
                            <thead>
                                <tr>
                                    <th>Nom Complet</th>
                                    <th>Email</th>
                                    <th>Téléphone</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                            {filteredVolunteer.map(volunteer => (
                                    <tr key={volunteer.email}>
                                        <td>{volunteer.nom} {volunteer.prenom}</td>
                                        <td>{volunteer.email}</td>
                                        <td>{volunteer.telephone}</td>
                                        <td className="action">
                                            <Link to={`/consulter.php?nom=${encodeURIComponent(volunteer.nom)}&prenom=${encodeURIComponent(volunteer.prenom)}`} ><FontAwesomeIcon icon={faEye } style={{ color: 'blue', 'paddingRight': "10px" }}/></Link>
                                            <button id="trash" onClick={() => confirmerSuppression(volunteer.email)} ><FontAwesomeIcon icon={faTrash}/></button>
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
                   <form id="volunteerForm" onSubmit={ajouterBenevole}>
                        <div className="scrollable-content">
                            <label htmlFor="nom">Nom :</label>
                            <input type="text" id="nom" name="nom" value={nom} onChange={e => setNom(e.target.value)} required/>

                            <label htmlFor="prenom">Prénom :</label>
                            <input type="text" id="prenom" name="prenom" value={prenom} onChange={e => setPrenom(e.target.value)} required/>

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

export default List;
