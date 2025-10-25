/**
 * Local Storage Abstraction
 * Provides file storage with S3-ready interface for future migration
 */

const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class LocalStore {
  constructor(config = {}) {
    this.dataDir = config.dataDir || path.join(__dirname, '../data/designs');
    this.uploadsDir = config.uploadsDir || path.join(__dirname, '../uploads');
    this.useS3 = config.useS3 || false;
    this.s3Config = config.s3Config || null;

    // Initialize directories
    this.init();
  }

  async init() {
    try {
      await fs.mkdir(this.dataDir, { recursive: true });
      await fs.mkdir(this.uploadsDir, { recursive: true });
      console.log('Storage directories initialized');
    } catch (error) {
      console.error('Failed to initialize storage:', error);
    }
  }

  /**
   * Save design JSON
   * @param {Object} design - Design object
   * @returns {Promise<string>} - Design ID
   */
  async saveDesign(design) {
    const id = design.id || uuidv4();
    const designData = {
      id,
      ...design,
      createdAt: design.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (this.useS3) {
      // TODO: Implement S3 upload
      return this._saveToS3('designs', `${id}.json`, JSON.stringify(designData));
    }

    const filePath = path.join(this.dataDir, `${id}.json`);
    await fs.writeFile(filePath, JSON.stringify(designData, null, 2), 'utf-8');
    return id;
  }

  /**
   * Get design by ID
   * @param {string} id - Design ID
   * @returns {Promise<Object>} - Design object
   */
  async getDesign(id) {
    if (this.useS3) {
      // TODO: Implement S3 download
      return this._getFromS3('designs', `${id}.json`);
    }

    const filePath = path.join(this.dataDir, `${id}.json`);
    try {
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data);
    } catch (error) {
      if (error.code === 'ENOENT') {
        throw new Error('Design not found');
      }
      throw error;
    }
  }

  /**
   * List all designs with pagination
   * @param {Object} options - Pagination options
   * @returns {Promise<Array>} - Array of designs
   */
  async listDesigns(options = {}) {
    const { page = 1, limit = 20 } = options;

    if (this.useS3) {
      // TODO: Implement S3 list
      return this._listFromS3('designs');
    }

    try {
      const files = await fs.readdir(this.dataDir);
      const jsonFiles = files.filter((f) => f.endsWith('.json'));

      // Sort by modified time (newest first)
      const filesWithStats = await Promise.all(
        jsonFiles.map(async (file) => {
          const filePath = path.join(this.dataDir, file);
          const stats = await fs.stat(filePath);
          return { file, mtime: stats.mtime };
        })
      );

      filesWithStats.sort((a, b) => b.mtime - a.mtime);

      // Paginate
      const start = (page - 1) * limit;
      const end = start + limit;
      const paginatedFiles = filesWithStats.slice(start, end);

      // Read design data
      const designs = await Promise.all(
        paginatedFiles.map(async ({ file }) => {
          const filePath = path.join(this.dataDir, file);
          const data = await fs.readFile(filePath, 'utf-8');
          return JSON.parse(data);
        })
      );

      return {
        designs,
        total: jsonFiles.length,
        page,
        limit,
        totalPages: Math.ceil(jsonFiles.length / limit),
      };
    } catch (error) {
      console.error('Failed to list designs:', error);
      return { designs: [], total: 0, page, limit, totalPages: 0 };
    }
  }

  /**
   * Delete design
   * @param {string} id - Design ID
   * @returns {Promise<void>}
   */
  async deleteDesign(id) {
    if (this.useS3) {
      // TODO: Implement S3 delete
      return this._deleteFromS3('designs', `${id}.json`);
    }

    const filePath = path.join(this.dataDir, `${id}.json`);
    await fs.unlink(filePath);
  }

  /**
   * Save image file
   * @param {string} base64Data - Base64 encoded image
   * @param {string} filename - Filename
   * @returns {Promise<string>} - File URL
   */
  async saveImage(base64Data, filename) {
    const id = uuidv4();
    const ext = filename.split('.').pop() || 'png';
    const finalFilename = `${id}.${ext}`;

    // Remove data URL prefix if present
    const base64Image = base64Data.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Image, 'base64');

    if (this.useS3) {
      // TODO: Implement S3 upload
      return this._saveToS3('uploads', finalFilename, buffer);
    }

    const filePath = path.join(this.uploadsDir, finalFilename);
    await fs.writeFile(filePath, buffer);

    return `/uploads/${finalFilename}`;
  }

  /**
   * Get image file path
   * @param {string} filename - Filename
   * @returns {string} - Full file path
   */
  getImagePath(filename) {
    return path.join(this.uploadsDir, filename);
  }

  // S3 placeholder methods (to be implemented)
  async _saveToS3(bucket, key, data) {
    if (!this.s3Config) {
      throw new Error('S3 not configured');
    }
    // TODO: Implement AWS S3 upload using @aws-sdk/client-s3
    console.warn('S3 upload not implemented yet');
    throw new Error('S3 not implemented');
  }

  async _getFromS3(bucket, key) {
    if (!this.s3Config) {
      throw new Error('S3 not configured');
    }
    // TODO: Implement AWS S3 download
    console.warn('S3 download not implemented yet');
    throw new Error('S3 not implemented');
  }

  async _listFromS3(bucket) {
    if (!this.s3Config) {
      throw new Error('S3 not configured');
    }
    // TODO: Implement AWS S3 list
    console.warn('S3 list not implemented yet');
    throw new Error('S3 not implemented');
  }

  async _deleteFromS3(bucket, key) {
    if (!this.s3Config) {
      throw new Error('S3 not configured');
    }
    // TODO: Implement AWS S3 delete
    console.warn('S3 delete not implemented yet');
    throw new Error('S3 not implemented');
  }
}

module.exports = LocalStore;

