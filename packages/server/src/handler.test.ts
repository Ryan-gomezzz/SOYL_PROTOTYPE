import { handler } from './handler';
import { SecretsManagerClient, GetSecretValueCommand } from '@aws-sdk/client-secrets-manager';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';

// Mock AWS SDK clients
jest.mock('@aws-sdk/client-secrets-manager');
jest.mock('@aws-sdk/client-s3');
jest.mock('@aws-sdk/lib-dynamodb');
jest.mock('uuid', () => ({
  v4: () => 'test-design-id-123'
}));

// Mock fetch for LLM calls
global.fetch = jest.fn();

const mockSecretsManager = SecretsManagerClient as jest.MockedClass<typeof SecretsManagerClient>;
const mockS3Client = S3Client as jest.MockedClass<typeof S3Client>;
const mockDynamoDB = DynamoDBDocumentClient as jest.MockedClass<typeof DynamoDBDocumentClient>;

describe('Lambda Handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock successful secret retrieval
    mockSecretsManager.prototype.send = jest.fn().mockResolvedValue({
      SecretString: 'test-api-key'
    });
    
    // Mock successful S3 upload
    mockS3Client.prototype.send = jest.fn().mockResolvedValue({});
    
    // Mock successful DynamoDB put
    mockDynamoDB.prototype.send = jest.fn().mockResolvedValue({});
  });

  it('should handle GET request for health check', async () => {
    const event = {
      httpMethod: 'GET',
      path: '/designs',
      body: null
    } as any;

    const result = await handler(event);
    
    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toEqual({ msg: 'designs lambda healthy' });
  });

  it('should handle POST request with valid brief', async () => {
    // Mock successful LLM response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        choices: [{
          message: {
            content: JSON.stringify({
              title: 'Test Design',
              placements: [
                {
                  area: 'front',
                  type: 'text',
                  x: 100,
                  y: 100,
                  width: 200,
                  height: 50,
                  content: { text: 'Test Text' }
                }
              ],
              palette: ['#FF0000', '#00FF00', '#0000FF'],
              production_notes: 'Test notes'
            })
          }
        }]
      })
    });

    // Mock preview image fetch
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(100))
    });

    const event = {
      httpMethod: 'POST',
      path: '/designs',
      body: JSON.stringify({
        brief: 'Create a test design',
        userId: 'test-user',
        options: {
          product: 't-shirt',
          canvas: { w: 1000, h: 1000 },
          style: 'modern'
        }
      })
    } as any;

    const result = await handler(event);
    
    expect(result.statusCode).toBe(200);
    const responseBody = JSON.parse(result.body);
    expect(responseBody.designId).toBe('test-design-id-123');
    expect(responseBody.design.title).toBe('Test Design');
    expect(responseBody.design.placements).toHaveLength(1);
    expect(responseBody.design.palette).toEqual(['#FF0000', '#00FF00', '#0000FF']);
  });

  it('should handle missing brief', async () => {
    const event = {
      httpMethod: 'POST',
      path: '/designs',
      body: JSON.stringify({})
    } as any;

    const result = await handler(event);
    
    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body)).toEqual({ error: 'brief required' });
  });

  it('should handle invalid JSON body', async () => {
    const event = {
      httpMethod: 'POST',
      path: '/designs',
      body: 'invalid json'
    } as any;

    const result = await handler(event);
    
    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body)).toEqual({ error: 'invalid json body' });
  });

  it('should handle missing body', async () => {
    const event = {
      httpMethod: 'POST',
      path: '/designs',
      body: null
    } as any;

    const result = await handler(event);
    
    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body)).toEqual({ error: 'missing body' });
  });

  it('should sanitize brief input', async () => {
    // Mock successful LLM response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        choices: [{
          message: {
            content: JSON.stringify({
              title: 'Test Design',
              placements: [],
              palette: ['#FF0000']
            })
          }
        }]
      })
    });

    // Mock preview image fetch
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(100))
    });

    const event = {
      httpMethod: 'POST',
      path: '/designs',
      body: JSON.stringify({
        brief: 'Test brief with control characters\x00\x01\x02 and very long text '.repeat(100)
      })
    } as any;

    const result = await handler(event);
    
    expect(result.statusCode).toBe(200);
    // Should not throw error due to sanitization
  });

  it('should handle LLM API failure', async () => {
    // Mock failed LLM response
    (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('API Error'));

    const event = {
      httpMethod: 'POST',
      path: '/designs',
      body: JSON.stringify({
        brief: 'Test brief'
      })
    } as any;

    const result = await handler(event);
    
    expect(result.statusCode).toBe(502);
    expect(JSON.parse(result.body)).toEqual({ error: 'LLM provider error' });
  });

  it('should handle invalid LLM JSON response', async () => {
    // Mock invalid LLM response
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({
        choices: [{
          message: {
            content: 'invalid json response'
          }
        }]
      })
    });

    const event = {
      httpMethod: 'POST',
      path: '/designs',
      body: JSON.stringify({
        brief: 'Test brief'
      })
    } as any;

    const result = await handler(event);
    
    expect(result.statusCode).toBe(502);
    // The handler will retry and eventually fail with LLM provider error
    expect(JSON.parse(result.body)).toEqual({ error: 'LLM provider error' });
  });

  it('should work without API keys (mock mode)', async () => {
    // Mock no secrets available
    mockSecretsManager.prototype.send = jest.fn().mockRejectedValue(new Error('No secrets'));

    const event = {
      httpMethod: 'POST',
      path: '/designs',
      body: JSON.stringify({
        brief: 'Test brief'
      })
    } as any;

    const result = await handler(event);
    
    expect(result.statusCode).toBe(200);
    const responseBody = JSON.parse(result.body);
    expect(responseBody.design.title).toBe('Local Mock Design');
  });
});
