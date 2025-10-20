# SOYL Server - AWS Lambda Handler

This package contains the AWS Lambda handler for the SOYL design generation API.

## Features

- **AWS Lambda Handler**: Production-ready TypeScript Lambda function
- **LLM Integration**: Supports Gemini and OpenAI APIs via AWS Secrets Manager
- **Storage**: DynamoDB for design metadata, S3 for preview images
- **Retrieval**: Optional Perplexity API integration for context
- **Local Development**: Express server for local testing

## Quick Start

### Local Development

1. **Install dependencies**:
   ```bash
   cd packages/server
   pnpm install
   ```

2. **Build TypeScript**:
   ```bash
   pnpm run build
   ```

3. **Run local server**:
   ```bash
   node local-run.js
   ```

4. **Test endpoints**:
   ```bash
   # Health check
   curl http://localhost:3001/health
   
   # Generate design
   curl -X POST http://localhost:3001/designs \
     -H "Content-Type: application/json" \
     -d '{"brief":"Create a vintage travel poster"}'
   ```

### Testing

```bash
# Run unit tests
pnpm test

# Run tests with coverage
pnpm test -- --coverage
```

### AWS Deployment

1. **Set up AWS credentials**:
   ```bash
   aws configure
   ```

2. **Deploy with CDK**:
   ```bash
   npm install -g aws-cdk
   cdk bootstrap
   cdk deploy
   ```

## Environment Variables

### Required for Production
- `AWS_REGION`: AWS region (default: us-east-1)
- `DDB_TABLE`: DynamoDB table name (default: SOYL-Designs)
- `S3_BUCKET`: S3 bucket name (default: soyl-assets)

### Optional
- `LLM_ENDPOINT`: Custom LLM API endpoint
- `PERPLEXITY_API_KEY`: Perplexity API key for retrieval

## AWS Secrets Manager

Store your API keys in AWS Secrets Manager:

- `SOYL/GEMINI_API_KEY`: Gemini API key (preferred)
- `SOYL/OPENAI_API_KEY`: OpenAI API key (fallback)

## API Endpoints

### POST /designs

Generate a new design based on a brief.

**Request Body**:
```json
{
  "brief": "Create a vintage travel poster for Paris",
  "userId": "user123",
  "options": {
    "product": "t-shirt",
    "canvas": { "w": 4500, "h": 5400 },
    "style": "vintage",
    "retrieval": true
  }
}
```

**Response**:
```json
{
  "designId": "uuid-here",
  "design": {
    "title": "Paris Travel Poster",
    "placements": [...],
    "palette": ["#D4AF37", "#0b0b0b", "#ffffff"],
    "fonts": [...],
    "production_notes": "..."
  },
  "previewUrl": "s3://bucket/path/to/preview.png"
}
```

### GET /designs

Health check endpoint.

**Response**:
```json
{
  "msg": "designs lambda healthy"
}
```

## Architecture

```
Client Request
     ↓
API Gateway
     ↓
Lambda Handler
     ↓
┌─────────────────┬─────────────────┬─────────────────┐
│   Secrets       │   DynamoDB      │      S3         │
│   Manager       │   (Designs)     │   (Assets)      │
└─────────────────┴─────────────────┴─────────────────┘
     ↓
┌─────────────────┬─────────────────┐
│   LLM APIs      │   Perplexity    │
│ (Gemini/OpenAI) │   (Retrieval)   │
└─────────────────┴─────────────────┘
```

## Development Scripts

- `pnpm run build`: Compile TypeScript to JavaScript
- `pnpm run dev`: Run with ts-node for development
- `pnpm run dev:express`: Run Express server for local testing
- `pnpm run test`: Run Jest unit tests
- `pnpm run start`: Run compiled JavaScript

## Security

- Input sanitization for prompt injection prevention
- AWS IAM least-privilege permissions
- API keys stored in AWS Secrets Manager
- Request validation and error handling
