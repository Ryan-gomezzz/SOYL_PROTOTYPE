// Jest setup file for additional configuration
// This file is run before each test file

// Mock environment variables
process.env.AWS_REGION = 'us-east-1';
process.env.DDB_TABLE = 'test-table';
process.env.S3_BUCKET = 'test-bucket';
process.env.LLM_ENDPOINT = 'https://api.test.com/v1/chat/completions';
process.env.CART_TABLE = 'test-cart-table';
process.env.WISHLIST_TABLE = 'test-wishlist-table';

// Mock AWS SDK DynamoDB Document Client
const mockSend = jest.fn().mockResolvedValue({
  Item: undefined,
});

const mockGetCommand = jest.fn((params) => params);
const mockPutCommand = jest.fn((params) => params);
const mockUpdateCommand = jest.fn((params) => params);
const mockDeleteCommand = jest.fn((params) => params);

jest.mock('@aws-sdk/lib-dynamodb', () => ({
  DynamoDBDocumentClient: {
    from: jest.fn(() => ({
      send: mockSend,
    })),
  },
  GetCommand: mockGetCommand,
  PutCommand: mockPutCommand,
  UpdateCommand: mockUpdateCommand,
  DeleteCommand: mockDeleteCommand,
}));

// Mock @aws-sdk/client-dynamodb
jest.mock('@aws-sdk/client-dynamodb', () => ({
  DynamoDBClient: jest.fn(() => ({})),
  DescribeTableCommand: jest.fn(),
}));

// Suppress console warnings during tests
const originalWarn = console.warn;
console.warn = (...args) => {
  // Only suppress AWS SDK warnings
  if (args[0] && typeof args[0] === 'string' && args[0].includes('AWS SDK')) {
    return;
  }
  originalWarn.apply(console, args);
};
