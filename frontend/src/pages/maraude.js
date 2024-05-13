import React, { useEffect, useState } from 'react';
import NavMenu from './navMenu';
import Modal from 'react-modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye,faMap,faSearch , faTrash, faHandsHelping } from '@fortawesome/free-solid-svg-icons';
import { LoadScript, GoogleMap, DirectionsRenderer } from '@react-google-maps/api';

Modal.setAppElement('#root');

function Maraude() {
  const [maraudes, setMaraudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [itineraryData, setItineraryData] = useState(null);
  const [showMap, setShowMap] = useState(false);
  const [selectedMaraude, setSelectedMaraude] = useState(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [currentMaraude, setCurrentMaraude] = useState({});



  async function fetchMaraude() {
    try {
      const response = await fetch(' https://au-temps-donne-api.onrender.com/api/entrepot/maraudes', {
        method: 'GET',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('Failed to fetch activities');
      }

      const data = await response.json();
      setMaraudes(data.maraudes || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching maraude:', error);
      setError('Failed to fetch maraudes. Please try again later.');
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMaraude();
  }, []);

  const fetchItinerary = async (locations) => {
    try {
      const response = await fetch(' https://au-temps-donne-api.onrender.com/api/entrepot/itinerary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addresses: locations })
      });

      if (!response.ok) {
        throw new Error(`Failed to generate itinerary`);
      }

      const data = await response.json();
      setItineraryData(data);
      setShowMap(true);
    } catch (error) {
      console.error('Error generating itinerary:', error);
      alert(`Failed to generate itinerary: ${error.message}`);
    }
  };

  
  const handleCloseModal = () => {
    setShowMap(false);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };


  const MapComponent = ({ itineraryData }) => {
    const [response, setResponse] = useState(null);
    const [directionsError, setDirectionsError] = useState(null);
    const [mapLoaded, setMapLoaded] = useState(false);
    const [map, setMap] = useState(null); // State pour stocker l'objet Google Map
    const [center, setCenter] = useState({ lat: 48.8588443, lng: 2.2943506 }); // Centre initial

    const originCoordinates = itineraryData.startAddress;
    const destinationCoordinates = itineraryData.destinationAddress;

    useEffect(() => {
        const directionsService = window.google ? new window.google.maps.DirectionsService() : null;

        if (directionsService && mapLoaded && map && originCoordinates && destinationCoordinates) {
            const request = {
                origin: originCoordinates,
                destination: destinationCoordinates,
                travelMode: 'DRIVING'
            };

            directionsService.route(request, (result, status) => {
                if (status === 'OK') {
                    setResponse(result);
                    setDirectionsError(null);
                } else {
                    setResponse(null);
                    setDirectionsError(`Erreur de chargement de l'itinéraire: ${status}`);
                }
            });
        }
    }, [mapLoaded, map, originCoordinates, destinationCoordinates]);

    const onLoad = (loadedMap) => {
        console.log('Google Maps chargé avec succès');
        setMap(loadedMap); 
        setMapLoaded(true);
    };



    return (
        <div className="modal" style={{ display: itineraryData + "modal" ? 'block' : 'none' }}>
            <div className="modal-content">
                
                <span className="close" onClick={handleCloseModal}>&times;</span>
        <div id="map-container">
        {itineraryData && (
            <p style={{marginTop:"20px", marginBottom:"20px"}}>Temps de trajet estimé en voiture : {itineraryData.estimatedCarTime.hours} heures et {itineraryData.estimatedCarTime.minutes} minutes</p>
        )}
      
        <LoadScript googleMapsApiKey={'AIzaSyB3KofdS-3nitMbrTB0JVftrZXYU5WYxt4'}>
            <GoogleMap
                mapContainerStyle={{ width: '100%', height: '100vh' }}
                zoom={8}
                center={center}
                onLoad={onLoad}
            >
                {directionsError && <p>{directionsError}</p>}
                {response && (
                    <DirectionsRenderer
                        options={{
                            directions: response,
                            polylineOptions: {
                                strokeColor: '#FF0000',
                                strokeOpacity: 1.0,
                                strokeWeight: 4
                            }
                        }}
                    />
                )}
            </GoogleMap>
        </LoadScript>
</div>
</div>
        </div>

    );
};
function formatDate(dateString) {
  const options = { year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return new Date(dateString).toLocaleDateString('fr-FR', options);
}

const showDetails = (maraude) => {
    setSelectedMaraude(maraude);
    setCurrentMaraude(maraude);
  };
  return (
    <div className="adminbody">
      <NavMenu />
      <section className="content">
        <section className="tables">
          <div className="main_table-m">
            <div className="table-header">
              <h3 className="title_dashboard">Maraude avenir</h3>
            </div>
            <div className="table_bnv">
              <table>
                <thead>
                  <tr>
                    <th>Nom</th>
                    <th>Date</th>
                    <th>Lieu de Départ</th>
                    <th>Lieu d'arrivée</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {maraudes.map((maraude, index) => (
                    <tr key={index}>
                      <td>{maraude.Nom}</td>
                      <td>{formatDate(maraude.DateDebut)}</td>
                      <td>{maraude.LieuDepart}</td>
                      <td>{maraude.LieuArrivee}</td>
                      <td style={{ display: "none"}}>{maraude.Chauffeur.nom}</td>

                      <td>
                      <button onClick={() => {
                            document.getElementById('overlay').style.display = 'block';
                            document.getElementById('popupForm').style.display = 'block';
                            showDetails(maraude); 
                            }}>
                          <FontAwesomeIcon icon={faEye} style={{ color: 'blue', }} />
                        </button><button onClick={() => fetchItinerary([maraude.LieuDepart, maraude.LieuArrivee])}>
                        <FontAwesomeIcon icon={faMap} style={{ color: 'orange',paddingLeft:'5px'}} /> </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {loading && <p>Chargement en cours...</p>}
              {error && <p className="error">{error}</p>}
            </div>
          </div>
        </section>
      </section>

      <Modal
        isOpen={showMap}
        onRequestClose={handleCloseModal}
        contentLabel="Map Modal"
        className="map-modal"
        overlayClassName="map-modal-overlay"
      >
        {itineraryData && <MapComponent itineraryData={itineraryData} />}
        <button onClick={handleCloseModal}>Close</button>
      </Modal>

      <div id="overlay" style={{ display: 'none' }}></div>
                    <div id="popupForm" style={{ display: 'none' }}>  
                    <button className="close" onClick={() => {
                            document.getElementById('overlay').style.display = 'none';
                            document.getElementById('popupForm').style.display = 'none';
                        }}>
                    <span className="close" onClick={handleCloseModal}>&times;</span>
                        </button>
                        {selectedMaraude && (

          <div>
            <h3>{currentMaraude.Nom}</h3>
            <p><strong>Le : </strong>{formatDate(currentMaraude.DateDebut)}</p>
            <p><strong>Description: </strong> {currentMaraude.Description}</p>
            <p><strong>Lieu de départ : </strong>{currentMaraude.LieuDepart}</p>
            <p><strong>Lieu d'arrivée : </strong>{currentMaraude.LieuArrivee}</p>
            <p><strong>Chauffeur:</strong> {selectedMaraude.Chauffeur ? selectedMaraude.Chauffeur.nom : 'Non assigné'} {selectedMaraude.Chauffeur ? selectedMaraude.Chauffeur.prenom : 'Non assigné'}</p>
          </div>
                  )}

</div>

    </div>
  );
}

export default Maraude;
