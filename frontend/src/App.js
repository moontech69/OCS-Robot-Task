import React, { useState } from 'react';
import axios from 'axios';
import './App.css';
import SimulationForm from './components/SimulationForm';
import SimulationResult from './components/SimulationResult';
import TerrainVisualization from './components/TerrainVisualization';

function App() {
  const [result, setResult] = useState(null);
  const [inputData, setInputData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (formData) => {
    setLoading(true);
    setError(null);
    setInputData(formData);
    
    const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:12000';
    
    try {
      const response = await axios.post(`${apiUrl}/api/simulation`, formData);
      setResult(response.data);
    } catch (err) {
      console.error('Error running simulation:', err);
      setError(err.response?.data?.error || 'An error occurred while running the simulation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Mars Robot Challenge</h1>
      </header>
      
      <main className="App-main">
        <SimulationForm onSubmit={handleSubmit} isLoading={loading} />
        
        {error && (
          <div className="error-message">
            <h3>Error</h3>
            <p>{error}</p>
          </div>
        )}
        
        {result && inputData && (
          <>
            <TerrainVisualization 
              terrain={inputData.terrain} 
              visitedCells={result.VisitedCells} 
              finalPosition={result.FinalPosition} 
            />
            <SimulationResult result={result} />
          </>
        )}
      </main>
      
      <footer className="App-footer">
        <p>Mars Robot Challenge - Olympic Channel Development</p>
      </footer>
    </div>
  );
}

export default App;
