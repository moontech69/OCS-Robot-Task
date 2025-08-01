class Robot {
  constructor(terrain, battery, initialPosition) {
    this.terrain = terrain;
    this.battery = battery;
    this.position = {
      x: initialPosition.location.x,
      y: initialPosition.location.y,
      facing: initialPosition.facing
    };
    this.visitedCells = [{ X: this.position.x, Y: this.position.y }];
    this.samplesCollected = [];
    this.backoffStrategies = [
      ["E", "R", "F"],
      ["E", "L", "F"],
      ["E", "L", "L", "F"],
      ["E", "B", "R", "F"],
      ["E", "B", "B", "L", "F"],
      ["E", "F", "F"],
      ["E", "F", "L", "F", "L", "F"]
    ];
    this.currentBackoffStrategy = 0;
  }

  executeCommands(commands) {
    for (const command of commands) {
      const success = this.executeCommand(command);
      if (!success) break;
    }

    return this.getResult();
  }

  executeCommand(command) {
    const batteryNeeded = this.getBatteryConsumption(command);
    
    if (this.battery < batteryNeeded) {
      if (this.battery >= 1) {
        return this.executeCommand("E");
      }
      return false;
    }

    switch (command) {
      case "F":
        return this.moveForward();
      case "B":
        return this.moveBackward();
      case "L":
        return this.turnLeft();
      case "R":
        return this.turnRight();
      case "S":
        return this.takeSample();
      case "E":
        return this.extendSolarPanels();
      default:
        throw new Error(`Unknown command: ${command}`);
    }
  }

  getBatteryConsumption(command) {
    switch (command) {
      case "F":
      case "B":
        return 3;
      case "L":
      case "R":
        return 2;
      case "S":
        return 8;
      case "E":
        return 1;
      default:
        throw new Error(`Unknown command: ${command}`);
    }
  }

  moveForward() {
    const nextPosition = this.getNextPosition("F");
    
    if (this.isObstacle(nextPosition.x, nextPosition.y)) {
      return this.applyBackoffStrategy();
    }

    this.battery -= 3;
    this.position.x = nextPosition.x;
    this.position.y = nextPosition.y;
    this.addVisitedCell(nextPosition.x, nextPosition.y);
    
    // Reset backoff strategy counter after successful move
    this.currentBackoffStrategy = 0;
    
    return true;
  }

  moveBackward() {
    const nextPosition = this.getNextPosition("B");
    
    if (this.isObstacle(nextPosition.x, nextPosition.y)) {
      return this.applyBackoffStrategy();
    }

    this.battery -= 3;
    this.position.x = nextPosition.x;
    this.position.y = nextPosition.y;
    this.addVisitedCell(nextPosition.x, nextPosition.y);
    
    this.currentBackoffStrategy = 0;
    
    return true;
  }

  turnLeft() {
    this.battery -= 2;
    
    switch (this.position.facing) {
      case "North":
        this.position.facing = "West";
        break;
      case "West":
        this.position.facing = "South";
        break;
      case "South":
        this.position.facing = "East";
        break;
      case "East":
        this.position.facing = "North";
        break;
    }
    
    return true;
  }

  turnRight() {
    this.battery -= 2;
    
    switch (this.position.facing) {
      case "North":
        this.position.facing = "East";
        break;
      case "East":
        this.position.facing = "South";
        break;
      case "South":
        this.position.facing = "West";
        break;
      case "West":
        this.position.facing = "North";
        break;
    }
    
    return true;
  }

  takeSample() {
    this.battery -= 8;
    
    const terrainType = this.getTerrainType(this.position.x, this.position.y);
    if (terrainType && terrainType !== "Obs") {
      this.samplesCollected.push(terrainType);
    }
    
    return true;
  }

  extendSolarPanels() {
    this.battery -= 1;
    this.battery += 10;
    return true;
  }

  applyBackoffStrategy() {
    if (this.currentBackoffStrategy >= this.backoffStrategies.length) {
      return false;
    }

    const strategy = this.backoffStrategies[this.currentBackoffStrategy];
    this.currentBackoffStrategy++;

    for (const command of strategy) {
      const success = this.executeCommand(command);
      if (!success) return false;
    }

    return true;
  }

  getNextPosition(command) {
    const nextPosition = {
      x: this.position.x,
      y: this.position.y
    };

    const isForward = command === "F";
    const direction = isForward ? 1 : -1;

    switch (this.position.facing) {
      case "North":
        nextPosition.y -= direction;
        break;
      case "South":
        nextPosition.y += direction;
        break;
      case "East":
        nextPosition.x += direction;
        break;
      case "West":
        nextPosition.x -= direction;
        break;
    }

    return nextPosition;
  }

  isObstacle(x, y) {
    if (y < 0 || y >= this.terrain.length || x < 0 || x >= this.terrain[0].length) {
      return true;
    }

    return this.terrain[y][x] === "Obs";
  }

  getTerrainType(x, y) {
    if (y < 0 || y >= this.terrain.length || x < 0 || x >= this.terrain[0].length) {
      return null;
    }
    
    return this.terrain[y][x];
  }

  addVisitedCell(x, y) {
    const alreadyVisited = this.visitedCells.some(cell => cell.X === x && cell.Y === y);
    if (!alreadyVisited) {
      this.visitedCells.push({ X: x, Y: y });
    }
  }

  getResult() {
    return {
      VisitedCells: this.visitedCells,
      SamplesCollected: this.samplesCollected,
      Battery: this.battery,
      FinalPosition: {
        Location: {
          X: this.position.x,
          Y: this.position.y
        },
        Facing: this.position.facing
      }
    };
  }
}

module.exports = Robot;