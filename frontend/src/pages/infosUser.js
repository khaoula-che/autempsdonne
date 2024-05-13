import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import '../css/admin.css';
import NavMenu from './navMenu';
import retour from '../assets/retour.png';

function InfoUser() {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { typePath, email } = useParams(); 

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(` https://au-temps-donne-api.onrender.com/api/admin/infosUser/${typePath}/${email}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch user data');
                }
                const data = await response.json();
                setUser(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [typePath, email]);

    if (loading) return <p>Loading...</p>;
    if (error) return <p>Error: {error}</p>;

    return (
        <>
            <NavMenu />
            <section className="content">
                <section className="lists">
                <div className="table-h">
                    <Link to="/admin/status" className="back-button">
                        <img id="retour" height="20px" width="20px" src={retour} alt="Retour" />
                    </Link>

                    <h3>Informations de l'utilisateur</h3>
                </div>
                {user ? (
                    <div id="infosUser">
                         <div className="user-info">
                    <h1></h1>
                    <div id="user_infos">
                    <p><strong>Date d'inscription :</strong> {user.date_inscription}</p>
                    <p><strong>Statut :</strong> {user.statut_validation}</p>
                    </div><br/>
                  
                    <p><strong>Nom :</strong> {user.nom} {user.prenom}</p>
                    <p><strong>Genre :</strong> {user.genre}</p>
                    <p><strong>Date de naissance :</strong> {user.date_de_naissance}</p>
                    <p><strong>Email :</strong>  {user.email}</p>
                    <p><strong>Téléphone :</strong> {user.telephone}</p>
                    <p><strong>Adresse :</strong>  {user.adresse},   {user.ville},   {user.code_postal}</p>
                    {typePath === 'beneficiaire' && (
                        <div>
                            <p><strong>Besoin :</strong> {user.besoin}</p>
                            <p><strong>Avis Impôt :</strong> <a href={user.avis_impot} target="_blank" rel="noopener noreferrer">Voir le document</a></p>
                        </div>
                    )}

                    {typePath === 'benevole' && (
                        <div>
                            <p><strong>Compétences :</strong> {user.competences}</p>
                            <p><strong>Qualités :</strong> {user.qualites}</p>
                            <p><strong>Message de candidature :</strong> {user.message_candidature}</p>
                            <p><strong>Casier judiciaire :</strong> <a href={user.casier_judiciaire} target="_blank" rel="noopener noreferrer">Voir le document</a></p>
                            <div id="permis_infos">
                            <p><strong>Permis de conduire :</strong> {user.permis_conduire}</p>
                            {user.permis_conduire === 'oui' && user.justificatif_permis && (
                                <p><strong>Justificatif de permis :</strong> <a href={user.justificatif_permis} target="_blank" rel="noopener noreferrer">Voir le justificatif</a></p>
                            )}
                            </div>
                           
                        </div>
                    )}

                    
                </div>
                    </div>
               
              
            ) : <p>No user data available.</p>}
                   
                </section>
            </section>

                

        </>
    );
}

export default InfoUser;
