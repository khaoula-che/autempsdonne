import React, { useState, useEffect } from 'react';
import axios from 'axios';

function DonsPage() {
    const [campaigns, setCampaigns] = useState([]);

    useEffect(() => {
        async function fetchCampaigns() {
            try {
                const response = await axios.get(' https://au-temps-donne-api.onrender.com/api/campagne/campagnes');
                setCampaigns(response.data.data);
            } catch (error) {
                console.error('Error fetching campaigns:', error);
            }
        }

        fetchCampaigns();
    }, []);

    return (
        <section className="section donate" id="donate">
            <div className="container">
                <ul className="donate-list">
                    {campaigns.map(campagne => (
                        <li key={campagne.ID_Campagne}>
                            <div className="donate-card">
                                <figure className="card-banner">
                                    <img src={campagne.image} alt="Campaign" width="520" height="325" loading="lazy" />
                                </figure>
                                <div className="card-content">
                                    <p>Collected: {campagne.montant_actuel}€</p>
                                    <p>Objective: {campagne.montant_cible}€</p>
                                    <a href="https://buy.stripe.com/test_8wM00Mcgqd2W7PaaEE" target="_blank" className="btn btn-secondary">
                                        Donate
                                    </a>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </section>
    );
}

export default DonsPage;
