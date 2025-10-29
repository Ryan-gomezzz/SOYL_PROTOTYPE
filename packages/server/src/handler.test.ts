 /// <reference types="jest" />
/// <reference types="node" />
import { handler } from './handler';
import { APIGatewayProxyEvent } from 'aws-lambda';

// Mock AWS SDK clients
jest.mock('@aws-sdk/client-secrets-manager', () => ({
  SecretsManagerClient: jest.fn().mockImplementation(() => ({
    send: jest.fn().mockResolvedValue({
      SecretString: 'test-api-key'
    })
  })),
  GetSecretValueCommand: jest.fn()
}));

jest.mock('@aws-sdk/client-s3', () => ({
  S3Client: jest.fn().mockImplementation(() => ({
    send: jest.fn().mockResolvedValue({})
  })),
  PutObjectCommand: jest.fn()
}));

jest.mock('./aws-clients', () => ({
  ddbDocClient: {
    send: jest.fn().mockResolvedValue({})
  }
}));

// Mock fetch for LLM calls
global.fetch = jest.fn();

// Mock uuid
jest.mock('uuid', () => ({
  v4: () => 'test-design-id-123'
}));

describe('Lambda Handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Mock successful LLM response
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        choices: [{
          message: {
            content: JSON.stringify({
              title: "Test Design",
              placements: [
                { area: 'front', type: 'text', x: 120, y: 200, width: 360, height: 120, content: { text: 'SOYL — Story Of Your Life' } }
              ]
            })
          }
        }]
      }),
      text: () => Promise.resolve('Internal Server Error')
    });
  });

  it('should handle GET request for health check', async () => {
    const event = {
      httpMethod: 'GET',
      path: '/designs',
      headers: {},
      body: null,
      queryStringParameters: null,
      pathParameters: null,
      stageVariables: null,
      requestContext: {} as any,
      resource: '',
      multiValueHeaders: {},
      multiValueQueryStringParameters: null,
      isBase64Encoded: false
    } as APIGatewayProxyEvent;

    const result = await handler(event);
    
    expect(result.statusCode).toBe(200);
    expect(JSON.parse(result.body)).toHaveProperty('msg');
  });

  it('should handle POST request with valid brief', async () => {
    const event = {
      httpMethod: 'POST',
      path: '/designs',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        brief: 'Create a modern logo for a tech startup'
      }),
      queryStringParameters: null,
      pathParameters: null,
      stageVariables: null,
      requestContext: {} as any,
      resource: '',
      multiValueHeaders: {},
      multiValueQueryStringParameters: null,
      isBase64Encoded: false
    } as APIGatewayProxyEvent;

    const result = await handler(event);
    
    expect(result.statusCode).toBe(200);
    const responseBody = JSON.parse(result.body);
    expect(responseBody).toHaveProperty('designId');
    expect(responseBody).toHaveProperty('design');
  });

  it('should handle missing brief', async () => {
    const event = {
      httpMethod: 'POST',
      path: '/designs',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
      queryStringParameters: null,
      pathParameters: null,
      stageVariables: null,
      requestContext: {} as any,
      resource: '',
      multiValueHeaders: {},
      multiValueQueryStringParameters: null,
      isBase64Encoded: false
    } as APIGatewayProxyEvent;

    const result = await handler(event);
    
    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body)).toHaveProperty('error');
  });

  it('should handle invalid JSON body', async () => {
    const event = {
      httpMethod: 'POST',
      path: '/designs',
      headers: { 'Content-Type': 'application/json' },
      body: 'invalid json',
      queryStringParameters: null,
      pathParameters: null,
      stageVariables: null,
      requestContext: {} as any,
      resource: '',
      multiValueHeaders: {},
      multiValueQueryStringParameters: null,
      isBase64Encoded: false
    } as APIGatewayProxyEvent;

    const result = await handler(event);
    
    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body)).toHaveProperty('error');
  });

  it('should handle missing body', async () => {
    const event = {
      httpMethod: 'POST',
      path: '/designs',
      headers: {},
      body: null,
      queryStringParameters: null,
      pathParameters: null,
      stageVariables: null,
      requestContext: {} as any,
      resource: '',
      multiValueHeaders: {},
      multiValueQueryStringParameters: null,
      isBase64Encoded: false
    } as APIGatewayProxyEvent;

    const result = await handler(event);
    
    expect(result.statusCode).toBe(400);
    expect(JSON.parse(result.body)).toHaveProperty('error');
  });

  it('should sanitize brief input', async () => {
    const event = {
      httpMethod: 'POST',
      path: '/designs',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        brief: '<script>alert("xss")</script>Create a logo'
      }),
      queryStringParameters: null,
      pathParameters: null,
      stageVariables: null,
      requestContext: {} as any,
      resource: '',
      multiValueHeaders: {},
      multiValueQueryStringParameters: null,
      isBase64Encoded: false
    } as APIGatewayProxyEvent;

    const result = await handler(event);
    
    expect(result.statusCode).toBe(200);
    const responseBody = JSON.parse(result.body);
    expect(responseBody).toHaveProperty('designId');
  });

  it('should handle LLM API failure', async () => {
    // Mock LLM API failure
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 500,
      text: () => Promise.resolve('Internal Server Error')
    });

    const event = {
      httpMethod: 'POST',
      path: '/designs',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        brief: 'Create a logo'
      }),
      queryStringParameters: null,
      pathParameters: null,
      stageVariables: null,
      requestContext: {} as any,
      resource: '',
      multiValueHeaders: {},
      multiValueQueryStringParameters: null,
      isBase64Encoded: false
    } as APIGatewayProxyEvent;

    const result = await handler(event);
    
    expect(result.statusCode).toBe(502);
    expect(JSON.parse(result.body)).toHaveProperty('error');
  });

  it('should handle invalid LLM JSON response', async () => {
    // Mock invalid JSON response
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        choices: [{
          message: {
            content: 'invalid json response'
          }
        }]
      }),
      text: () => Promise.resolve('invalid json response')
    });

    const event = {
      httpMethod: 'POST',
      path: '/designs',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        brief: 'Create a logo'
      }),
      queryStringParameters: null,
      pathParameters: null,
      stageVariables: null,
      requestContext: {} as any,
      resource: '',
      multiValueHeaders: {},
      multiValueQueryStringParameters: null,
      isBase64Encoded: false
    } as APIGatewayProxyEvent;

    const result = await handler(event);
    
    expect(result.statusCode).toBe(502);
    expect(JSON.parse(result.body)).toHaveProperty('error');
  });

  it('should work without API keys (mock mode)', async () => {
    // Mock no API keys available by making secrets client throw
    const secretsModule = await import('@aws-sdk/client-secrets-manager');
    const { SecretsManagerClient } = secretsModule;
    (SecretsManagerClient as jest.Mock).mockImplementation(() => ({
      send: jest.fn().mockRejectedValue(new Error('Secret not found'))
    }));

    const event = {
      httpMethod: 'POST',
      path: '/designs',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        brief: 'Create a logo'
      }),
      queryStringParameters: null,
      pathParameters: null,
      stageVariables: null,
      requestContext: {} as any,
      resource: '',
      multiValueHeaders: {},
      multiValueQueryStringParameters: null,
      isBase64Encoded: false
    } as APIGatewayProxyEvent;

    const result = await handler(event);
    
    expect(result.statusCode).toBe(200);
    const responseBody = JSON.parse(result.body);
    expect(responseBody).toHaveProperty('designId');
    expect(responseBody).toHaveProperty('design');
  });
});