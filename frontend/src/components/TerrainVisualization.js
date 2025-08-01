import React from 'react';
import './TerrainVisualization.css';

const TerrainVisualization = ({ terrain, visitedCells, finalPosition }) => {
  if (!terrain || !visitedCells || !finalPosition) return null;

  const visitedCellsMap = {};
  visitedCells.forEach(cell => {
    visitedCellsMap[`${cell.X},${cell.Y}`] = true;
  });

  const finalX = finalPosition.Location.X;
  const finalY = finalPosition.Location.Y;
  const facing = finalPosition.Facing;

  const getArrow = (direction) => {
    switch (direction) {
      case 'North': return '↑';
      case 'South': return '↓';
      case 'East': return '→';
      case 'West': return '←';
      default: return '•';
    }
  };

  const getCellClass = (rowIndex, colIndex, terrainType) => {
    const isVisited = visitedCellsMap[`${colIndex},${rowIndex}`];
    const isFinal = rowIndex === finalY && colIndex === finalX;
    
    let classes = ['terrain-viz-cell', `terrain-type-${terrainType.toLowerCase()}`];
    
    if (isVisited) classes.push('visited');
    if (isFinal) classes.push('final');
    
    return classes.join(' ');
  };

  return (
    <div className="terrain-visualization">
      <h2>Terrain Visualization</h2>
      <div className="terrain-viz-grid">
        {terrain.map((row, rowIndex) => (
          <div key={`viz-row-${rowIndex}`} className="terrain-viz-row">
            {row.map((cell, colIndex) => (
              <div 
                key={`viz-cell-${rowIndex}-${colIndex}`} 
                className={getCellClass(rowIndex, colIndex, cell)}
                title={`(${colIndex}, ${rowIndex}) - ${cell}`}
              >
                <div className="cell-content">
                  <span className="terrain-type">{cell}</span>
                  {rowIndex === finalY && colIndex === finalX && (
                    <span className="robot-position">{getArrow(facing)}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
      
      <div className="terrain-legend">
        <h3>Legend</h3>
        <div className="legend-items">
          <div className="legend-item">
            <div className="legend-color terrain-type-fe"></div>
            <span>Fe - Ferrum</span>
          </div>
          <div className="legend-item">
            <div className="legend-color terrain-type-se"></div>
            <span>Se - Selenium</span>
          </div>
          <div className="legend-item">
            <div className="legend-color terrain-type-w"></div>
            <span>W - Water</span>
          </div>
          <div className="legend-item">
            <div className="legend-color terrain-type-si"></div>
            <span>Si - Silicon</span>
          </div>
          <div className="legend-item">
            <div className="legend-color terrain-type-zn"></div>
            <span>Zn - Zinc</span>
          </div>
          <div className="legend-item">
            <div className="legend-color terrain-type-obs"></div>
            <span>Obs - Obstacle</span>
          </div>
          <div className="legend-item">
            <div className="legend-color visited"></div>
            <span>Visited Cell</span>
          </div>
          <div className="legend-item">
            <div className="legend-color final">
              <span className="robot-position">→</span>
            </div>
            <span>Robot Position</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TerrainVisualization;