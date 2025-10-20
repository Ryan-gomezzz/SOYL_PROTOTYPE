const express = require('express');
const app = express();
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok' }));

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

const port = 3001;
app.listen(port, () => console.log(`Mock server listening on http://localhost:${port}`));
