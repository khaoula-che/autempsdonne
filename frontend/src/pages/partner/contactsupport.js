import React, { useState } from 'react';
import '../../css/support.css';
import NavMenu from './navMenu';


function ProblemForm() {
  const [description, setDescription] = useState('');
  const [urgency, setUrgency] = useState('normal');
  const [submitting, setSubmitting] = useState(false); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true); 
    try {
      const response = await fetch('https://au-temps-donne-api.onrender.com/api/partenaire/problems', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ description, type: urgency }),
        credentials: 'include' 
      });
      if (!response.ok) {
        throw new Error('Failed to submit problem');
      }
      setDescription('');
      setUrgency('normal');
      alert('Problem submitted successfully!');
    } catch (error) {
      console.error('Error submitting problem:', error);
      alert('Failed to submit problem. Please try again later.');
    } finally {
      setSubmitting(false); 
    }
  };

  return (
    <>
    <NavMenu />
    <div className="problem-form-container">
      <h1 className="problem-form-heading">Repporter un Problème</h1>
      <form className="problem-form" onSubmit={handleSubmit}>
        <div className="problem-form-group">
          <label htmlFor="description" className="problem-form-label">Description:</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            className="problem-form-textarea"
          />
        </div>
        <div className="problem-form-group">
          <label htmlFor="urgency" className="problem-form-label">Urgency:</label>
          <select
            id="urgency"
            value={urgency}
            onChange={(e) => setUrgency(e.target.value)}
            className="problem-form-select"
          >
            <option value="normal">Normal</option>
            <option value="urgent">Urgent</option>
            <option value="critical">Critical</option>
          </select>
        </div>
        <button
          type="submit"
          className={`problem-form-submit ${submitting ? 'problem-form-submitting' : ''}`}
          disabled={submitting}
        >
          {submitting ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </div>
    </>
  );
}

export default ProblemForm;
