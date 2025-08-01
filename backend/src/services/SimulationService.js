const Robot = require('../models/Robot');
class SimulationService {
  /**
   * Run a simulation with the provided input
   * @param {Object} input - Simulation input
   * @returns {Object} - Simulation result
   */
  runSimulation(input) {
    try {
      this.validateInput(input);
      
      const { terrain, battery, commands, initialPosition } = input;
      
      const robot = new Robot(terrain, battery, initialPosition);
      return robot.executeCommands(commands);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Validate the simulation input
   * @param {Object} input - Simulation input
   * @throws {Error} - If input is invalid
   */
  validateInput(input) {
    if (!input) {
      throw new Error('Input is required');
    }

    const { terrain, battery, commands, initialPosition } = input;

    if (!terrain || !Array.isArray(terrain) || terrain.length === 0) {
      throw new Error('Terrain must be a non-empty 2D array');
    }

    const rowLength = terrain[0].length;
    if (!rowLength || terrain.some(row => !Array.isArray(row) || row.length !== rowLength)) {
      throw new Error('Terrain must be a valid 2D array with consistent row lengths');
    }

    if (typeof battery !== 'number' || battery < 0) {
      throw new Error('Battery must be a non-negative number');
    }

    if (!commands || !Array.isArray(commands) || commands.length === 0) {
      throw new Error('Commands must be a non-empty array');
    }

    const validCommands = ['F', 'B', 'L', 'R', 'S', 'E'];
    if (commands.some(cmd => !validCommands.includes(cmd))) {
      throw new Error(`Commands must be one of: ${validCommands.join(', ')}`);
    }

    if (!initialPosition) {
      throw new Error('Initial position is required');
    }

    if (!initialPosition.location || 
        typeof initialPosition.location.x !== 'number' || 
        typeof initialPosition.location.y !== 'number') {
      throw new Error('Initial position must have valid x and y coordinates');
    }

    if (!initialPosition.facing || 
        !['North', 'South', 'East', 'West'].includes(initialPosition.facing)) {
      throw new Error('Initial position must have a valid facing direction (North, South, East, West)');
    }

    const { x, y } = initialPosition.location;
    if (y < 0 || y >= terrain.length || x < 0 || x >= terrain[0].length) {
      throw new Error('Initial position is out of terrain bounds');
    }

    if (terrain[y][x] === 'Obs') {
      throw new Error('Initial position cannot be an obstacle');
    }
  }
}

module.exports = new SimulationService();