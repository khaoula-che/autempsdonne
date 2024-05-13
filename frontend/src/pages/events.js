import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../css/admin.css';
import NavMenu from './navMenu';
import viewIcon from '../assets/voir_all.png';
import addIcon from '../assets/add.png';
import horlogeIcon from '../assets/horloge.png';

function Event() {
    const [activities, setActivities] = useState([]);
    const [showSuccessAlertadd, setShowSuccessAlertadd] = useState(false);
    const [addresses, setAddresses] = useState([]);
    const [isNewAddress, setIsNewAddress] = useState(false);
    const [selectedAddressId, setSelectedAddressId] = useState('');
    const [street, setStreet] = useState('');
    const [city, setCity] = useState('');
    const [postalCode, setPostalCode] = useState('');
    const [imagePreviewUrl, setImagePreviewUrl] = useState("");
    const [loadingVolunteers, setLoadingVolunteers] = useState(false);
    const [error, setError] = useState(null);
    const [volunteers, setVolunteers] = useState([]);
    const [services, setServices] = useState([]);



    const [formData, setFormData] = useState({
        titre: '',
        description: '',
        nom_service: '',
        date_activite: '',
        heure_debut: '',
        heure_fin: '',
        adresseId: '',
        adresseComplete: '',
        ville: '',
        code_postal: '',
        id_benevole: '',
        id_beneficiaire: ''
        });


    const navigate = useNavigate();

    useEffect(() => {
        fetchActivities();
        fetchAddresses();
        fetchServices();

    }, []);


    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({ ...prevState, [name]: value }));
        fetchServices();

    }, []);

    const fetchActivities = async () => {
        try {
            const response = await fetch(' https://au-temps-donne-api.onrender.com/api/event/activities/latest');
            if (!response.ok) {
                throw new Error('Erreur réseau');
            }
            const data = await response.json();
            setActivities(data);
        } catch (error) {
            console.error('Erreur lors de la récupération des activités:', error);
        }
    };

    const fetchAvailableVolunteers = async () => {
        if (!formData.date_activite || !formData.heure_debut || !formData.heure_fin) {
            setError('Veuillez entrer la date et les heures.');
            return;
        }

        setLoadingVolunteers(true);
        try {
            const response = await fetch(` https://au-temps-donne-api.onrender.com/api/event/benevoleDispo/${formData.date_activite}/${formData.heure_debut}/${formData.heure_fin}`);
            if (!response.ok) throw new Error('Erreur réseau');
            const data = await response.json();
            setVolunteers(data);
            setError(null);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoadingVolunteers(false);
        }
    };

    const handleVolunteerChange = useCallback((e) => {
        const selectedVolunteerId = e.target.value;
        console.log("Selected Volunteer ID:", selectedVolunteerId); 
        setFormData(prevState => ({
            ...prevState,
            id_benevole: selectedVolunteerId
        }));
    }, []);
    


    const fetchAddresses = async () => {
        try {
            const response = await fetch(' https://au-temps-donne-api.onrender.com/api/admin/adresses');
            if (!response.ok) {
                throw new Error('Erreur réseau');
            }
            const data = await response.json();
            setAddresses(data);
        } catch (error) {
            console.error('Erreur lors de la récupération des adresses:', error);
        }
    };
    const handleAddressChange = (event) => {
        const value = event.target.value;
        setIsNewAddress(value === 'new');
        setSelectedAddressId(value); 
      };

      const handleImageChange = (event) => {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image')) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };
      
    const handleSubmit = async (event) => {
        event.preventDefault();
        const formData = new FormData(event.target);
    
        try {
            const response = await fetch(' https://au-temps-donne-api.onrender.com/api/event/addActivity', {
                method: 'POST',
                body: formData,
            });
    
            if (!response.ok) throw new Error('Server or network error');
    
            const result = await response.json(); 
            alert('Activity added successfully!');
            navigate('/admin/activites');
        } catch (error) {
            alert(`Error adding activity: ${error.message}`);
        }
    };
    
    const handleSubmitPv = async (event) => {
            event.preventDefault();
            if (loadingVolunteers) return;
        
            try {
                const response = await fetch(' https://au-temps-donne-api.onrender.com/api/event/addActivityPrive', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(formData)
                });
        
                if (!response.ok) throw new Error('Server or network error');
    
                const result = await response.json(); 
                alert('Activity added successfully!');
                navigate('/admin/activiteprv');
            } catch (error) {
                alert(`Erreur lors de l'ajout de l'activité: ${error.message}`);
            }
    
};
const handleSubmitF = async (event) => {
    event.preventDefault();
    event.preventDefault();
    const formData = new FormData(event.target);
    const jsonFormData = {};

    formData.forEach((value, key) => {
        jsonFormData[key] = value;
    });

try {
    const response = await fetch(' https://au-temps-donne-api.onrender.com/api/event/addFormation', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(jsonFormData)
    });

    if (!response.ok) {
        throw new Error('Erreur réseau ou du serveur');
    }

    const contentType = response.headers.get('content-type');
    let data;

    if (contentType && contentType.includes('application/json')) {
        data = await response.json();
    } else {
        data = await response.text();
    }

    if (typeof data === 'object' && data.error) {
        console.error('Erreur:', data.error);
        alert('Erreur lors de l\'ajout de l\'activité privée: ' + data.error);
    } else {
        console.log('Réponse:', data);
        alert('Activité privée ajoutée avec succès !');
    }
} catch (error) {
    console.error('Erreur lors de l\'ajout de l\'activité:', error);
    alert(`Erreur lors de l'ajout de l'activité: ${error.message}`);
}

};


      
    
    useEffect(() => {
        // Utilisation de useEffect pour gérer les événements DOM et le chargement initial
        const addLink = document.getElementById('add_link');
        const overlay = document.getElementById('overlay');
        const publicButton = document.getElementById('publicButton');
        const privateButton = document.getElementById('privateButton');
        const formationButton = document.getElementById('formationButton');

        addLink.addEventListener('click', () => {
            overlay.style.display = 'block';
            document.getElementById('popupForm').style.display = 'block';
        });

        overlay.addEventListener('click', () => {
            overlay.style.display = 'none';
            document.getElementById('popupForm').style.display = 'none';
        });

        publicButton.addEventListener('click', () => {
            document.getElementById('publicEventForm').style.display = 'block';
            document.getElementById('privateEventForm').style.display = 'none';
            document.getElementById('formationEventForm').style.display = 'none';
            publicButton.classList.add('active');
            privateButton.classList.remove('active');
            formationButton.classList.remove('active');
        });

        privateButton.addEventListener('click', () => {
            document.getElementById('publicEventForm').style.display = 'none';
            document.getElementById('privateEventForm').style.display = 'block';
            document.getElementById('formationEventForm').style.display = 'none';
            privateButton.classList.add('active');
            publicButton.classList.remove('active');
            formationButton.classList.remove('active');
        });

        formationButton.addEventListener('click', () => {
            document.getElementById('publicEventForm').style.display = 'none';
            document.getElementById('privateEventForm').style.display = 'none';
            document.getElementById('formationEventForm').style.display = 'block';
            formationButton.classList.add('active');
            publicButton.classList.remove('active');
            privateButton.classList.remove('active');
        });

        fetchServices(); 
    }, []);

    const fetchServices = async () => {
        try {
            const response = await fetch(' https://au-temps-donne-api.onrender.com/api/event/services');
            if (!response.ok) {
                throw new Error('Problème de réponse réseau');
            }
            const services = await response.json();
            displayServices(services);

        } catch (error) {
            console.error('Erreur lors de la récupération des services:', error.message);
        }
    };

    const displayServices = (services) => {
        const activityTypeSelectPublic = document.getElementById('activityType');
        const activityTypeSelectPrivate = document.getElementById('privateActivityType');

        const fillSelectWithServices = (selectElement) => {
            selectElement.innerHTML = '';

            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = 'Sélectionnez un service';
            selectElement.appendChild(defaultOption);

            services.forEach((service) => {
                const option = document.createElement('option');
                option.value = service.nom;
                option.textContent = service.nom;
                selectElement.appendChild(option);
            });
        };

        fillSelectWithServices(activityTypeSelectPublic);
        fillSelectWithServices(activityTypeSelectPrivate);
    };

    const formatTime = (timeString) => {
        const timeOptions = { hour: '2-digit', minute: '2-digit' };
        const time = new Date(`1970-01-01T${timeString}Z`);
        return time.toLocaleTimeString([], timeOptions);};
    

            const [beneficiaries, setBeneficiaries] = useState([]);
            const [selectedBeneficiary, setSelectedBeneficiary] = useState('');
        
            useEffect(() => {
                fetch('https://au-temps-donne-api.onrender.com/api/admin/beneficiaires')
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Network response was not ok');
                        }
                        return response.json();
                    })
                    .then(data => {
                        console.log('Data for beneficiaries retrieved:', data);
                        // Filtrer et définir uniquement les bénéficiaires avec un statut 'accepté'
                        const acceptedBeneficiaries = data.filter(b => b.statut_validation.toLowerCase() === 'accepté');
                        setBeneficiaries(acceptedBeneficiaries);
                    })
                    .catch(error => {
                        console.error('Error fetching beneficiary data:', error);
                        alert('Failed to fetch beneficiaries: ' + error.message);
                    });
            }, []);
        
            const handleSelectBChange = (e) => {
                const selectedBId = e.target.value;
                setSelectedBeneficiary(e.target.value);
                setFormData(prevState => ({
                    ...prevState,
                    id_beneficiaire: selectedBId
                }));
            };

    return (
        <>
            <NavMenu />
            <section className="content">
                <div className="lists">
                    <div className="table-header">
                        <h2  className="title_dashboard">Gestionnaire des événements</h2>
                        <Link id="add_link" href="#" className="view-all">
                            Ajouter<img className="voir-all-icon" height="15px" width="17px" src={addIcon} alt="Voir tout"/>
                        </Link>
                    </div>

                    {showSuccessAlertadd && (
                        <div className="alert success">
                            Activité ajoutée avec succès!
                        </div>
                    )}

                    <div className="table-header">
                        <h3 className="title_dashboard" >Derniers événements </h3>
                        <Link to="/admin/activites" className="view-all">
                            Voir Tout<img className="voir-all-icon" src={viewIcon} alt="Voir tout" />
                        </Link>
                    </div>

                    <div className="box-container">
                        {activities.map((activity, index) => (
                            <div key={index} className="elm_box">
                                <div className="infos">
                                    <div className="info">
                                        <img height="180px" src={` https://au-temps-donne-api.onrender.com${activity.image}`} style={{ borderRadius: '25px' }} alt={activity.titre} />
                                        <div className="info-container">
                                            <div className="hour">
                                                <img id="img-time" height="20px" src={horlogeIcon} alt="Horloge"/>
                                                <p className="time">{formatTime(activity.heure_debut)} | {activity.date_activite} </p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="info2">
                                        <h3>{activity.titre}</h3>
                                        <hr />
                                        <p>{activity.description}</p>
                                        <div className="adresse">
                                            <p>{activity.lieu.adresse}</p>
                                            <p>{activity.lieu.code_postal} {activity.lieu.ville}</p>
                                        </div>
                                    </div>
                                </div>
                                <Link to={`/admin/activity-details/${activity.id}`} className="view">
                                    Voir plus<img className="voir-all-icon" height="15px" width="17px" src={viewIcon} alt="Voir tout" />
                                </Link>
                            </div>
                        ))}
                    </div>

                    <div id="overlay"></div>
                    <div id="popupForm">
                        <div id="statutButtons">
                            <button className="btn_event_type" id="publicButton">Public</button>
                            <button className="btn_event_type" id="privateButton">Privé</button>
                            <button className="btn_event_type" id="formationButton">Formation</button>
                        </div>

                        <form id="publicEventForm" onSubmit={handleSubmit} encType="multipart/form-data">
                            <div className="scrollable-content">
                                <label htmlFor="activityName">Nom de l'activité:</label>
                                <input type="text" id="activityName" name="titre" required />

                                <label htmlFor="activityDesc">Description:</label>
                                <textarea id="activityDesc" name="description" required></textarea>

                                <div className="form-row">
                                    <label htmlFor="activityType">Service:</label>
                                    <select id="activityType" name="nom_service">
                                        <option value="">Sélectionnez un service</option>
                                    </select>
                                </div>

                                <div className="datetime-row">
                                    <div className="date">
                                        <label htmlFor="activityDate">Date:</label>
                                        <input type="date" id="activityDate" name="date_activite" required />
                                    </div>
                                    <div>
                                        <label htmlFor="activityTimeStart">Heure de début:</label>
                                        <input type="time" id="activityTimeStart" name="heure_debut" required />
                                    </div>
                                    <div>
                                        <label htmlFor="activityTimeEnd">Heure de fin:</label>
                                        <input type="time" id="activityTimeEnd" name="heure_fin" required />
                                    </div>
                                </div>
                                <div className="form-row">
                                {!isNewAddress ? (
                                    <div className="form-row">
                                    <label htmlFor="activityAddress">Adresse:</label>
                                    <select id="activityAddress" name="adresseId" onChange={handleAddressChange} required>
                                        <option value="">Sélectionnez une adresse</option>
                                        <option value="new">Nouvelle adresse</option>
                                        {addresses.map((address) => (
                                        <option key={address.id_lieu} value={address.id_lieu}>
                                            {address.adresse}, {address.code_postal} {address.ville}
                                        </option>
                                        ))}
                                    </select>
                                    </div>
                                ) : (
                                    <div>
                                    <div className="form-row">
                                        <label htmlFor="newAddress">Nouvelle adresse:</label>
                                        <input type="text" id="newAddress" name="adresseComplete" required />
                                    </div>
                                    <div className="form-row">
                                        <label htmlFor="newCity">Ville:</label>
                                        <input type="text" id="newCity" name="ville" required />
                                    </div>
                                    <div id="cp" className="form-row">
                                        <label htmlFor="newPostalCode">Code postal:</label>
                                        <input type="text" id="newPostalCode" name="code_postal" required />
                                    </div>
                                    </div>
                                )}
                                </div>


                                <div className="form-row">
                                    <label htmlFor="volunteerCount">Nombre de bénévoles requis:</label>
                                    <input type="number" id="volunteerCount" name="nb_benevoles" min="1" />
                                </div>
                                <label htmlFor="activityImage">Image:</label>
                                    <input type="file" id="activityImage" name="image" accept="image/*" onChange={handleImageChange} />
                                    {imagePreviewUrl && <img src={imagePreviewUrl} alt="Preview" style={{ width: "100px", height: "100px" }} />}
                                
                                 <input className="btn_event" type="submit" value="Ajouter" />
                            </div>
                        </form>

                        <form id="privateEventForm" onSubmit={handleSubmitPv} style={{ display: 'none' }}>
                        <div className="scrollable-content">

                        <label htmlFor="activityName">Nom de l'activité:</label>
                        <input type="text" id="activityName" name="titre" required minLength="3" onChange={handleChange} />

                        <label htmlFor="activityDesc">Description:</label>
                        <textarea id="activityDesc" name="description" required minLength="10" onChange={handleChange}></textarea>

                        <div className="form-row">
                            <label htmlFor="privateActivityType">Service:</label>
                            <select id="privateActivityType" name="nom_service">
                                <option value="">Sélectionnez un service</option>
                            </select>
                        </div>


                        <div className="datetime-row">
                            <input type="date" id="activityDate" name="date_activite" value={formData.date_activite} onChange={handleChange} required />
                            <input type="time" id="activityTimeStart" name="heure_debut" value={formData.heure_debut} onChange={handleChange} required />
                            <input type="time" id="activityTimeEnd" name="heure_fin" value={formData.heure_fin} onChange={handleChange} required />
                            <button type="button" onClick={fetchAvailableVolunteers} disabled={loadingVolunteers}>Rechercher bénévoles dispos</button>
                        </div>

                        <div className="form-row">
                                {!isNewAddress ? (
                                    <div className="form-row">
                                    <label htmlFor="activityAddress">Adresse:</label>
                                    <select id="activityAddress" name="adresseId" onChange={handleAddressChange} required>
                                        <option value="">Sélectionnez une adresse</option>
                                        <option value="new">Nouvelle adresse</option>
                                        {addresses.map((address) => (
                                        <option key={address.id_lieu} value={address.id_lieu}>
                                            {address.adresse}, {address.code_postal} {address.ville}
                                        </option>
                                        ))}
                                    </select>
                                    </div>
                                ) : (
                                    <div>
                                    <div className="form-row">
                                        <label htmlFor="newAddress">Nouvelle adresse:</label>
                                        <input type="text" id="newAddress" name="adresseComplete" required />
                                    </div>
                                    <div className="form-row">
                                        <label htmlFor="newCity">Ville:</label>
                                        <input type="text" id="newCity" name="ville" required />
                                    </div>
                                    <div id="cp" className="form-row">
                                        <label htmlFor="newPostalCode">Code postal:</label>
                                        <input type="text" id="newPostalCode" name="code_postal" required />
                                    </div>
                                    </div>
                                )}
                                </div>

                        <div className="form-row">
                            <label htmlFor="volunteerSelect">Bénévoles disponibles:</label>
                            <select id="volunteerSelect" name="id_benevole" value={formData.id_benevole} onChange={handleVolunteerChange}>
                                <option value="">Sélectionner un bénévole</option>
                                {loadingVolunteers ? <option>Chargement...</option> : null}
                                {error ? <option disabled>Error: {error}</option> : null}
                                {volunteers.map(volunteer => (
                                    <option key={volunteer.id_benevole} value={volunteer.id_benevole} >
                                        {volunteer.benevole.nom} {volunteer.benevole.prenom}
                                    </option>
                                ))}
                            </select>
                        </div> 
                        <div className="form-row">
                        <label htmlFor="beneficiarySelect">Sélectionnez un bénéficiaire:</label>
                            <select id="beneficiarySelect" value={formData.id} onChange={handleSelectBChange}>
                                <option value="">Sélectionnez un bénéficiaire</option>
                                {beneficiaries.map(beneficiary => (
                                    <option key={beneficiary.id} value={beneficiary.id}>
                                        {beneficiary.nom} {beneficiary.prenom}
                                    </option>
                                ))}
                            </select>
                        </div> 

                        <input className="btn_event" type="submit" value="Ajouter" />
                        </div>
                        </form>

                        <form id="formationEventForm" onSubmit={handleSubmitF} style={{ display: 'none' }}>
                            <div className="scrollable-content">
                            <label for="formationName">Titre de la formation:</label>
                            <input type="text" id="formationName" name="titre" required/>

                            <label for="formationDesc">Description:</label>
                            <textarea id="formationDesc" name="description" required></textarea>
                        
                            <div class="datetime-row">
                                <div class="date">
                                    <label for="formationDateStart">Date de début:</label>
                                    <input type="date" id="formationDateStart" name="date_debut" required/>
                                </div>
                                <div class="date">
                                    <label for="formationDateEnd">Date de fin:</label>
                                    <input type="date" id="formationDateEnd" name="date_fin" required/>
                                </div>
                                <div>
                                    <label for="aformationTimeStart">Heure de début:</label>
                                    <input type="time" id="formationTimeStart" name="heure_debut" required/>
                                </div>
                                <div>
                                    <label for="formationTimeEnd">Heure de fin:</label>
                                    <input type="time" id="formationTimeEnd" name="heure_fin" required/>
                                </div>
                            </div>
                            <div className="form-row">
                                {!isNewAddress ? (
                                    <div className="form-row">
                                    <label htmlFor="activityAddress">Adresse:</label>
                                    <select id="activityAddress" name="adresseId" onChange={handleAddressChange} required>
                                        <option value="">Sélectionnez une adresse</option>
                                        <option value="new">Nouvelle adresse</option>
                                        {addresses.map((address) => (
                                        <option key={address.id_lieu} value={address.id_lieu}>
                                            {address.adresse}, {address.code_postal} {address.ville}
                                        </option>
                                        ))}
                                    </select>
                                    </div>
                                ) : (
                                    <div>
                                    <div className="form-row">
                                        <label htmlFor="newAddress">Nouvelle adresse:</label>
                                        <input type="text" id="newAddress" name="adresseComplete" required />
                                    </div>
                                    <div className="form-row">
                                        <label htmlFor="newCity">Ville:</label>
                                        <input type="text" id="newCity" name="ville" required />
                                    </div>
                                    <div id="cp" className="form-row">
                                        <label htmlFor="newPostalCode">Code postal:</label>
                                        <input type="text" id="newPostalCode" name="code_postal" required />
                                    </div>
                                    </div>
                                )}
                                </div>
                            <input class="btn_event" type="submit" value="Ajouter"/>   
                            </div>
                        </form>
                    </div>
                </div>
            </section>
        </>
    );
}

export default Event;
