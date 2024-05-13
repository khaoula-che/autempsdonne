import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import '../../css/admin.css';
import NavMenu from './navMenu';
import viewIcon from '../../assets/voir_all.png';
import addIcon from '../../assets/add.png';
import horlogeIcon from '../../assets/horloge.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faTrashAlt } from '@fortawesome/free-solid-svg-icons';



function Event() {
    const [products, setProducts] = useState([]);
    const [partenaire, setPartenaire] = useState([]);
    const [formData, setFormData] = useState({
        nomProduit: '',
        categorie: '',
        datePeremption: '',
        quantite: ''
    });

    const [selectedProduct, setSelectedProduct] = useState(null);

    useEffect(() => {
        fetchData();
        fetchUser();
    }, []);

    const fetchData = async () => {
        try {
            const response = await fetch('https://au-temps-donne-api.onrender.com/api/partenaire/allProducts', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include'
            });
            if (!response.ok) {
                throw new Error('Failed to fetch data');
            }
            const data = await response.json();
            // Filtrer les produits ayant ID_Stock et id_maraude à NULL
            const filteredProducts = data.data.filter(product => product.ID_Stock === null && product.id_maraude === null);
            setProducts(filteredProducts);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };
    

    const fetchUser = async () => {
        try{
            const res = await fetch('https://au-temps-donne-api.onrender.com/api/partenaire/getMe', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include'
            });
            console.log('YAYAYSHGYUGD : '+res.data.id);
            setPartenaire(res.data.id);
        }catch (error) {
            console.error('Error fetching data:', error);
        }
    }

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await fetch('https://au-temps-donne-api.onrender.com/api/partenaire/addProduct', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(formData)
            });
            console.log('TETSTSTSTSTS : '+JSON.stringify(response));
            document.getElementById('popupForm').style.display = 'none';

            if (!response.ok) {
                throw new Error('Erreur réseau ou du serveur');
            }
            const data = await response.json();
            if (data.message) {
                alert(data.message);
                fetchData();
            }
        } catch (error) {
            console.error('Error:', error);
            alert('Error during form submission: ' + error.message);
        }
    };

    const handleChange = (event) => {
        const { name, value } = event.target;
        setFormData((prevFormData) => ({
            ...prevFormData,
            [name]: value
        }));
    };

    const handleUpdateModalOpen = (product) => {
        setSelectedProduct(product);
        setFormData({
            nomProduit: product.nom,
            categorie: product.categorie,
            datePeremption: product.date_peremption,
            quantite: product.quantite
        });
    };
    

    const handleCloseModal = () => {
        setSelectedProduct(null);
    };

    const handleUpdateProduct = async () => {
        if (!selectedProduct) return;
    
        try {
            console.log("LOLLLLLL : " + selectedProduct.ID_Denree);
            const response = await fetch(`https://au-temps-donne-api.onrender.com/api/partenaire/denree/${selectedProduct.ID_Denree}/updateProduct`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify(formData)
            });
            console.log("RESRS : " + response);
            if (!response.ok) {
                throw new Error('Erreur réseau ou du serveur');
            }
            const data = await response.json();
            alert(data.message);
            handleCloseModal();
            fetchData(); // Assuming fetchData() fetches updated product data
        } catch (error) {
            console.error('Error:', error);
            alert('Error updating product: ' + error.message);
        }
    };
    

    const handleDelete = async (productId) => {
        try {
            const response = await fetch(`https://au-temps-donne-api.onrender.com/api/partenaire/denree/${productId}/deleteProduct`, {
                method: 'DELETE',                
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
            });
            if (!response.ok) {
                throw new Error('Erreur réseau ou du serveur');
            }
            const data = await response.json();
            alert(data.message);
            fetchData(); // Assuming fetchData() fetches updated product data
        } catch (error) {
            console.error('Error:', error);
            alert('Error deleting product: ' + error.message);
        }
    };
    

    useEffect(() => {
        const handleAddButtonClick = () => {
            document.getElementById('popupForm').style.display = 'block';
            document.getElementById('overlay').style.display = 'block';

        };

        document.getElementById('add_link').addEventListener('click', handleAddButtonClick);

        return () => {
            document.getElementById('add_link').removeEventListener('click', handleAddButtonClick);
        };
    }, []);

    return (
        <>
            <NavMenu />
            <section className="content">
                <div className="lists">
                    <div className="table-header">
                        <h3 className="title_dashboard">Gestionnaire des produits</h3>
                        <Link id="add_link" href="javascript:void(0);" className="view-all">Ajouter<img className="voir-all-icon" height="15px" width="17px" src={addIcon} alt="Voir tout" /></Link>
                    </div>
                    <div className="product-table">
                        <h3 style={{ marginLeft: '2.5%', marginRight: '2.5%' }}>Product List</h3>
                        <table>
                            <thead>
                                <tr>
                                    <th>Nom</th>
                                    <th>Categorie</th>
                                    <th>Quantite</th>
                                    <th>Date de péremption</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Array.isArray(products) && products.length > 0 ? (
                                    products.map((product, index) => (
                                        <tr key={index}>
                                            <td>{product.nom}</td>
                                            <td>{product.categorie}</td>
                                            <td>{product.quantite}</td>
                                            <td>{product.date_peremption}</td>
                                            <td>
                                                <FontAwesomeIcon icon={faEdit} onClick={() => handleUpdateModalOpen(product)} style={{ color: 'orange' }} />
                                                &nbsp;&nbsp;&nbsp;&nbsp;
                                                <FontAwesomeIcon icon={faTrashAlt} onClick={() => handleDelete(product.ID_Denree)} style={{ color: 'red' }}/>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5">No products found</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div id="overlay" style={{ display: 'none' }}></div>
                    <div id="popupForm" n style={{ display: 'none' }}>
                    <button className="close-btn" onClick={() => {
                            document.getElementById('overlay').style.display = 'none';
                            document.getElementById('popupForm').style.display = 'none';
                        }}>
                           X </button>
                        <form id="publicEventForm" onSubmit={handleSubmit}>
                            <div className="scrollable-content">
                                <label htmlFor="nomProduit">Nom du produit :</label>
                                <input type="text" id="nomProduit" name="nomProduit" value={formData.nomProduit} onChange={handleChange} required />
                                <div className="form-row">
                                    <label htmlFor="categorie">Categorie :</label>
                                    <select id="categorie" name="categorie" value={formData.categorie} onChange={handleChange}>
                                        <option value="">Sélectionnez une categorie</option>
                                        <option value="Articles d'hygiène personnelle">Articles d'hygiène personnelle</option>
                                        <option value="Vêtements chauds">Vêtements chauds</option>
                                        <option value="Articles de premiers secours">Articles de premiers secours</option>
                                        <option value="Produits médicaux de base">Produits médicaux de base</option>
                                        <option value="Fournitures de camping">Fournitures de camping</option>
                                        <option value="Articles pour animaux de compagnie">Articles pour animaux de compagnie</option>
                                        <option value="Sacs à dos ou sacs de transport">Sacs à dos ou sacs de transport</option>
                                        <option value="Articles pour bébés">Articles pour bébés</option>
                                        <option value="Alimentaire">Alimentaire</option>
                                    </select>
                                </div>
                                <div className="form-row">
                                    <br />
                                    <div className="date">
                                        <label htmlFor="datePeremption">Date de péremption :</label>
                                        <input type="date" id="activityDate" name="datePeremption" value={formData.datePeremption} onChange={handleChange} />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <label htmlFor="quantite">Quantité :</label>
                                    <input type="number" id="volunteerCount" name="quantite" value={formData.quantite} onChange={handleChange} min="1" />
                                </div>
                                <input className="btn_event" type="submit" value="Ajouter" />
                            </div>
                        </form>
                    </div>
                    {selectedProduct && (
                        <div id="updateModal" className="modal">
                            <div className="modal-content">
                                <span className="close" onClick={handleCloseModal}>&times;</span>
                                <h2>Update Product</h2>
                                <form onSubmit={handleUpdateProduct}>
                                    <label htmlFor="nomProduit">Nom du produit :</label>
                                    <input type="text" id="nomProduit" name="nomProduit" value={formData.nomProduit} onChange={handleChange} required />
                                    <div className="form-row">
                                        <label htmlFor="categorie">Categorie :</label>
                                        <select id="categorie" name="categorie" value={formData.categorie} onChange={handleChange}>
                                            <option value="">Sélectionnez une categorie</option>
                                            {/* Add options for categories */}
                                        </select>
                                    </div>
                                    <div className="form-row">
                                        <br />
                                        <div className="date">
                                            <label htmlFor="datePeremption">Date de péremption :</label>
                                            <input type="date" id="activityDate" name="datePeremption" value={formData.datePeremption} onChange={handleChange} required />
                                        </div>
                                    </div>
                                    <div className="form-row">
                                        <label htmlFor="quantite">Quantité :</label>
                                        <input type="number" id="volunteerCount" name="quantite" value={formData.quantite} onChange={handleChange} min="1" />
                                    </div>
                                    <input className="btn_event" type="submit" value="Update" />
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            </section>
        </>
    );
}

export default Event;
