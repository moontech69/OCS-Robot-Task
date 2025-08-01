import React, { useState } from 'react';
import './SimulationForm.css';

const SimulationForm = ({ onSubmit, isLoading }) => {
  const [formData, setFormData] = useState({
    terrain: [
      ['Fe', 'Fe', 'Se'],
      ['W', 'Si', 'Obs']
    ],
    battery: 50,
    commands: ['F', 'S', 'R', 'F'],
    initialPosition: {
      location: { x: 0, y: 0 },
      facing: 'East'
    }
  });

  const [terrainRows, setTerrainRows] = useState(2);
  const [terrainCols, setTerrainCols] = useState(3);
  const [commandsString, setCommandsString] = useState('F,S,R,F');

  const handleTerrainChange = (rowIndex, colIndex, value) => {
    const newTerrain = [...formData.terrain];
    newTerrain[rowIndex][colIndex] = value;
    setFormData({ ...formData, terrain: newTerrain });
  };

  const handleTerrainSizeChange = (e) => {
    const { name, value } = e.target;
    const numValue = parseInt(value, 10);
    
    if (numValue > 0 && numValue <= 10) {
      if (name === 'rows') {
        setTerrainRows(numValue);
        
        const newTerrain = [...formData.terrain];
        if (numValue > newTerrain.length) {
          for (let i = newTerrain.length; i < numValue; i++) {
            newTerrain.push(Array(terrainCols).fill('Fe'));
          }
        } else {
          newTerrain.splice(numValue);
        }
        
        setFormData({ ...formData, terrain: newTerrain });
      } else if (name === 'cols') {
        setTerrainCols(numValue);
        
        const newTerrain = formData.terrain.map(row => {
          if (numValue > row.length) {
            return [...row, ...Array(numValue - row.length).fill('Fe')];
          } else {
            return row.slice(0, numValue);
          }
        });
        
        setFormData({ ...formData, terrain: newTerrain });
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name === 'battery') {
      setFormData({ ...formData, battery: parseInt(value, 10) });
    } else if (name === 'commands') {
      setCommandsString(value);
      setFormData({ 
        ...formData, 
        commands: value.split(',').map(cmd => cmd.trim())
      });
    } else if (name === 'x') {
      setFormData({
        ...formData,
        initialPosition: {
          ...formData.initialPosition,
          location: {
            ...formData.initialPosition.location,
            x: parseInt(value, 10)
          }
        }
      });
    } else if (name === 'y') {
      setFormData({
        ...formData,
        initialPosition: {
          ...formData.initialPosition,
          location: {
            ...formData.initialPosition.location,
            y: parseInt(value, 10)
          }
        }
      });
    } else if (name === 'facing') {
      setFormData({
        ...formData,
        initialPosition: {
          ...formData.initialPosition,
          facing: value
        }
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const renderTerrainGrid = () => {
    return (
      <div className="terrain-grid">
        {formData.terrain.map((row, rowIndex) => (
          <div key={`row-${rowIndex}`} className="terrain-row">
            {row.map((cell, colIndex) => (
              <div key={`cell-${rowIndex}-${colIndex}`} className="terrain-cell">
                <select
                  value={cell}
                  onChange={(e) => handleTerrainChange(rowIndex, colIndex, e.target.value)}
                >
                  <option value="Fe">Fe</option>
                  <option value="Se">Se</option>
                  <option value="W">W</option>
                  <option value="Si">Si</option>
                  <option value="Zn">Zn</option>
                  <option value="Obs">Obs</option>
                </select>
              </div>
            ))}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="simulation-form">
      <h2>Mars Robot Simulation</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-section">
          <h3>Terrain</h3>
          <div className="terrain-size-controls">
            <div className="form-group">
              <label>Rows:</label>
              <input
                type="number"
                name="rows"
                min="1"
                max="10"
                value={terrainRows}
                onChange={handleTerrainSizeChange}
              />
            </div>
            <div className="form-group">
              <label>Columns:</label>
              <input
                type="number"
                name="cols"
                min="1"
                max="10"
                value={terrainCols}
                onChange={handleTerrainSizeChange}
              />
            </div>
          </div>
          {renderTerrainGrid()}
        </div>

        <div className="form-section">
          <h3>Robot Configuration</h3>
          <div className="form-group">
            <label>Battery:</label>
            <input
              type="number"
              name="battery"
              min="0"
              value={formData.battery}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Commands (comma-separated):</label>
            <input
              type="text"
              name="commands"
              value={commandsString}
              onChange={handleInputChange}
              placeholder="F,B,L,R,S,E"
              required
            />
          </div>

          <div className="form-group">
            <label>Initial Position:</label>
            <div className="position-inputs">
              <div>
                <label>X:</label>
                <input
                  type="number"
                  name="x"
                  min="0"
                  max={terrainCols - 1}
                  value={formData.initialPosition.location.x}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <label>Y:</label>
                <input
                  type="number"
                  name="y"
                  min="0"
                  max={terrainRows - 1}
                  value={formData.initialPosition.location.y}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div>
                <label>Facing:</label>
                <select
                  name="facing"
                  value={formData.initialPosition.facing}
                  onChange={handleInputChange}
                  required
                >
                  <option value="North">North</option>
                  <option value="South">South</option>
                  <option value="East">East</option>
                  <option value="West">West</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Running Simulation...' : 'Run Simulation'}
        </button>
      </form>
    </div>
  );
};

export default SimulationForm;