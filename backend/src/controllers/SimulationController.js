const simulationService = require('../services/SimulationService');

class SimulationController {
  runSimulation(req, res) {
    try {
      const input = req.body;
      const result = simulationService.runSimulation(input);
      res.status(200).json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

module.exports = new SimulationController();