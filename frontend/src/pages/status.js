import React, { useState, useEffect } from 'react';
import '../css/admin.css';
import NavMenu from './navMenu';
import { useNavigate  } from 'react-router-dom'; 
function Status() {
    const [data, setData] = useState([]);
    const [filter, setFilter] = useState('all');
    const navigate = useNavigate();
    const [filterStatus, setFilterStatus] = useState('all');
    const [filterType, setFilterType] = useState('all');



    useEffect(() => {
        fetch('https://au-temps-donne-api.onrender.com/api/admin/all') 
            .then(response => response.json())
            .then(fetchedData => {
                console.log('Données des bénévoles et bénéficiaires récupérées:', fetchedData);
                setData(fetchedData);
            })
            .catch(error => console.error('Erreur lors de la récupération des données:', error));
    }, []);

    const accept = async (email, type) => {
        const newStatus = 'accepté';
        const url = type === 'Benevole' ? 'https://au-temps-donne-api.onrender.com/api/admin/volunteers/update-status' : 'https://au-temps-donne-api.onrender.com/api/admin/beneficiaires/update-status';
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, newStatus })
            });
    
            if (response.ok) {
                console.log('Statut mis à jour avec succès');
                setData(data.map(item => item.email === email ? { ...item, statut_validation: 'accepté' } : item));
            } else {
                throw new Error('Erreur lors de la mise à jour du statut.');
            }
        } catch (error) {
            console.error('Erreur lors de la mise à jour du statut :', error);
        }
    };

    const reject = async (email, type) => {
        const newStatus = 'refusé';
        const url = type === 'Benevole' ? 'https://au-temps-donne-api.onrender.com/api/admin/volunteers/update-status' : 'https://au-temps-donne-api.onrender.com/api/admin/beneficiaires/update-status';
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, newStatus })
            });
    
            if (response.ok) {
                console.log('Statut mis à jour avec succès');
                setData(data.map(item => item.email === email ? { ...item, statut_validation: 'refusé' } : item));
            } else {
                throw new Error('Erreur lors de la mise à jour du statut.');
            }
        } catch (error) {
            console.error('Erreur lors de la mise à jour du statut :', error);
        }
    };

    const redirectToConsulter = (item) => {
        const typePath = item.type.toLowerCase(); 
        navigate(`/admin/infosUser/${typePath}/${item.email}`);
    };

    
    

    function renderTableRows(filteredData) {
        return filteredData.map(item => {
            let statusClass = '';
            switch(item.statut_validation?.toLowerCase()) { 
                case 'en attente': statusClass = 'attente'; break;
                case 'accepté': statusClass = 'accepte'; break;
                case 'refusé': statusClass = 'refuse'; break;
                default: statusClass = ''; 

                
            }
    
            return (
                <tr key={item.email}>
                    <td>{item.nom} {item.prenom}</td>
                    <td>{item.type}</td>
                    <td>{item.email || 'N/A'}</td>
                    <td className="status"><span className={`status-dot ${statusClass}`}></span> {item.statut_validation || 'N/A'}</td>
                    <td className="action">
                        {item.statut_validation?.toLowerCase() === 'en attente' ? (
                            <div>
                                <button type="button" onClick={() => accept(item.email, item.type)} className="action-btn accepter">Accepter</button>
                                <button type="button" onClick={() => reject(item.email, item.type)} className="action-btn refuser">Refuser</button>
                            </div>
                        ) : ''}
                    </td>
                    <td className="action">
                    <button onClick={() => redirectToConsulter(item)} >ⓘ</button>
                    </td>
                </tr>
            );
        });
    }
    const filteredData = data.filter(item => {
        return (filterType === 'all' || item.type.toLowerCase() === filterType) &&
               (filterStatus === 'all' || item.statut_validation.toLowerCase() === filterStatus);
    });
    const buttonStyle = (buttonFilter) => ({
        color: (filterType === buttonFilter || filterStatus === buttonFilter) ? '#D23939' : 'inherit'
    });
    return (
        <>
            <NavMenu />
            <section className="content">
                <section className="table_statut">
                    <div className="table-header">
                        <h3>Status Candidats</h3>
                    </div>
                    <div className="filters">
                        <button style={buttonStyle('all')} onClick={() => { setFilterType('all'); setFilterStatus('all'); }}>Tous</button>
                        <button style={buttonStyle('benevole')} onClick={() => setFilterType('benevole')}>Bénévoles</button>
                        <button style={buttonStyle('beneficiaire')} onClick={() => setFilterType('beneficiaire')}>Bénéficiaires</button>
                        </div>                    
                    <div className="filters">

                        <button style={buttonStyle('en attente')} onClick={() => setFilterStatus('en attente')}>En Attente</button>
                        <button style={buttonStyle('accepté')} onClick={() => setFilterStatus('accepté')}>Accepté</button>
                        <button style={buttonStyle('refusé')} onClick={() => setFilterStatus('refusé')}>Refusé</button>
                  
                    </div>
                    <div className="table_bnv">
                        <table>
                            <thead>
                                <tr>
                                    <th>Nom Complet</th>
                                    <th>Rôle</th>
                                    <th>Email</th>
                                    <th>Statut</th>
                                    <th>Action</th>
                                    <th></th>
                                    <th></th>

                                </tr>
                            </thead>
                            <tbody>
                                {renderTableRows(filteredData)}
                            </tbody>
                        </table>
                    </div>
                </section>
            </section>
        </>
    );
}

export default Status;
