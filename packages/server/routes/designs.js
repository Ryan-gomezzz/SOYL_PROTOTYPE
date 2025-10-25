/**
 * Designs API Routes
 * Endpoints for saving, loading, and exporting designs
 */

const express = require('express');
const router = express.Router();
const LocalStore = require('../storage/localStore');

// Initialize storage
const store = new LocalStore({
  useS3: process.env.USE_S3 === 'true',
  s3Config: process.env.USE_S3 === 'true' ? {
    bucket: process.env.S3_BUCKET,
    region: process.env.S3_REGION || 'us-east-1',
    accessKeyId: process.env.S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
  } : null,
});

/**
 * POST /api/designs/save
 * Save a design with optional thumbnail
 */
router.post('/save', async (req, res) => {
  try {
    const { name, params, thumbnail } = req.body;

    if (!name || !params) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, params',
      });
    }

    // Save thumbnail if provided
    let thumbnailUrl = null;
    if (thumbnail) {
      try {
        thumbnailUrl = await store.saveImage(thumbnail, `${name}.png`);
      } catch (error) {
        console.error('Failed to save thumbnail:', error);
        // Continue without thumbnail
      }
    }

    // Save design
    const designId = await store.saveDesign({
      name,
      params,
      thumbnailUrl,
    });

    res.status(200).json({
      success: true,
      id: designId,
      url: thumbnailUrl,
      message: 'Design saved successfully',
    });
  } catch (error) {
    console.error('Save design error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save design',
      details: error.message,
    });
  }
});

/**
 * GET /api/designs/:id
 * Get a design by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Missing design ID',
      });
    }

    const design = await store.getDesign(id);

    res.status(200).json({
      success: true,
      design,
    });
  } catch (error) {
    console.error('Get design error:', error);
    
    if (error.message === 'Design not found') {
      return res.status(404).json({
        success: false,
        error: 'Design not found',
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to retrieve design',
      details: error.message,
    });
  }
});

/**
 * GET /api/designs
 * List all designs with pagination
 */
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;

    const result = await store.listDesigns({ page, limit });

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error('List designs error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to list designs',
      details: error.message,
    });
  }
});

/**
 * DELETE /api/designs/:id
 * Delete a design by ID
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Missing design ID',
      });
    }

    await store.deleteDesign(id);

    res.status(200).json({
      success: true,
      message: 'Design deleted successfully',
    });
  } catch (error) {
    console.error('Delete design error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete design',
      details: error.message,
    });
  }
});

/**
 * POST /api/designs/export
 * Export design as PNG image
 */
router.post('/export', async (req, res) => {
  try {
    const { imageBase64, filename } = req.body;

    if (!imageBase64) {
      return res.status(400).json({
        success: false,
        error: 'Missing image data',
      });
    }

    const finalFilename = filename || 'design-export.png';
    const imageUrl = await store.saveImage(imageBase64, finalFilename);

    res.status(200).json({
      success: true,
      url: imageUrl,
      message: 'Design exported successfully',
    });
  } catch (error) {
    console.error('Export design error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to export design',
      details: error.message,
    });
  }
});

module.exports = router;

