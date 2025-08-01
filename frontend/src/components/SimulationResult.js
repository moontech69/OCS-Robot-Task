import React from 'react';
import './SimulationResult.css';

const SimulationResult = ({ result }) => {
  if (!result) return null;

  return (
    <div className="simulation-result">
      <h2>Simulation Results</h2>
      
      <div className="result-section">
        <h3>Final Position</h3>
        <div className="result-data">
          <p>
            <strong>Location:</strong> ({result.FinalPosition.Location.X}, {result.FinalPosition.Location.Y})
          </p>
          <p>
            <strong>Facing:</strong> {result.FinalPosition.Facing}
          </p>
        </div>
      </div>
      
      <div className="result-section">
        <h3>Battery</h3>
        <div className="result-data">
          <p>{result.Battery} units remaining</p>
        </div>
      </div>
      
      <div className="result-section">
        <h3>Samples Collected</h3>
        <div className="result-data">
          {result.SamplesCollected.length > 0 ? (
            <ul className="samples-list">
              {result.SamplesCollected.map((sample, index) => (
                <li key={index}>{sample}</li>
              ))}
            </ul>
          ) : (
            <p>No samples collected</p>
          )}
        </div>
      </div>
      
      <div className="result-section">
        <h3>Visited Cells</h3>
        <div className="result-data">
          <ul className="cells-list">
            {result.VisitedCells.map((cell, index) => (
              <li key={index}>
                ({cell.X}, {cell.Y})
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SimulationResult;