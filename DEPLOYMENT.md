# SOYL Deployment Runbook

## Prereqs
- AWS CLI configured (`aws configure`)
- CDK v2 installed (`pnpm exec cdk --version`), or `npm i -g aws-cdk`
- Node 22+, pnpm v10+
- GitHub repo + Actions secrets (AWS creds, VERCEL_TOKEN or VOXEL_TOKEN)
- LLM keys (Gemini, OpenAI, Perplexity) stored in AWS Secrets Manager

## Step 0 — Install deps
From repo root:
```cmd
pnpm install
cd packages\server
pnpm install
cd ../app
pnpm install
```

## Step 1 — Build server TS
```cmd
cd packages\server
pnpm run build:ts
```

## Step 2 — Deploy CDK (bootstrap once per region/account)
```cmd
# bootstrap (only first time per account/region)
pnpm exec cdk bootstrap aws://<ACCOUNT_ID>/<REGION>

# deploy (non-interactive)
pnpm exec cdk deploy --require-approval never
```

Note outputs: ApiUrl, LambdaName, ImageWorkerName, DDB Table, S3 Bucket, ImageQueueUrl, Cognito IDs.

## Step 3 — Create Secrets
```cmd
aws secretsmanager create-secret --name "SOYL/GEMINI_API_KEY" --secret-string "<GEMINI_KEY>"
aws secretsmanager create-secret --name "SOYL/OPENAI_API_KEY" --secret-string "<OPENAI_KEY>"
aws secretsmanager create-secret --name "SOYL/IMAGE_API_KEY" --secret-string "<IMAGE_KEY>"
aws secretsmanager create-secret --name "SOYL/PERPLEXITY_API_KEY" --secret-string "<PERPLEXITY_KEY>"
```

If secret exists, use put-secret-value.

## Step 4 — Configure env (Lambda env already set via CDK; ensure IMAGE_API_ENDPOINT visible)

If you store IMAGE_API_KEY in Secrets Manager, ensure worker Lambda reads it. You can set IMAGE_API_ENDPOINT in Lambda env using aws lambda update-function-configuration if needed.

## Step 5 — Test API endpoints

Health:
```cmd
curl <API_URL>/health
```

Create design (triggers orchestration and enqueues image job):
```cmd
curl -X POST "<API_URL>/designs" -H "Content-Type: application/json" -d "{\"brief\":\"Test: midnight jacket\",\"options\":{\"product\":\"jacket\",\"style\":\"modern royal\",\"retrieval\":true}}"
```

Check status (replace designId):
```cmd
curl "<API_URL>/concepts/<designId>"
```

## Step 6 — View SQS / Worker logs

Tail Lambda logs:
```cmd
aws logs tail /aws/lambda/<ImageWorkerName> --follow --region <REGION>
```

Check S3:
```cmd
aws s3 ls s3://soyl-assets-<REGION>/designs/<designId>/
```

## Step 7 — Frontend

Set env VITE_API_BASE and VITE_COGNITO_* values in your hosting provider and deploy.

## Security & Monitoring (must do)

Enable CloudWatch Alarms for Lambda error rate, bill alerts.

Enable WAF and API throttling (configured in CDK).

Rotate secrets regularly and restrict access via IAM.

## Rollback

Use cdk deploy to update or cdk destroy to remove resources in a dev stack.

For Lambda code rollback: use aws lambda update-function-code --function-name <name> --s3-bucket <bucket> --s3-key <key> or use cdk deploy with prior artifact.
