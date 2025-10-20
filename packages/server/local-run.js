const express = require('express');
const bodyParser = require('body-parser');

// For local testing, we'll use the mock Express server instead of the Lambda handler
// This allows us to test the API without AWS infrastructure

const app = express();
app.use(bodyParser.json());

// Mock design generation endpoint (same as the original index.js)
app.post('/designs', (req, res) => {
  const brief = req.body?.brief || 'No brief provided';
  // Mock design JSON
  const design = {
    title: 'Mock Design for: ' + brief,
    placements: [
      {
        area: 'front',
        type: 'text',
        x: 120,
        y: 200,
        width: 360,
        height: 200,
        content: { text: 'SOYL — Story Of Your Life' }
      },
      {
        area: 'front',
        type: 'image',
        x: 140,
        y: 320,
        width: 320,
        height: 200,
        content: { src: 'https://via.placeholder.com/640x400.png?text=SOYL' }
      }
    ],
    palette: ['#D4AF37', '#0b0b0b', '#ffffff']
  };
  // Simulate slight processing delay
  setTimeout(() => res.json({ brief, design }), 600);
});

// Health check endpoint
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Lambda handler proxy (for testing the actual Lambda code)
app.post('/lambda-designs', async (req, res) => {
  try {
    // Import the Lambda handler dynamically
    const { handler } = await import('./dist/handler.js');
    
    // Create a mock APIGatewayProxyEvent
    const event = {
      httpMethod: 'POST',
      path: '/designs',
      body: JSON.stringify(req.body)
    };
    
    const result = await handler(event);
    res.status(result.statusCode || 200).send(JSON.parse(result.body));
  } catch (err) {
    console.error('Lambda handler error:', err);
    res.status(500).json({ error: 'Lambda handler failed', message: err.message });
  }
});

const port = 3001;
app.listen(port, () => {
  console.log(`Local-run proxy listening on http://localhost:${port}`);
  console.log(`Mock endpoint: POST http://localhost:${port}/designs`);
  console.log(`Lambda proxy: POST http://localhost:${port}/lambda-designs`);
  console.log(`Health check: GET http://localhost:${port}/health`);
});
