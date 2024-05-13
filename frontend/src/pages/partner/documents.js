import React, { useState } from 'react';
import NavMenu from './navMenu';
import '../../css/documentsc.css';


const AnnualReport = () => {
  const [year, setYear] = useState('');
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      const response = await fetch(`https://au-temps-donne-api.onrender.com/api/partenaire/annual-report/${year}`, {
        method: 'GET',
        credentials:'include'
      });

      // Check if the response is successful
      if (!response.ok) {
        throw new Error('Failed to download annual report');
      }

      // Convert the response to a blob
      const blob = await response.blob();

      // Create a blob URL for the PDF data
      const url = window.URL.createObjectURL(blob);

      // Create a link element to trigger the download
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `annual_report_${year}.pdf`);
      document.body.appendChild(link);
      link.click();
      setLoading(false);
    } catch (error) {
      console.error('Error downloading annual report:', error);
      setLoading(false);
    }
  };

  return (
    <>
    <NavMenu />
    <div class="bodydocumentc">
      <h2>Generateur de rapport annuel</h2>
      <input
        type="number"
        placeholder="Enter Year"
        value={year}
        onChange={(e) => setYear(e.target.value)}
      />
      <button onClick={handleDownload} disabled={!year || loading}>
        {loading ? 'Generating...' : 'Generate Report'}
      </button>
    </div>
    </>
  );
};

export default AnnualReport;
