const express = require('express');
const simulationController = require('../controllers/SimulationController');

const router = express.Router();

router.post('/', simulationController.runSimulation);

module.exports = router;