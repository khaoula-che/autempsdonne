import React, { useEffect, useState } from 'react';
import '../css/admin.css';
import NavMenu from './navMenu';
import { Link, redirect, useLocation,useNavigate } from 'react-router-dom';
import addIcon from '../assets/add.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { faEye  ,faInfoCircle , faTrash, faHandsHelping } from '@fortawesome/free-solid-svg-icons';

function Partners() {
    const [partenaires, setPartenaires] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const location = useLocation();
    const currentPath = location.pathname;
    const [nom, setNom] = useState('');
    const [email, setEmail] = useState('');
    const [telephone, setTelephone] = useState('');
    const [adresseComplete, setAdresseComplete] = useState('');
    const [ville, setVille] = useState('');
    const [codePostal, setCodePostal] = useState('');
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const [showSuccessAlertadd, setShowSuccessAlertadd] = useState(false);
    const navigate = useNavigate();



    useEffect(() => {
        const fetchPartenaires = async () => {
            try {
                const response = await fetch(' https://au-temps-donne-api.onrender.com/api/admin/Partenaires');
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                const data = await response.json();
                setPartenaires(data);
            } catch (error) {
                console.error('Error fetching partenaires data:', error);
                alert('Failed to fetch partenaires: ' + error.message);
            }
        };
        fetchPartenaires();

        if (sessionStorage.getItem('successMessage')) {
            setShowSuccessAlertadd(true);
            sessionStorage.removeItem('successMessage'); 
        }else if (sessionStorage.getItem('successMessageDelete')){
            setShowSuccessAlert(true);
            sessionStorage.removeItem('successMessageDelete'); 

        }
    }, []);


    const ajouterPartenaire = async (event) => {
        event.preventDefault();
        try {
            const newPartenaire = {
                nom,
                email,
                telephone,
                adresseComplete,
                ville,
                code_postal: codePostal,
            };
            const response = await fetch(' https://au-temps-donne-api.onrender.com/api/admin/addPartenaire', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newPartenaire)
            });

            if (!response.ok) {
                throw new Error('Erreur réseau ou du serveur');
            }

            const contentType = response.headers.get('content-type');
            let data;
            if (contentType && contentType.indexOf('application/json') !== -1) {
                data = await response.json();
            } else {
                const text = await response.text();
                data = { text }; 
            }

            if (data.text) {
                console.log('Réponse en texte:', data.text);
            
            }
            sessionStorage.setItem('successMessage', 'Partenaire ajouté avec succès!');
            navigate(0)
        } catch (error) {
            console.error('Erreur lors de l\'ajout du partenaire:', error);
            alert('Erreur lors de l\'ajout du partenaire: ' + error.message);
        }
    };
    const deletePartenaire = (email) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce Partenaire?')) {
            fetch(` https://au-temps-donne-api.onrender.com/api/admin/Partenaires/delete`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error during the deletion of the Partenaire');
                }


                setPartenaires(prev => prev.filter(b => b.email !== email));
                console.log('Partenaire successfully deleted');
                sessionStorage.setItem('successMessageDelete', 'Partenaire supprimé avec succès!');
                navigate(0)


            })
            .catch(error => {
                console.error('Error during deletion:', error);
                alert('Error during the deletion of the Partenaire: ' + error.message);
            });
        }
    };

    const handleSearchChange = (event) => setSearchQuery(event.target.value);

    const filteredPartenaires = partenaires.filter(partenaire =>
        (`${partenaire.nom} ${partenaire.email || ''}`).toLowerCase().includes(searchQuery.toLowerCase())
    );
    
    
    
    return (
        <>
            <NavMenu />
            <section className="content">
                <section className="lists">
                    <div className="list_type">
                        <Link to="/admin/list" className={currentPath === '/list' ? 'active' : 'link_list'}>Bénévole</Link>
                        <Link to="/admin/beneficiaires" className={currentPath === '/admin/beneficiaires' ? 'active' : 'link_list'} style={currentPath === '/beneficiaires' ? { color: '#D23939' } : null}>Bénéficiaries</Link>
                        <Link to="/admin/partners" className={currentPath === '/admin/partners' ? 'active' : 'link_list'} style={currentPath === '/admin/partners' ? { color: '#D23939' } : null}>Partenaires</Link>
                        <Link to="/admin/newsletter" className={`link_list ${currentPath === '/admin/newsletter' ? '' : 'link_list'}`}>Newsletter</Link>
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
                                placeholder="Search by name or email..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                            />
                        </form>
                    </div>
                    {showSuccessAlert && (
                        <div className="alert success">
                            Partenaire supprimé avec succès!
                        </div>
                    )}
                    {showSuccessAlertadd && (
                        <div className="alert success">
                            Partenaire ajouté avec succès!
                        </div>
                    )}
                    <div className="table-header">
                        <h3 className="title_dashboard">Liste Partenaires</h3>
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
                                {filteredPartenaires.map(partenaire => (
                                    <tr key={partenaire.email}>
                                        <td>{partenaire.nom}</td>
                                        <td>{partenaire.email}</td>
                                        <td>{partenaire.telephone}</td>
                                        <td className="action">
                                            <a href={`consult.php?name=${encodeURIComponent(partenaire.nom)}&surname=${encodeURIComponent(partenaire.email)}`} ><FontAwesomeIcon icon={faEye } style={{ color: 'blue', 'paddingRight': "10px" }}/></a>
                                            <button id="trash" onClick={() => deletePartenaire(partenaire.email)} ><FontAwesomeIcon icon={faTrash}/></button>
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
                   
                    <form id="volunteerForm" onSubmit={ajouterPartenaire}>
                        <div className="scrollable-content">
                            <label htmlFor="nom">Nom :</label>
                            <input type="text" id="nom" name="nom" value={nom} onChange={e => setNom(e.target.value)} required/>

                           <label htmlFor="email">Email :</label>
                            <input type="email" id="email" name="email" value={email} onChange={e => setEmail(e.target.value)} required/>

                            <label htmlFor="telephone">Telephone :</label>
                            <input type="text" id="telephone" name="telephone" value={telephone} onChange={e => setTelephone(e.target.value)} required />
           
                            <label htmlFor="adresse">Adresse :</label>
                            <input type="text" id="adresse" name="adresse" value={adresseComplete} onChange={e => setAdresseComplete(e.target.value)} required/>

                            <label htmlFor="ville">Ville :</label>
                            <input type="text" id="ville" name="ville" value={ville} onChange={e => setVille(e.target.value)} required/>

                            <label htmlFor="codePostal">Code Postal :</label>
                            <input type="text" id="codePostal" name="codePostal" value={codePostal} onChange={e => setCodePostal(e.target.value)} required/>
                        </div>
                        <input className="btn_event" type="submit" value="Ajouter"/>
                    </form>
                </div>
            </section>
        </>
    );
}

export default Partners;
