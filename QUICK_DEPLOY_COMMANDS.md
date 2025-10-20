# SOYL MVP - Quick Deploy Commands (CMD Ready)

## Complete Deployment Checklist

### 1. Backend Deployment (AWS Lambda + CDK)

```cmd
cd C:\SOYL\soyl-mvp\packages\server
pnpm install
pnpm run build:ts
pnpm exec cdk bootstrap aws://<ACCOUNT_ID>/<REGION>
pnpm run cdk:deploy
```

**Replace placeholders**:
- `<ACCOUNT_ID>`: Your AWS account ID (12 digits)
- `<REGION>`: Your preferred AWS region (e.g., `us-east-1`)

### 2. Create AWS Secrets

```cmd
aws secretsmanager create-secret --name "SOYL/GEMINI_API_KEY" --secret-string "<YOUR_GEMINI_KEY>"
aws secretsmanager create-secret --name "SOYL/OPENAI_API_KEY" --secret-string "<YOUR_OPENAI_KEY>"
aws secretsmanager create-secret --name "SOYL/PERPLEXITY_API_KEY" --secret-string "<YOUR_PERPLEXITY_KEY>"
```

### 3. Update Lambda Environment (if needed)

```cmd
aws lambda update-function-configuration --function-name <LambdaName> --environment Variables="{DDB_TABLE=SOYL-Designs,S3_BUCKET=soyl-assets}"
```

**Replace `<LambdaName>`** with the Lambda function name from CDK output.

### 4. Frontend Deployment Setup

**Choose ONE option**:

#### Option A: Vercel (Recommended)
1. Set GitHub Secrets: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`
2. Set Environment Variable: `VITE_API_BASE` = your API Gateway URL
3. Push to main branch

#### Option B: Voxel
1. Set GitHub Secret: `VOXEL_TOKEN`
2. Set Environment Variable: `VITE_API_BASE` = your API Gateway URL
3. Push to main branch

#### Option C: AWS S3
1. Set GitHub Secrets: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_S3_BUCKET`, `AWS_REGION`
2. Set Environment Variable: `VITE_API_BASE` = your API Gateway URL
3. Push to main branch

### 5. Test Deployment

```cmd
# Health check
curl <API_GATEWAY_URL>/health

# Generate design
curl -X POST <API_GATEWAY_URL>/designs -H "Content-Type: application/json" -d "{\"brief\":\"Create a vintage travel poster\"}"
```

**Replace `<API_GATEWAY_URL>`** with the URL from CDK output.

## Current Status

✅ **Backend**: Ready for CDK deployment
✅ **Frontend**: Ready for hosting platform deployment
✅ **Tests**: All passing (9/9)
✅ **CDK Stack**: Complete with IAM permissions
✅ **GitHub Actions**: Ready for automated deployment

## Next Steps

1. Run the CDK deployment commands above
2. Create AWS secrets with your API keys
3. Choose and configure your frontend hosting platform
4. Set the `VITE_API_BASE` environment variable to your API Gateway URL
5. Push to main branch to trigger automated deployment
6. Test the complete system

## Architecture Summary

- **Backend**: AWS Lambda + API Gateway + DynamoDB + S3
- **Frontend**: React + Vite + Tailwind + Fabric.js
- **Deployment**: CDK for backend, GitHub Actions for frontend
- **Storage**: DynamoDB for designs, S3 for preview images
- **LLM Integration**: Gemini (preferred) + OpenAI (fallback)
- **Security**: AWS Secrets Manager + IAM least-privilege
