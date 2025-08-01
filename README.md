# Mars Robot Challenge

This project simulates a Mars Surveillance Robot exploring the surface of Mars. The robot can move, turn, take samples, and extend solar panels to recharge its battery.

## Project Structure

The project is divided into two main parts:

- **Backend**: Node.js/Express.js REST API for running the robot simulation
- **Frontend**: React application for visualizing the simulation

## Features

- Three execution modes:
  - CLI mode: Process input/output files
  - REST API server mode: Accept POST requests with simulation data
  - REST client mode: Post data to the server and display results
- Interactive web interface with:
  - Customizable terrain configuration
  - Robot command input
  - Visual representation of the robot's path
  - Detailed simulation results
- Advanced Extensions:
  - Interactive CLI Visualization: Control the robot step-by-step in a text-based interface
  - Pathfinding Intelligence: Generate optimal command sequences for exploring Mars
  - Mission Planning: Automatically collect samples of each terrain type efficiently

## Technologies Used

- **Backend**:
  - Node.js
  - Express.js
  - Jest (for testing)
- **Frontend**:
  - React
  - Axios (for API requests)
  - CSS for styling

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)

### Installation

1. Clone the repository:

   ```
   git clone <repository-url>
   cd mars-robot-challenge
   ```

2. Install backend dependencies:

   ```
   cd backend
   npm install
   ```

3. Install frontend dependencies:
   ```
   cd ../frontend
   npm install
   ```

## Running the Application

### CLI Mode

Process input and output files:

```
./obs_test sample_input.json output.json
```

### REST API Server Mode

Start the server:

```
./obs_test
```

The server will start on port 12000 by default.

### REST Client Mode

Post data to the server:

```
./obs_test_post sample_input.json
```

### Web Interface

1. Start the backend server:

   ```
   cd backend
   npm start
   ```

2. Start the frontend development server:

   ```
   cd frontend
   npm start
   ```

3. Open your browser and navigate to `http://localhost:3000`

### Interactive CLI

Run the interactive CLI interface:

```
cd backend
npm run interactive
```

This provides a text-based interface where you can:

- Control the robot step-by-step
- Visualize the terrain and robot position
- See real-time updates of battery and samples collected
- Edit the terrain configuration

### Pathfinding CLI

Run the pathfinding CLI interface:

```
cd backend
npm run pathfinding
```

This provides advanced features:

- Find optimal paths between any two points
- Generate mission plans to collect all sample types
- Visualize planned paths before execution
- Save and load terrain configurations

## API Documentation

### POST /api/simulation

Run a robot simulation.

**Request Body**:

```json
{
	"terrain": [
		["Fe", "Fe", "Se"],
		["W", "Si", "Obs"]
	],
	"battery": 50,
	"commands": ["F", "S", "R", "F"],
	"initialPosition": {
		"location": { "x": 0, "y": 0 },
		"facing": "East"
	}
}
```

**Response**:

```json
{
	"VisitedCells": [
		{ "X": 0, "Y": 0 },
		{ "X": 1, "Y": 0 }
	],
	"SamplesCollected": ["Fe"],
	"Battery": 32,
	"FinalPosition": {
		"Location": { "X": 1, "Y": 0 },
		"Facing": "South"
	}
}
```

## Testing

Run the test suite:

```
cd backend
npm test
```

## Design Decisions

### Architecture

The project follows a clean architecture pattern with separation of concerns:

- **Models**: Core business logic (Robot class)
- **Services**: Application services (SimulationService, PathfindingService)
- **Controllers**: API endpoints (SimulationController)
- **Routes**: API route definitions
- **CLI Interfaces**: Interactive command-line tools

### Robot Implementation

The Robot class is designed with:

- Encapsulated state management
- Command pattern for executing robot actions
- Strategy pattern for obstacle avoidance
- Comprehensive validation of inputs

### Pathfinding Implementation

The PathfindingService implements advanced algorithms:

- A\* algorithm for optimal path finding
- Mission planning for collecting samples efficiently
- Battery-aware path planning to ensure mission completion
- Obstacle avoidance strategies

### Frontend Design

The React frontend is built with:

- Component-based architecture
- Responsive design
- Interactive visualization
- Form validation

### CLI Design

The CLI interfaces are built with:

- Interactive prompts using Inquirer.js
- ASCII visualization of the terrain and robot
- Color-coded output for better readability
- Command history and state persistence
