const app = require('./server');
const fs = require('fs');
const path = require('path');
const simulationService = require('./services/SimulationService');

const PORT = process.env.PORT || 12000;

if (process.argv.length <= 2) {
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log('REST API server mode active');
  });
} else {
  const args = process.argv.slice(2);
  
  if (args.length === 2) {
    const inputFile = args[0];
    const outputFile = args[1];
    
    try {
      const inputData = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
      
      const result = simulationService.runSimulation(inputData);
      
      fs.writeFileSync(outputFile, JSON.stringify(result, null, 2));
      
      console.log(`Simulation completed. Output written to ${outputFile}`);
    } catch (error) {
      console.error(`Error: ${error.message}`);
      process.exit(1);
    }
  } else if (args.length === 1) {
    const inputFile = args[0];
    
    try {
      const inputData = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
      
      const result = simulationService.runSimulation(inputData);
      
      console.log(JSON.stringify(result, null, 2));
    } catch (error) {
      console.error(`Error: ${error.message}`);
      process.exit(1);
    }
  } else {
    console.error('Invalid number of arguments');
    console.error('Usage:');
    console.error('  obs_test input.json output.json - CLI mode processing files');
    console.error('  obs_test - starts the REST API server (no parameters)');
    console.error('  obs_test_post input.json - REST client that posts to the server and displays formatted output');
    process.exit(1);
  }
}