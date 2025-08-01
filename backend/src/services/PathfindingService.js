/**
 * Service for pathfinding and mission planning
 */
class PathfindingService {
  /**
   * Initialize the pathfinding service
   * @param {Array} terrain - 2D array representing the Mars terrain
   */
  constructor(terrain) {
    this.terrain = terrain;
    this.rows = terrain.length;
    this.cols = terrain[0].length;
    
    this.commandCosts = {
      F: 3,
      B: 3,
      L: 2,
      R: 2,
      S: 8,
      E: -9 // Net cost of -9 (uses 1, gains 10)
    };
  }

  /**
   * Find the optimal path from start to target
   * @param {Object} start - Starting position {x, y, facing}
   * @param {Object} target - Target position {x, y}
   * @param {number} initialBattery - Initial battery level
   * @returns {Object} - Path information {commands, battery, success}
   */
  findPath(start, target, initialBattery) {
    // A* algorithm implementation
    const openSet = new PriorityQueue();
    const closedSet = new Set();
    const cameFrom = new Map();
    const gScore = new Map();
    const fScore = new Map();
    
    const startKey = this.getPositionKey(start);
    gScore.set(startKey, 0);
    fScore.set(startKey, this.heuristic(start, target));
    openSet.enqueue(startKey, fScore.get(startKey));
    
    const batteryLevels = new Map();
    batteryLevels.set(startKey, initialBattery);
    
    const commandSequences = new Map();
    commandSequences.set(startKey, []);
    
    while (!openSet.isEmpty()) {
      const currentKey = openSet.dequeue();
      const current = this.parsePositionKey(currentKey);
      
      if (current.x === target.x && current.y === target.y) {
        const commands = commandSequences.get(currentKey);
        const remainingBattery = batteryLevels.get(currentKey);
        return {
          commands,
          battery: remainingBattery,
          success: true
        };
      }
      
      closedSet.add(currentKey);
      
      const possibleMoves = this.getPossibleMoves(current);
      
      for (const move of possibleMoves) {
        const { position: neighbor, command } = move;
        const neighborKey = this.getPositionKey(neighbor);
        
        if (closedSet.has(neighborKey)) {
          continue;
        }
        
        const batteryCost = this.commandCosts[command];
        const currentBattery = batteryLevels.get(currentKey);
        const newBattery = currentBattery + batteryCost;
        
        if (newBattery <= 0) {
          continue;
        }
        
        const tentativeGScore = gScore.get(currentKey) + 1;
        
        if (!gScore.has(neighborKey) || tentativeGScore < gScore.get(neighborKey)) {
          cameFrom.set(neighborKey, { key: currentKey, command });
          gScore.set(neighborKey, tentativeGScore);
          fScore.set(neighborKey, tentativeGScore + this.heuristic(neighbor, target));
          batteryLevels.set(neighborKey, newBattery);
          
          const newCommands = [...commandSequences.get(currentKey), command];
          commandSequences.set(neighborKey, newCommands);
          
          if (!openSet.contains(neighborKey)) {
            openSet.enqueue(neighborKey, fScore.get(neighborKey));
          }
        }
      }
    }
    
    return {
      commands: [],
      battery: initialBattery,
      success: false
    };
  }
  
  /**
   * Generate a mission plan to collect samples of each terrain type
   * @param {Object} start - Starting position {x, y, facing}
   * @param {number} initialBattery - Initial battery level
   * @returns {Object} - Mission plan {commands, battery, success}
   */
  generateMissionPlan(start, initialBattery) {
    const terrainTypes = new Set();
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        const terrainType = this.terrain[y][x];
        if (terrainType !== 'Obs') {
          terrainTypes.add(terrainType);
        }
      }
    }
    
    const targets = [];
    for (const terrainType of terrainTypes) {
      const locations = this.findTerrainLocations(terrainType);
      if (locations.length > 0) {
        targets.push({
          type: terrainType,
          locations
        });
      }
    }
    
    targets.sort((a, b) => {
      const aDistance = Math.min(...a.locations.map(loc => 
        this.manhattanDistance(start, loc)));
      const bDistance = Math.min(...b.locations.map(loc => 
        this.manhattanDistance(start, loc)));
      return aDistance - bDistance;
    });
    
    let currentPosition = { ...start };
    let currentBattery = initialBattery;
    let allCommands = [];
    let success = true;
    
    for (const target of targets) {
      const locations = target.locations;
      let bestLocation = null;
      let bestPath = null;
      
      for (const location of locations) {
        const path = this.findPath(currentPosition, location, currentBattery);
        if (path.success && (!bestPath || path.commands.length < bestPath.commands.length)) {
          bestLocation = location;
          bestPath = path;
        }
      }
      
      if (!bestPath) {
        success = false;
        break;
      }
      
      allCommands.push(...bestPath.commands);
      currentBattery = bestPath.battery;
      
      if (currentBattery >= 8) {
        allCommands.push('S');
        currentBattery -= 8;
      } else if (currentBattery >= 1) {
        allCommands.push('E');
        currentBattery += 9;
        allCommands.push('S');
        currentBattery -= 8;
      } else {
        success = false;
        break;
      }
      
      currentPosition = {
        x: bestLocation.x,
        y: bestLocation.y,
        facing: this.parsePositionKey(this.getPositionKey(currentPosition)).facing
      };
    }
    
    return {
      commands: allCommands,
      battery: currentBattery,
      success
    };
  }
  
  /**
   * Find all locations of a specific terrain type
   * @param {string} terrainType - The terrain type to find
   * @returns {Array} - Array of locations {x, y}
   */
  findTerrainLocations(terrainType) {
    const locations = [];
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        if (this.terrain[y][x] === terrainType) {
          locations.push({ x, y });
        }
      }
    }
    return locations;
  }
  
  /**
   * Get all possible moves from a position
   * @param {Object} position - Current position {x, y, facing}
   * @returns {Array} - Array of possible moves {position, command}
   */
  getPossibleMoves(position) {
    const moves = [];
    const { x, y, facing } = position;
    
    const leftFacing = this.getNewFacing(facing, 'L');
    moves.push({
      position: { x, y, facing: leftFacing },
      command: 'L'
    });
    
    const rightFacing = this.getNewFacing(facing, 'R');
    moves.push({
      position: { x, y, facing: rightFacing },
      command: 'R'
    });
    
    const forwardPosition = this.getNextPosition(position, 'F');
    if (!this.isObstacle(forwardPosition.x, forwardPosition.y)) {
      moves.push({
        position: forwardPosition,
        command: 'F'
      });
    }
    
    const backwardPosition = this.getNextPosition(position, 'B');
    if (!this.isObstacle(backwardPosition.x, backwardPosition.y)) {
      moves.push({
        position: backwardPosition,
        command: 'B'
      });
    }
    
    moves.push({
      position: { ...position },
      command: 'E'
    });
    
    return moves;
  }
  
  /**
   * Get the new facing direction after a turn
   * @param {string} facing - Current facing direction
   * @param {string} command - Turn command (L or R)
   * @returns {string} - New facing direction
   */
  getNewFacing(facing, command) {
    const directions = ['North', 'East', 'South', 'West'];
    const currentIndex = directions.indexOf(facing);
    
    if (command === 'L') {
      return directions[(currentIndex + 3) % 4]; // -1 + 4 to handle negative index
    } else if (command === 'R') {
      return directions[(currentIndex + 1) % 4];
    }
    
    return facing;
  }
  
  /**
   * Get the next position after a move
   * @param {Object} position - Current position {x, y, facing}
   * @param {string} command - Move command (F or B)
   * @returns {Object} - New position {x, y, facing}
   */
  getNextPosition(position, command) {
    const { x, y, facing } = position;
    let newX = x;
    let newY = y;
    
    const isForward = command === 'F';
    const direction = isForward ? 1 : -1;
    
    switch (facing) {
      case 'North':
        newY -= direction;
        break;
      case 'South':
        newY += direction;
        break;
      case 'East':
        newX += direction;
        break;
      case 'West':
        newX -= direction;
        break;
    }
    
    return { x: newX, y: newY, facing };
  }
  
  /**
   * Check if a position is an obstacle or out of bounds
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @returns {boolean} - Whether the position is an obstacle
   */
  isObstacle(x, y) {
    if (y < 0 || y >= this.rows || x < 0 || x >= this.cols) {
      return true;
    }
    
    return this.terrain[y][x] === 'Obs';
  }
  
  /**
   * Calculate heuristic for A* algorithm (Manhattan distance)
   * @param {Object} position - Current position {x, y}
   * @param {Object} target - Target position {x, y}
   * @returns {number} - Heuristic value
   */
  heuristic(position, target) {
    return this.manhattanDistance(position, target);
  }
  
  /**
   * Calculate Manhattan distance between two positions
   * @param {Object} a - First position {x, y}
   * @param {Object} b - Second position {x, y}
   * @returns {number} - Manhattan distance
   */
  manhattanDistance(a, b) {
    return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  }
  
  /**
   * Get a unique key for a position
   * @param {Object} position - Position {x, y, facing}
   * @returns {string} - Unique key
   */
  getPositionKey(position) {
    return `${position.x},${position.y},${position.facing}`;
  }
  
  /**
   * Parse a position key back to an object
   * @param {string} key - Position key
   * @returns {Object} - Position {x, y, facing}
   */
  parsePositionKey(key) {
    const [x, y, facing] = key.split(',');
    return {
      x: parseInt(x),
      y: parseInt(y),
      facing
    };
  }
}

class PriorityQueue {
  constructor() {
    this.elements = [];
    this.priorities = new Map();
  }
  
  isEmpty() {
    return this.elements.length === 0;
  }
  
  contains(element) {
    return this.priorities.has(element);
  }
  
  enqueue(element, priority) {
    this.elements.push(element);
    this.priorities.set(element, priority);
    this.elements.sort((a, b) => this.priorities.get(a) - this.priorities.get(b));
  }
  
  dequeue() {
    const element = this.elements.shift();
    this.priorities.delete(element);
    return element;
  }
}

module.exports = PathfindingService;