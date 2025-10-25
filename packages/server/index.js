const express = require('express');
const cors = require('cors');
const path = require('path');
const designsRouter = require('./routes/designs');

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' })); // Increase limit for base64 images
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Legacy designs endpoint (for backward compatibility)
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

// 3D Studio API routes
app.use('/api/designs', designsRouter);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

const port = process.env.PORT || 3001;
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
  console.log(`3D Studio API available at http://localhost:${port}/api/designs`);
});
