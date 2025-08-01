const simulationService = require('../src/services/SimulationService');

describe('SimulationService', () => {
  describe('runSimulation', () => {
    it('should run a simulation with valid input', () => {
      const input = {
        terrain: [['Fe', 'Fe', 'Se'], ['W', 'Si', 'Obs']],
        battery: 50,
        commands: ['F', 'S', 'R', 'F'],
        initialPosition: {
          location: { x: 0, y: 0 },
          facing: 'East'
        }
      };

      const result = simulationService.runSimulation(input);

      expect(result).toEqual({
        VisitedCells: [
          { X: 0, Y: 0 },
          { X: 1, Y: 0 },
          { X: 1, Y: 1 }
        ],
        SamplesCollected: ['Fe'],
        Battery: 34,
        FinalPosition: {
          Location: { X: 1, Y: 1 },
          Facing: 'South'
        }
      });
    });
  });

  describe('validateInput', () => {
    it('should throw an error if input is missing', () => {
      expect(() => {
        simulationService.validateInput(null);
      }).toThrow('Input is required');
    });

    it('should throw an error if terrain is invalid', () => {
      expect(() => {
        simulationService.validateInput({
          terrain: null,
          battery: 50,
          commands: ['F'],
          initialPosition: { location: { x: 0, y: 0 }, facing: 'East' }
        });
      }).toThrow('Terrain must be a non-empty 2D array');

      expect(() => {
        simulationService.validateInput({
          terrain: [],
          battery: 50,
          commands: ['F'],
          initialPosition: { location: { x: 0, y: 0 }, facing: 'East' }
        });
      }).toThrow('Terrain must be a non-empty 2D array');

      expect(() => {
        simulationService.validateInput({
          terrain: [['Fe'], ['W', 'Si']],
          battery: 50,
          commands: ['F'],
          initialPosition: { location: { x: 0, y: 0 }, facing: 'East' }
        });
      }).toThrow('Terrain must be a valid 2D array with consistent row lengths');
    });

    it('should throw an error if battery is invalid', () => {
      expect(() => {
        simulationService.validateInput({
          terrain: [['Fe', 'Fe'], ['W', 'Si']],
          battery: -1,
          commands: ['F'],
          initialPosition: { location: { x: 0, y: 0 }, facing: 'East' }
        });
      }).toThrow('Battery must be a non-negative number');

      expect(() => {
        simulationService.validateInput({
          terrain: [['Fe', 'Fe'], ['W', 'Si']],
          battery: 'invalid',
          commands: ['F'],
          initialPosition: { location: { x: 0, y: 0 }, facing: 'East' }
        });
      }).toThrow('Battery must be a non-negative number');
    });

    it('should throw an error if commands are invalid', () => {
      expect(() => {
        simulationService.validateInput({
          terrain: [['Fe', 'Fe'], ['W', 'Si']],
          battery: 50,
          commands: null,
          initialPosition: { location: { x: 0, y: 0 }, facing: 'East' }
        });
      }).toThrow('Commands must be a non-empty array');

      expect(() => {
        simulationService.validateInput({
          terrain: [['Fe', 'Fe'], ['W', 'Si']],
          battery: 50,
          commands: [],
          initialPosition: { location: { x: 0, y: 0 }, facing: 'East' }
        });
      }).toThrow('Commands must be a non-empty array');

      expect(() => {
        simulationService.validateInput({
          terrain: [['Fe', 'Fe'], ['W', 'Si']],
          battery: 50,
          commands: ['F', 'X'],
          initialPosition: { location: { x: 0, y: 0 }, facing: 'East' }
        });
      }).toThrow('Commands must be one of: F, B, L, R, S, E');
    });

    it('should throw an error if initial position is invalid', () => {
      expect(() => {
        simulationService.validateInput({
          terrain: [['Fe', 'Fe'], ['W', 'Si']],
          battery: 50,
          commands: ['F'],
          initialPosition: null
        });
      }).toThrow('Initial position is required');

      expect(() => {
        simulationService.validateInput({
          terrain: [['Fe', 'Fe'], ['W', 'Si']],
          battery: 50,
          commands: ['F'],
          initialPosition: { location: null, facing: 'East' }
        });
      }).toThrow('Initial position must have valid x and y coordinates');

      expect(() => {
        simulationService.validateInput({
          terrain: [['Fe', 'Fe'], ['W', 'Si']],
          battery: 50,
          commands: ['F'],
          initialPosition: { location: { x: 0, y: 0 }, facing: 'Invalid' }
        });
      }).toThrow('Initial position must have a valid facing direction (North, South, East, West)');

      expect(() => {
        simulationService.validateInput({
          terrain: [['Fe', 'Fe'], ['W', 'Si']],
          battery: 50,
          commands: ['F'],
          initialPosition: { location: { x: 5, y: 0 }, facing: 'East' }
        });
      }).toThrow('Initial position is out of terrain bounds');

      expect(() => {
        simulationService.validateInput({
          terrain: [['Fe', 'Obs'], ['W', 'Si']],
          battery: 50,
          commands: ['F'],
          initialPosition: { location: { x: 1, y: 0 }, facing: 'East' }
        });
      }).toThrow('Initial position cannot be an obstacle');
    });
  });
});