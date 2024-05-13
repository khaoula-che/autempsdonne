import React, { useEffect, useState } from 'react';
import '../css/admin.css';
import NavMenu from './navMenu';
import { Link, useLocation,useNavigate } from 'react-router-dom';
import addIcon from '../assets/add.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlusCircle } from '@fortawesome/free-solid-svg-icons';
import { faEye  ,faInfoCircle , faTrash, faHandsHelping } from '@fortawesome/free-solid-svg-icons';

function BeneficiaryList() {
    const [beneficiaries, setBeneficiaries] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const location = useLocation();
    const currentPath = location.pathname;
    const [nom, setNom] = useState('');
    const [prenom, setPrenom] = useState('');
    const [email, setEmail] = useState('');
    const [showSuccessAlert, setShowSuccessAlert] = useState(false); 
    const [showSuccessAlertadd, setShowSuccessAlertadd] = useState(false);
    const navigate = useNavigate();


    useEffect(() => {
         fetch(' https://au-temps-donne-api.onrender.com/api/admin/beneficiaires')
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                console.log('Data for beneficiaries retrieved:', data);
                setBeneficiaries(data.filter(b => b.statut_validation.toLowerCase() === 'accepté'));
            })
            .catch(error => {
                console.error('Error fetching beneficiary data:', error);
                alert('Failed to fetch beneficiaries: ' + error.message);
            });

            if (sessionStorage.getItem('successMessage')) {
                setShowSuccessAlertadd(true);
                sessionStorage.removeItem('successMessage'); 
            }else if (sessionStorage.getItem('successMessageDelete')){
                setShowSuccessAlert(true);
                sessionStorage.removeItem('successMessageDelete'); 
        
            }
    }, 
    
    []);

    const confirmDeletion = (email) => {
        if (window.confirm('Are you sure you want to delete this beneficiary?')) {
            fetch(` https://au-temps-donne-api.onrender.com/api/admin/beneficiaires/delete`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email })
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error during the deletion of the beneficiary');
                }
                setBeneficiaries(prev => prev.filter(b => b.email !== email));
                console.log('Beneficiary successfully deleted');
                sessionStorage.setItem('successMessageDelete', 'Bénéficiaire supprimé avec succès!');
                navigate(0)

            })
            
            .catch(error => {
                console.error('Error during deletion:', error);
                alert('Error during the deletion of the beneficiary: ' + error.message);
            });
        }
    };
   
    const ajouterBenef = (event) => {
        event.preventDefault();

        const newBeneficiary = {
            nom,
            prenom,
            email
        };

        fetch(' https://au-temps-donne-api.onrender.com/api/admin/addBeneficiary', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(newBeneficiary)
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erreur lors de l\'ajout du bénévole');
            }
            return response.json();
        })
        .then(data => {
            setBeneficiaries(prevBeneficiaires => [...prevBeneficiaires, data]);
            sessionStorage.setItem('successMessage', 'Bénéficiaire ajouté avec succès!');
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

    const filteredBeneficiaire = beneficiaries.filter(beneficiary =>
        (`${beneficiary.nom} ${beneficiary.email || ''}`).toLowerCase().includes(searchQuery.toLowerCase())
    );
    

    return (
        <>
            <NavMenu />
            <section className="content">
                <section className="lists">
                    <div className="list_type">
                        <Link to="/admin/list" className={currentPath === '/admin/list' ? 'active' : 'link_list'}>Bénévole</Link>
                        <Link to="/admin/beneficiaires" className={currentPath === '/admin/beneficiaires' ? 'active' : 'link_list'} style={currentPath === '/admin/beneficiaires' ? { color: '#D23939' } : null}>Bénéficiaries</Link>
                        <Link to="/admin/partners" className={`link_list ${currentPath === '/admin/partners' ? '' : 'link_list'}`}>Partenaires</Link>
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
                            Bénéficiaire supprimé avec succès!
                        </div>
                    )}
                    {showSuccessAlertadd && (
                        <div className="alert success">
                            Bénéficiaire ajouté avec succès!
                        </div>
                    )}
                    <div className="table-header">
                        <h3 className="title_dashboard">Liste Beneficiaries</h3>
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
                            {filteredBeneficiaire.map(beneficiary => (
                                    <tr key={beneficiary.email}>
                                        <td>{beneficiary.nom} {beneficiary.prenom}</td>
                                        <td>{beneficiary.email}</td>
                                        <td>{beneficiary.telephone}</td>
                                        <td className="action">
                                            <a href={`consult.php?name=${encodeURIComponent(beneficiary.nom)}&surname=${encodeURIComponent(beneficiary.prenom)}`} ><FontAwesomeIcon icon={faEye } style={{ color: 'blue', 'paddingRight': "10px" }}/></a>
                                            <button  id="trash" onClick={() => confirmDeletion(beneficiary.email)} ><FontAwesomeIcon icon={faTrash}/></button>
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
                    {showSuccessAlert && (
                    <div className="alert success">
                        Bénéficiaire ajouté avec succès!
                    </div>
                )}
                    <form id="volunteerForm" onSubmit={ajouterBenef}>
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

export default BeneficiaryList;
