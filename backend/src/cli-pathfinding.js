const inquirer = require('inquirer');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const Robot = require('./models/Robot');
const PathfindingService = require('./services/PathfindingService');

const CLEAR_SCREEN = '\x1b[2J';
const CURSOR_HOME = '\x1b[H';

const DIRECTION_SYMBOLS = {
  North: '↑',
  South: '↓',
  East: '→',
  West: '←'
};

const TERRAIN_COLORS = {
  Fe: chalk.rgb(139, 69, 19), 
  Se: chalk.yellow,           
  W: chalk.blue,              
  Si: chalk.green,            
  Zn: chalk.magenta,          
  Obs: chalk.red              
};

let terrain = [
  ['Fe', 'Fe', 'Se'],
  ['W', 'Si', 'Obs']
];
let robot = null;
let battery = 50;
let initialPosition = {
  location: { x: 0, y: 0 },
  facing: 'East'
};
let pathfindingService = null;

function initialize() {
  robot = new Robot(terrain, battery, initialPosition);
  pathfindingService = new PathfindingService(terrain);
}

function displayTerrain(visitedCells = [], path = []) {
  console.log(CLEAR_SCREEN + CURSOR_HOME);
  console.log(chalk.bold('Mars Robot Pathfinding CLI\n'));
  
  console.log(chalk.bold('Terrain:'));
  
  let border = '┌';
  for (let x = 0; x < terrain[0].length; x++) {
    border += '────┬';
  }
  border = border.slice(0, -1) + '┐';
  console.log(border);
  
  for (let y = 0; y < terrain.length; y++) {
    let row = '│';
    for (let x = 0; x < terrain[y].length; x++) {
      const cell = terrain[y][x];
      const isRobotHere = robot.position.x === x && robot.position.y === y;
      const isVisited = visitedCells.some(visitedCell => visitedCell.X === x && visitedCell.Y === y);
      const isPath = path.some(pos => pos.x === x && pos.y === y);
      
      let cellDisplay = ` ${cell} `;
      if (isRobotHere) {
        cellDisplay += DIRECTION_SYMBOLS[robot.position.facing];
      } else {
        cellDisplay += ' ';
      }
      
      if (isRobotHere) {
        row += chalk.bgWhite.black(cellDisplay);
      } else if (isPath) {
        row += chalk.bgYellow.black(cellDisplay);
      } else if (isVisited) {
        row += chalk.bgGray(TERRAIN_COLORS[cell](cellDisplay));
      } else {
        row += TERRAIN_COLORS[cell](cellDisplay);
      }
      row += '│';
    }
    console.log(row);
    
    if (y < terrain.length - 1) {
      let separator = '├';
      for (let x = 0; x < terrain[0].length; x++) {
        separator += '────┼';
      }
      separator = separator.slice(0, -1) + '┤';
      console.log(separator);
    }
  }
  
  let bottomBorder = '└';
  for (let x = 0; x < terrain[0].length; x++) {
    bottomBorder += '────┴';
  }
  bottomBorder = bottomBorder.slice(0, -1) + '┘';
  console.log(bottomBorder);
  
  console.log('\n' + chalk.bold('Robot Status:'));
  console.log(`Position: (${robot.position.x}, ${robot.position.y})`);
  console.log(`Facing: ${robot.position.facing} ${DIRECTION_SYMBOLS[robot.position.facing]}`);
  console.log(`Battery: ${chalk.yellow(robot.battery)} units`);
  
  console.log('\n' + chalk.bold('Samples Collected:'));
  if (robot.samplesCollected.length === 0) {
    console.log('None');
  } else {
    robot.samplesCollected.forEach(sample => {
      console.log(`- ${TERRAIN_COLORS[sample](sample)}`);
    });
  }
}

async function executeCommands(commands) {
  console.log(chalk.bold('\nExecuting commands:'), commands.join(', '));
  
  const simulationRobot = new Robot(terrain, battery, initialPosition);
  const result = simulationRobot.executeCommands(commands);
  
  const path = result.VisitedCells.map(cell => ({ x: cell.X, y: cell.Y }));
  displayTerrain([], path);
  
  console.log(chalk.bold('\nSimulation Result:'));
  console.log(`Final Position: (${result.FinalPosition.Location.X}, ${result.FinalPosition.Location.Y})`);
  console.log(`Final Facing: ${result.FinalPosition.Facing}`);
  console.log(`Final Battery: ${result.Battery} units`);
  console.log(`Samples Collected: ${result.SamplesCollected.join(', ') || 'None'}`);
  
  const { execute } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'execute',
      message: 'Execute these commands with the robot?',
      default: false
    }
  ]);
  
  if (execute) {
    robot.executeCommands(commands);
    console.log(chalk.green('\nCommands executed successfully!'));
  }
  
  await promptContinue();
}

async function promptContinue() {
  await inquirer.prompt([
    {
      type: 'input',
      name: 'continue',
      message: 'Press Enter to continue...'
    }
  ]);
}

async function promptPathfinding() {
  const { option } = await inquirer.prompt([
    {
      type: 'list',
      name: 'option',
      message: 'Choose a pathfinding option:',
      choices: [
        { name: 'Find path to specific location', value: 'PATH_TO_LOCATION' },
        { name: 'Generate mission plan to collect all sample types', value: 'MISSION_PLAN' },
        { name: 'Edit terrain', value: 'EDIT_TERRAIN' },
        { name: 'Reset robot', value: 'RESET' },
        { name: 'Save/load terrain', value: 'SAVE_LOAD' },
        { name: 'Exit', value: 'EXIT' }
      ]
    }
  ]);
  
  switch (option) {
    case 'PATH_TO_LOCATION':
      await findPathToLocation();
      break;
    case 'MISSION_PLAN':
      await generateMissionPlan();
      break;
    case 'EDIT_TERRAIN':
      await promptTerrainSettings();
      break;
    case 'RESET':
      await promptRobotSettings();
      break;
    case 'SAVE_LOAD':
      await promptSaveLoad();
      break;
    case 'EXIT':
      console.log(chalk.green('\nThank you for using Mars Robot Pathfinding CLI!'));
      process.exit(0);
  }
  
  await promptPathfinding();
}

async function findPathToLocation() {
  const answers = await inquirer.prompt([
    {
      type: 'number',
      name: 'x',
      message: 'Enter target X position:',
      validate: value => {
        if (value < 0 || value >= terrain[0].length) {
          return `X must be between 0 and ${terrain[0].length - 1}`;
        }
        return true;
      }
    },
    {
      type: 'number',
      name: 'y',
      message: 'Enter target Y position:',
      validate: value => {
        if (value < 0 || value >= terrain.length) {
          return `Y must be between 0 and ${terrain.length - 1}`;
        }
        if (terrain[value][answers.x] === 'Obs') {
          return 'Target position cannot be an obstacle';
        }
        return true;
      }
    }
  ]);
  
  const target = { x: answers.x, y: answers.y };
  const start = {
    x: robot.position.x,
    y: robot.position.y,
    facing: robot.position.facing
  };
  
  console.log(chalk.bold('\nFinding path from'), `(${start.x}, ${start.y})`, chalk.bold('to'), `(${target.x}, ${target.y})`);
  
  const result = pathfindingService.findPath(start, target, robot.battery);
  
  if (result.success) {
    console.log(chalk.green('\nPath found!'));
    console.log(`Commands: ${result.commands.join(', ')}`);
    console.log(`Remaining Battery: ${result.battery} units`);
    
    await executeCommands(result.commands);
  } else {
    console.log(chalk.red('\nNo path found!'));
    console.log('This could be due to obstacles, battery constraints, or unreachable target.');
    await promptContinue();
  }
}

async function generateMissionPlan() {
  console.log(chalk.bold('\nGenerating mission plan to collect all sample types...'));
  
  const start = {
    x: robot.position.x,
    y: robot.position.y,
    facing: robot.position.facing
  };
  
  const result = pathfindingService.generateMissionPlan(start, robot.battery);
  
  if (result.success) {
    console.log(chalk.green('\nMission plan generated!'));
    console.log(`Commands: ${result.commands.join(', ')}`);
    console.log(`Remaining Battery: ${result.battery} units`);
    
    await executeCommands(result.commands);
  } else {
    console.log(chalk.red('\nCould not generate complete mission plan!'));
    console.log('This could be due to obstacles, battery constraints, or unreachable terrain types.');
    
    if (result.commands.length > 0) {
      console.log(chalk.yellow('\nPartial plan generated:'));
      console.log(`Commands: ${result.commands.join(', ')}`);
      console.log(`Remaining Battery: ${result.battery} units`);
      
      const { execute } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'execute',
          message: 'Execute this partial plan?',
          default: false
        }
      ]);
      
      if (execute) {
        await executeCommands(result.commands);
      } else {
        await promptContinue();
      }
    } else {
      await promptContinue();
    }
  }
}

async function promptRobotSettings() {
  const answers = await inquirer.prompt([
    {
      type: 'number',
      name: 'battery',
      message: 'Enter initial battery level:',
      default: 50,
      validate: value => value >= 0 ? true : 'Battery must be non-negative'
    },
    {
      type: 'number',
      name: 'x',
      message: 'Enter initial X position:',
      default: 0,
      validate: value => {
        if (value < 0 || value >= terrain[0].length) {
          return `X must be between 0 and ${terrain[0].length - 1}`;
        }
        return true;
      }
    },
    {
      type: 'number',
      name: 'y',
      message: 'Enter initial Y position:',
      default: 0,
      validate: value => {
        if (value < 0 || value >= terrain.length) {
          return `Y must be between 0 and ${terrain.length - 1}`;
        }
        if (terrain[value][answers.x] === 'Obs') {
          return 'Initial position cannot be an obstacle';
        }
        return true;
      }
    },
    {
      type: 'list',
      name: 'facing',
      message: 'Choose initial facing direction:',
      choices: ['North', 'South', 'East', 'West'],
      default: 'East'
    }
  ]);
  
  battery = answers.battery;
  initialPosition = {
    location: { x: answers.x, y: answers.y },
    facing: answers.facing
  };
  
  initialize();
  displayTerrain();
}

async function promptTerrainSettings() {
  const answers = await inquirer.prompt([
    {
      type: 'number',
      name: 'rows',
      message: 'Enter number of rows:',
      default: terrain.length,
      validate: value => value > 0 ? true : 'Rows must be positive'
    },
    {
      type: 'number',
      name: 'cols',
      message: 'Enter number of columns:',
      default: terrain[0].length,
      validate: value => value > 0 ? true : 'Columns must be positive'
    }
  ]);
  
  const newTerrain = [];
  for (let y = 0; y < answers.rows; y++) {
    const row = [];
    for (let x = 0; x < answers.cols; x++) {
      if (y < terrain.length && x < terrain[0].length) {
        row.push(terrain[y][x]);
      } else {
        row.push('Fe'); 
      }
    }
    newTerrain.push(row);
  }
  
  terrain = newTerrain;
  
  for (let y = 0; y < terrain.length; y++) {
    for (let x = 0; x < terrain[0].length; x++) {
      const { cellType } = await inquirer.prompt([
        {
          type: 'list',
          name: 'cellType',
          message: `Select terrain type for cell (${x}, ${y}):`,
          choices: ['Fe', 'Se', 'W', 'Si', 'Zn', 'Obs'],
          default: terrain[y][x]
        }
      ]);
      terrain[y][x] = cellType;
    }
  }
  
  if (initialPosition.location.x >= terrain[0].length || 
      initialPosition.location.y >= terrain.length ||
      terrain[initialPosition.location.y][initialPosition.location.x] === 'Obs') {
    console.log(chalk.yellow('\nInitial position is no longer valid. Resetting robot position.'));
    await promptRobotSettings();
  } else {
    initialize();
    displayTerrain();
  }
}

async function promptSaveLoad() {
  const { option } = await inquirer.prompt([
    {
      type: 'list',
      name: 'option',
      message: 'Choose an option:',
      choices: [
        { name: 'Save terrain', value: 'SAVE' },
        { name: 'Load terrain', value: 'LOAD' },
        { name: 'Back', value: 'BACK' }
      ]
    }
  ]);
  
  if (option === 'BACK') {
    return;
  }
  
  const { filename } = await inquirer.prompt([
    {
      type: 'input',
      name: 'filename',
      message: `Enter filename to ${option === 'SAVE' ? 'save' : 'load'}:`,
      default: 'terrain.json'
    }
  ]);
  
  const filePath = path.resolve(process.cwd(), filename);
  
  if (option === 'SAVE') {
    const data = {
      terrain,
      initialPosition,
      battery
    };
    
    try {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
      console.log(chalk.green(`\nTerrain saved to ${filePath}`));
    } catch (error) {
      console.error(chalk.red('\nError saving terrain:'), error.message);
    }
  } else {
    try {
      if (!fs.existsSync(filePath)) {
        console.error(chalk.red(`\nFile not found: ${filePath}`));
        await promptContinue();
        return;
      }
      
      const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      
      if (!data.terrain || !data.initialPosition || data.battery === undefined) {
        console.error(chalk.red('\nInvalid terrain file format'));
        await promptContinue();
        return;
      }
      
      terrain = data.terrain;
      initialPosition = data.initialPosition;
      battery = data.battery;
      
      initialize();
      displayTerrain();
      console.log(chalk.green(`\nTerrain loaded from ${filePath}`));
    } catch (error) {
      console.error(chalk.red('\nError loading terrain:'), error.message);
    }
  }
  
  await promptContinue();
}

async function main() {
  console.log(chalk.bold.green('Welcome to Mars Robot Pathfinding CLI!'));
  console.log('This tool allows you to find optimal paths and generate mission plans.\n');
  
  initialize();
  displayTerrain();
  await promptPathfinding();
}

main().catch(error => {
  console.error(chalk.red('An error occurred:'), error);
  process.exit(1);
});