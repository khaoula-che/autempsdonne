import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../../css/updateform.css';

function UpdateProfileForm() {
    const [profileImagePath, setProfileImagePath] = useState('');
    const [userInfo, setUserInfo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [updatedUserInfo, setUpdatedUserInfo] = useState({
        nom: '',
        prenom: '',
        date_de_naissance: '',
        email: '',
        telephone: '',
        adresse: '',
        ville: '',
        code_postal: '',
        genre: '',
        besoin: [],
        // Add more fields as needed
    });

    const handleExportData = () => {
        // Logic to export data
    };

    const handleOpenUpdateForm = () => {
        // Handle opening the update form
    };

    const handleCloseUpdateForm = () => {
        // Handle closing the update form
    };

    const handleUpdateUserInfo = async () => {
        try {
            const updatedData = {
                ...updatedUserInfo,
                besoin: Array.isArray(updatedUserInfo.besoin) ? updatedUserInfo.besoin.join(', ') : updatedUserInfo.besoin
            };
    
            const response = await fetch('https://au-temps-donne-api.onrender.com/api/beneficiary/beneficiary', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify(updatedData),
            });
    
            if (response.ok) {
                console.log('User information updated successfully');
                // Optionally redirect to a success page or update UI
            } else {
                const responseData = await response.json();
                console.error('Failed to update user information:', responseData.error || response.statusText);
                // Handle errors and provide feedback to the user
            }
        } catch (error) {
            console.error('Error updating user information:', error);
            // Handle network errors or other unexpected errors
        }
    };
    

    const handleSubmit = (e) => {
        e.preventDefault();
        handleUpdateUserInfo();
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUpdatedUserInfo((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    const handleAddBesoin = () => {
        const newBesoin = prompt("Enter a new besoin:");
        if (newBesoin) {
            setUpdatedUserInfo(prevData => ({
                ...prevData,
                besoin: [...prevData.besoin, newBesoin.trim()] // Trim whitespace and add newBesoin to the existing array
            }));
        }
    };
    

    const logout = async () => {
        try {
            const response = await fetch('https://au-temps-donne-api.onrender.com/api/beneficiary/logout', {
                method: 'GET',
                credentials: 'include'
            });

            if (response.ok) {
                window.location.href = '/loginb';
            } else {
                console.error('Logout failed:', response.statusText);
            }
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    useEffect(() => {
        async function fetchData() {
            try {
                const userInfoResponse = await fetch('https://au-temps-donne-api.onrender.com/api/beneficiary/userinfo', {
                    method: 'GET',
                    credentials: 'include'
                });

                if (!userInfoResponse.ok) {
                    throw new Error('Failed to fetch user info');
                }

                const userData = await userInfoResponse.json();
                setUserInfo(userData.beneficiary);

                // Initialize updatedUserInfo with user data
                setUpdatedUserInfo(userData.beneficiary);

                setLoading(false);
            } catch (error) {
                console.error('Error fetching data:', error);
                setError('Failed to fetch data');
                setLoading(false);
                window.location.href = '/loginb';
            }
        }

        fetchData();
    }, []);

    if (loading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error}</div>;
    }

    const besoinOptions = [
        "Aide alimentaire",
        "Soutien scolaire",
        "Aide médicale",
        "Activités sociales et récréatives",
        "Assistance sociale",
        "Transport et déplacement",
        "Autres besoins spécifiques"
    ];

    return (            
        
        <div className="update-profile-form-container">
            <h2>Modification des informations</h2>
            <form onSubmit={handleSubmit} className="update-profile-form">
                <div className="form-group">
                    <label htmlFor="nom">Nom:</label>
                    <input
                        type="text"
                        id="nom"
                        name="nom"
                        value={updatedUserInfo.nom}
                        onChange={handleChange}
                        className="form-input"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="prenom">Prénom:</label>
                    <input
                        type="text"
                        id="prenom"
                        name="prenom"
                        value={updatedUserInfo.prenom}
                        onChange={handleChange}
                        className="form-input"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="date_de_naissance">Date de naissance:</label>
                    <input
                        type="text"
                        id="date_de_naissance"
                        name="date_de_naissance"
                        value={updatedUserInfo.date_de_naissance}
                        onChange={handleChange}
                        className="form-input"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="email">Email:</label>
                    <input
                        type="text"
                        id="email"
                        name="email"
                        value={updatedUserInfo.email}
                        onChange={handleChange}
                        disabled
                        className="form-input"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="telephone">Téléphone:</label>
                    <input
                        type="text"
                        id="telephone"
                        name="telephone"
                        value={updatedUserInfo.telephone}
                        onChange={handleChange}
                        className="form-input"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="adresse">Adresse:</label>
                    <input
                        type="text"
                        id="adressee"
                        name="adresse"
                        value={`${updatedUserInfo.adresse}, ${updatedUserInfo.ville}, ${updatedUserInfo.code_postal}`}
                        onChange={handleChange}
                        className="form-input"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="genre">Genre:</label>
                    <input
                        type="text"
                        id="genre"
                        name="genre"
                        value={updatedUserInfo.genre}
                        onChange={handleChange}
                        className="form-input"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="besoin">Catégorie de besoin:</label>
                    <select
                        id="besoin"
                        name="besoin"
                        value={updatedUserInfo.besoin}
                        onChange={handleChange}
                        multiple
                        className="form-input"
                    >
                        {besoinOptions.map((option, index) => (
                            <option key={index} value={option}>{option}</option>
                        ))}
                    </select>
                    <button type="button" onClick={handleAddBesoin}>+</button> {/* Add a button to add a new besoin */}
                </div>
                <button type="submit" className="submit-button">Update</button>
            </form>
        </div>
    );
}

export default UpdateProfileForm;
