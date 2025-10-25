/**
 * Designs API Tests
 * Tests for save, load, list, and export endpoints
 */

const request = require('supertest');
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
const designsRouter = require('../routes/designs');

// Create test app
function createTestApp() {
  const app = express();
  app.use(cors());
  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ extended: true, limit: '50mb' }));
  app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
  app.use('/api/designs', designsRouter);
  return app;
}

describe('Designs API', () => {
  let app;
  let savedDesignId;

  beforeAll(() => {
    app = createTestApp();
  });

  describe('POST /api/designs/save', () => {
    it('should save a design without thumbnail', async () => {
      const response = await request(app)
        .post('/api/designs/save')
        .send({
          name: 'Test Design',
          params: {
            color: '#667eea',
            scale: 1,
            rotationY: 0,
          },
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.id).toBeDefined();
      expect(response.body.message).toBe('Design saved successfully');

      savedDesignId = response.body.id;
    });

    it('should save a design with thumbnail', async () => {
      const mockBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

      const response = await request(app)
        .post('/api/designs/save')
        .send({
          name: 'Test Design with Thumbnail',
          params: {
            color: '#ff0000',
            texture: 'denim',
          },
          thumbnail: mockBase64,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.id).toBeDefined();
      expect(response.body.url).toBeDefined();
      expect(response.body.url).toMatch(/\/uploads\/.+\.png/);
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/designs/save')
        .send({
          name: 'Incomplete Design',
          // Missing params
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Missing required fields');
    });
  });

  describe('GET /api/designs/:id', () => {
    it('should retrieve a saved design', async () => {
      const response = await request(app)
        .get(`/api/designs/${savedDesignId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.design).toBeDefined();
      expect(response.body.design.id).toBe(savedDesignId);
      expect(response.body.design.name).toBe('Test Design');
    });

    it('should return 404 for non-existent design', async () => {
      const response = await request(app)
        .get('/api/designs/non-existent-id')
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Design not found');
    });
  });

  describe('GET /api/designs', () => {
    it('should list all designs', async () => {
      const response = await request(app)
        .get('/api/designs')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.designs).toBeDefined();
      expect(Array.isArray(response.body.designs)).toBe(true);
      expect(response.body.total).toBeGreaterThan(0);
      expect(response.body.page).toBe(1);
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/designs?page=1&limit=1')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.designs.length).toBeLessThanOrEqual(1);
      expect(response.body.limit).toBe(1);
    });
  });

  describe('POST /api/designs/export', () => {
    it('should export a design as PNG', async () => {
      const mockBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

      const response = await request(app)
        .post('/api/designs/export')
        .send({
          imageBase64: mockBase64,
          filename: 'test-export.png',
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.url).toBeDefined();
      expect(response.body.url).toMatch(/\/uploads\/.+\.png/);
      expect(response.body.message).toBe('Design exported successfully');
    });

    it('should return 400 for missing image data', async () => {
      const response = await request(app)
        .post('/api/designs/export')
        .send({
          filename: 'test.png',
          // Missing imageBase64
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Missing image data');
    });
  });

  describe('DELETE /api/designs/:id', () => {
    it('should delete a design', async () => {
      const response = await request(app)
        .delete(`/api/designs/${savedDesignId}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Design deleted successfully');

      // Verify it's deleted
      await request(app)
        .get(`/api/designs/${savedDesignId}`)
        .expect(404);
    });
  });
});

describe('LocalStore', () => {
  const LocalStore = require('../storage/localStore');
  let store;

  beforeAll(() => {
    store = new LocalStore({
      dataDir: path.join(__dirname, '../data/designs-test'),
      uploadsDir: path.join(__dirname, '../uploads-test'),
    });
  });

  afterAll(async () => {
    // Clean up test directories
    try {
      await fs.rm(path.join(__dirname, '../data/designs-test'), { recursive: true, force: true });
      await fs.rm(path.join(__dirname, '../uploads-test'), { recursive: true, force: true });
    } catch (err) {
      console.error('Cleanup error:', err);
    }
  });

  it('should save and retrieve a design', async () => {
    const design = {
      name: 'Test Store Design',
      params: { color: '#000000' },
    };

    const id = await store.saveDesign(design);
    expect(id).toBeDefined();

    const retrieved = await store.getDesign(id);
    expect(retrieved.name).toBe(design.name);
    expect(retrieved.params).toEqual(design.params);
  });

  it('should list designs', async () => {
    const result = await store.listDesigns({ page: 1, limit: 10 });
    expect(result.designs).toBeDefined();
    expect(Array.isArray(result.designs)).toBe(true);
  });

  it('should save an image', async () => {
    const mockBase64 = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
    const url = await store.saveImage(mockBase64, 'test.png');
    expect(url).toMatch(/\/uploads\/.+\.png/);
  });
});


