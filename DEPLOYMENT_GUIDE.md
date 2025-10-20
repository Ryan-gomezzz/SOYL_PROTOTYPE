# SOYL MVP - Complete Deployment Guide

This guide provides step-by-step instructions for deploying the SOYL MVP to AWS with CDK and frontend to your preferred hosting platform.

## Prerequisites

- AWS CLI configured with appropriate permissions
- Node.js 18+ and pnpm installed
- AWS CDK CLI installed globally: `npm install -g aws-cdk`

## Part A: Backend Deployment (AWS Lambda + CDK)

### 1. Deploy Backend Infrastructure

Run these commands from the project root:

```cmd
cd C:\SOYL\soyl-mvp\packages\server
pnpm install
pnpm run build:ts
pnpm exec cdk bootstrap aws://<ACCOUNT_ID>/<REGION>
pnpm run cdk:deploy
```

**Note**: Replace `<ACCOUNT_ID>` and `<REGION>` with your AWS account ID and preferred region (e.g., `aws://123456789012/us-east-1`).

### 2. Create AWS Secrets

After deployment, create the required secrets:

```cmd
aws secretsmanager create-secret --name "SOYL/GEMINI_API_KEY" --secret-string "<YOUR_GEMINI_KEY>"
aws secretsmanager create-secret --name "SOYL/OPENAI_API_KEY" --secret-string "<YOUR_OPENAI_KEY>"
aws secretsmanager create-secret --name "SOYL/PERPLEXITY_API_KEY" --secret-string "<YOUR_PERPLEXITY_KEY>"
```

### 3. Update Lambda Environment (if needed)

If you need to add additional environment variables:

```cmd
aws lambda update-function-configuration --function-name <LambdaName> --environment Variables="{DDB_TABLE=SOYL-Designs,S3_BUCKET=soyl-assets,LLM_ENDPOINT=https://api.openai.com/v1/chat/completions}"
```

Replace `<LambdaName>` with the Lambda function name from CDK output.

## Part B: Frontend Deployment Options

### Option 1: Vercel (Recommended - Zero Infrastructure)

1. **Set up Vercel project**:
   - Go to [vercel.com](https://vercel.com)
   - Import your GitHub repository
   - Set root directory to `packages/app`

2. **Configure GitHub Secrets**:
   - `VERCEL_TOKEN`: Your Vercel API token
   - `VERCEL_ORG_ID`: Your Vercel organization ID
   - `VERCEL_PROJECT_ID`: Your Vercel project ID

3. **Set Environment Variables**:
   - `VITE_API_BASE`: Your API Gateway URL (from CDK output)

4. **Deploy**: Push to main branch - GitHub Actions will handle deployment

### Option 2: Voxel

1. **Set up Voxel CLI**:
   - Install Voxel CLI: `npm install -g @voxel/cli`
   - Get your Voxel token

2. **Configure GitHub Secrets**:
   - `VOXEL_TOKEN`: Your Voxel API token

3. **Deploy**: Push to main branch - GitHub Actions will handle deployment

### Option 3: AWS S3 + CloudFront

1. **Create S3 bucket** for hosting
2. **Configure GitHub Secrets**:
   - `AWS_ACCESS_KEY_ID`: AWS access key
   - `AWS_SECRET_ACCESS_KEY`: AWS secret key
   - `AWS_S3_BUCKET`: Your S3 bucket name
   - `AWS_REGION`: AWS region

3. **Deploy**: Push to main branch - GitHub Actions will sync to S3

## Part C: Testing & Verification

### 1. Test Backend API

```cmd
# Health check
curl <API_GATEWAY_URL>/health

# Generate design
curl -X POST <API_GATEWAY_URL>/designs \
  -H "Content-Type: application/json" \
  -d '{"brief":"Create a vintage travel poster for Paris"}'
```

### 2. Test Frontend

1. Open your deployed frontend URL
2. Navigate to the Fashion Studio component
3. Enter a design brief and click "Create Concept"
4. Verify the design is generated and displayed

## Part D: Monitoring & Maintenance

### 1. CloudWatch Logs

Monitor Lambda execution logs:
```cmd
aws logs describe-log-groups --log-group-name-prefix "/aws/lambda/SoylStack"
```

### 2. DynamoDB Monitoring

Check design storage:
```cmd
aws dynamodb scan --table-name SOYL-Designs --limit 5
```

### 3. S3 Asset Monitoring

List generated previews:
```cmd
aws s3 ls s3://soyl-assets/designs/ --recursive
```

## Troubleshooting

### Common Issues

1. **CDK Bootstrap Fails**:
   - Ensure AWS CLI is configured correctly
   - Check IAM permissions for CDK operations

2. **Lambda Timeout**:
   - Increase timeout in CDK stack (currently 30 seconds)
   - Check LLM API response times

3. **CORS Issues**:
   - Verify API Gateway CORS configuration
   - Check frontend API_BASE environment variable

4. **Secrets Not Found**:
   - Verify secret names match exactly
   - Check IAM permissions for Secrets Manager

### Environment Variables Reference

**Backend (Lambda)**:
- `DDB_TABLE`: DynamoDB table name
- `S3_BUCKET`: S3 bucket name
- `LLM_ENDPOINT`: Custom LLM API endpoint (optional)

**Frontend**:
- `VITE_API_BASE`: API Gateway base URL

**AWS Secrets Manager**:
- `SOYL/GEMINI_API_KEY`: Gemini API key (preferred)
- `SOYL/OPENAI_API_KEY`: OpenAI API key (fallback)
- `SOYL/PERPLEXITY_API_KEY`: Perplexity API key (optional)

## Cost Optimization

1. **DynamoDB**: Uses pay-per-request billing
2. **Lambda**: 1GB memory, 30-second timeout
3. **S3**: Standard storage for preview images
4. **API Gateway**: Pay per request

## Security Considerations

1. **IAM**: Least-privilege permissions
2. **Secrets**: Stored in AWS Secrets Manager
3. **CORS**: Configured for specific origins
4. **Input Validation**: Sanitized user inputs

## Next Steps

1. Set up monitoring and alerting
2. Implement rate limiting
3. Add authentication/authorization
4. Optimize for production scale
5. Set up CI/CD for automated deployments
