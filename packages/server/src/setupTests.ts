// Jest setup file for additional configuration
// This file is run before each test file

// Mock environment variables
process.env.AWS_REGION = 'us-east-1';
process.env.DDB_TABLE = 'test-table';
process.env.S3_BUCKET = 'test-bucket';
process.env.LLM_ENDPOINT = 'https://api.test.com/v1/chat/completions';

// Suppress console warnings during tests
const originalWarn = console.warn;
console.warn = (...args) => {
  // Only suppress AWS SDK warnings
  if (args[0] && typeof args[0] === 'string' && args[0].includes('AWS SDK')) {
    return;
  }
  originalWarn.apply(console, args);
};
