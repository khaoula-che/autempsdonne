import React, { useEffect, useState } from 'react';
import Modal from './Modal';
import { Link, useLocation } from 'react-router-dom';

function VolunteerList() {
    const [volunteers, setVolunteers] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const location = useLocation();
    const currentPath = location.pathname;

    useEffect(() => {
        fetch(' https://au-temps-donne-api.onrender.com/api/admin/volunteers')
            .then(response => response.json())
            .then(data => {
                setVolunteers(data.filter(v => v.statut_validation.toLowerCase() === 'accepté'));
            })
            .catch(error => {
                console.error('Failed to fetch volunteers:', error);
            });
    }, []);

    const confirmDeletion = (email) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce bénévole ?')) {
            fetch(` https://au-temps-donne-api.onrender.com/api/admin/volunteers/delete`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email })
            })
            .then(() => {
                setVolunteers(prev => prev.filter(v => v.email !== email));
            })
            .catch(error => {
                console.error('Failed to delete volunteer:', error);
            });
        }
    };

    return (
        <>
            <button onClick={() => setShowModal(true)}>Show Volunteers</button>
            <Modal show={showModal} onClose={() => setShowModal(false)}>
                <div className="lists">
                    <div className="list_type">
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
                                {volunteers.map(volunteer => (
                                    <tr key={volunteer.email}>
                                        <td>{volunteer.nom} {volunteer.prenom}</td>
                                        <td>{volunteer.email}</td>
                                        <td>{volunteer.telephone}</td>
                                        <td className="action">
                                            <button onClick={() => confirmDeletion(volunteer.email)} className="action-btn refuser">Supprimer</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </Modal>
        </>
    );
}

export default VolunteerList;
