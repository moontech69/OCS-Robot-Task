const fs = require('fs');
const axios = require('axios');

async function postSimulation() {
  if (process.argv.length !== 3) {
    console.error('Usage: node client.js <input.json>');
    process.exit(1);
  }

  const inputFile = process.argv[2];
  
  try {
    const inputData = JSON.parse(fs.readFileSync(inputFile, 'utf8'));
    
    const response = await axios.post('http://localhost:12000/api/simulation', inputData, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    if (error.response) {
      console.error(`Error: ${error.response.data.error || 'Server error'}`);
    } else if (error.request) {
      console.error('Error: No response received from server. Is the server running?');
    } else {
      console.error(`Error: ${error.message}`);
    }
    process.exit(1);
  }
}

postSimulation();