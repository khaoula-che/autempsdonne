import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Document, Page, Image, PDFDownloadLink } from '@react-pdf/renderer';

const GOOGLE_MAPS_API_KEY = process.env.REACT_APP_GOOGLE_MAPS_API_KEY;

const YourComponent = () => {
  const [partners, setPartners] = useState([]);
  const [entrepots, setEntrepots] = useState([]);
  const [selectedEntrepot, setSelectedEntrepot] = useState('');
  const [selectedArrivalEntrepot, setSelectedArrivalEntrepot] = useState('');
  const [selectedPartners, setSelectedPartners] = useState([]);
  const [pdfVisible, setPdfVisible] = useState(false);
  const [routeData, setRouteData] = useState({ routeCoordinates: [], addresses: [] });
  const [selectedDate, setSelectedDate] = useState('');

  useEffect(() => {
    async function fetchData() {
      try {
        const partnersResponse = await axios.get(' https://au-temps-donne-api.onrender.com/api/admin/Partenaires');
        setPartners(partnersResponse.data);

        const entrepotsResponse = await axios.get(' https://au-temps-donne-api.onrender.com/api/entrepot/AllEntrepots');
        setEntrepots(entrepotsResponse.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);


  return (
    <div>
      {pdfVisible && (
        <PDFDownloadLink document={<MyDocument routeData={routeData} />} fileName="itinerary.pdf">
          {({ loading }) => (loading ? 'Loading document...' : 'Download PDF')}
        </PDFDownloadLink>
      )}
    </div>
  );
};

const MyDocument = ({ routeData }) => {
  const path = routeData.routeCoordinates.map(coord => `${coord[0]},${coord[1]}`).join('|');
  const staticMapUrl = `https://maps.googleapis.com/maps/api/staticmap?size=800x600&maptype=roadmap&path=color:0x0000ff|weight:5|${path}&key=${GOOGLE_MAPS_API_KEY}`;

  return (
    <Document>
      <Page size="A4">
        <Image src={staticMapUrl} />
      
      </Page>
    </Document>
  );
};

export default YourComponent;