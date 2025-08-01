const request = require('supertest');
const app = require('../src/server');

describe('API Endpoints', () => {
  describe('POST /api/simulation', () => {
    it('should run a simulation with valid input', async () => {
      const input = {
        terrain: [['Fe', 'Fe', 'Se'], ['W', 'Si', 'Obs']],
        battery: 50,
        commands: ['F', 'S', 'R', 'F'],
        initialPosition: {
          location: { x: 0, y: 0 },
          facing: 'East'
        }
      };

      const response = await request(app)
        .post('/api/simulation')
        .send(input)
        .set('Accept', 'application/json');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
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

    it('should return 400 with invalid input', async () => {
      const input = {
        terrain: [['Fe', 'Fe', 'Se'], ['W', 'Si', 'Obs']],
        battery: -10, // Invalid battery
        commands: ['F', 'S', 'R', 'F'],
        initialPosition: {
          location: { x: 0, y: 0 },
          facing: 'East'
        }
      };

      const response = await request(app)
        .post('/api/simulation')
        .send(input)
        .set('Accept', 'application/json');

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /health', () => {
    it('should return 200 OK', async () => {
      const response = await request(app).get('/health');
      
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'ok' });
    });
  });
});