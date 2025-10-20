# SOYL - Story Of Your Life

A complete AI-powered fashion design platform with async image generation, built with React, TypeScript, AWS Lambda, and SQS.

## 🚀 Live Demo

**API Endpoint**: https://8zaa4i3xma.execute-api.ap-south-1.amazonaws.com/prod/

## ✨ Features

### 🎨 AI Design Generation
- **LLM Orchestration**: Gemini API with OpenAI fallback
- **Retrieval-Augmented Generation**: Perplexity API integration
- **Schema Validation**: Robust JSON parsing with retry logic
- **Prompt Engineering**: Sophisticated system and user prompts

### 🖼️ Async Image Generation
- **SQS Queue**: Async image processing pipeline
- **Worker Lambda**: Dedicated image generation worker
- **S3 Storage**: Secure image storage with signed URLs
- **DynamoDB**: Design metadata and status tracking

### 🔐 Security & Monitoring
- **AWS WAF**: OWASP managed rules protection
- **X-Ray Tracing**: Complete request tracing
- **IAM Least Privilege**: Minimal permissions
- **Secrets Manager**: Secure API key storage

### 🌐 Complete API
- **POST /designs**: Generate designs with LLM orchestration
- **GET /concepts/:id**: Status polling for frontend
- **GET /health**: System health monitoring
- **CORS Enabled**: Frontend integration ready

## 🏗️ Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   React App     │───▶│   API Gateway    │───▶│  Main Lambda    │
│   (Frontend)    │    │                  │    │  (Design Gen)   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                         │
                                                         ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   S3 Bucket     │◀───│  Image Worker    │◀───│   SQS Queue     │
│  (Images)       │    │    Lambda        │    │  (Async Jobs)   │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         ▲                                               ▲
         │                                               │
┌─────────────────┐                            ┌─────────────────┐
│   DynamoDB      │                            │  Secrets Manager│
│  (Metadata)     │                            │   (API Keys)    │
└─────────────────┘                            └─────────────────┘
```

## 🛠️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for fast development
- **Tailwind CSS** for styling
- **Fabric.js** for canvas interactions
- **Cognito** for authentication

### Backend
- **AWS Lambda** (Node.js 18)
- **API Gateway** for REST endpoints
- **SQS** for async processing
- **DynamoDB** for data storage
- **S3** for file storage
- **AWS CDK** for infrastructure

### AI/ML
- **Gemini API** (primary LLM)
- **OpenAI API** (fallback)
- **Perplexity API** (retrieval)

## 📦 Project Structure

```
soyl-mvp/
├── packages/
│   ├── app/                    # React frontend
│   │   ├── src/
│   │   │   ├── components/     # React components
│   │   │   │   └── Auth.tsx    # Cognito authentication
│   │   │   ├── App.tsx         # Main app component
│   │   │   └── main.tsx        # App entry point
│   │   ├── package.json
│   │   └── vite.config.ts
│   └── server/                 # AWS Lambda backend
│       ├── src/
│       │   ├── handler-full.ts # Main Lambda handler
│       │   ├── image-worker.ts # SQS worker
│       │   └── presign-get.ts  # S3 utilities
│       ├── dist/               # Compiled JavaScript
│       ├── cdk-stack-simple.js # CDK infrastructure
│       └── package.json
├── DEPLOYMENT.md               # Deployment guide
├── package.json               # Root package.json
└── pnpm-workspace.yaml        # Workspace config
```

## 🚀 Quick Start

### Prerequisites
- Node.js 22+
- pnpm v10+
- AWS CLI configured
- AWS CDK v2

### 1. Install Dependencies
```bash
pnpm install
cd packages/server && pnpm install
cd ../app && pnpm install
```

### 2. Deploy Infrastructure
```bash
cd packages/server
pnpm run build:ts
pnpm exec cdk deploy --require-approval never
```

### 3. Set Up Secrets
```bash
aws secretsmanager create-secret --name "SOYL/GEMINI_API_KEY" --secret-string "<YOUR_GEMINI_KEY>"
aws secretsmanager create-secret --name "SOYL/OPENAI_API_KEY" --secret-string "<YOUR_OPENAI_KEY>"
aws secretsmanager create-secret --name "SOYL/IMAGE_API_KEY" --secret-string "<YOUR_IMAGE_KEY>"
```

### 4. Test API
```bash
curl -X POST "https://8zaa4i3xma.execute-api.ap-south-1.amazonaws.com/prod/designs" \
  -H "Content-Type: application/json" \
  -d '{"brief":"Midnight gold jacket for gala","options":{"product":"jacket","style":"modern royal","retrieval":true}}'
```

### 5. Run Frontend
```bash
cd packages/app
pnpm run dev
```

## 📊 API Examples

### Generate Design
```bash
curl -X POST "https://8zaa4i3xma.execute-api.ap-south-1.amazonaws.com/prod/designs" \
  -H "Content-Type: application/json" \
  -d '{
    "brief": "Vintage travel poster for Paris",
    "options": {
      "product": "t-shirt",
      "style": "vintage",
      "retrieval": true,
      "canvas": {"w": 4500, "h": 5400}
    }
  }'
```

### Check Status
```bash
curl "https://8zaa4i3xma.execute-api.ap-south-1.amazonaws.com/prod/concepts/{designId}"
```

## 🔧 Environment Variables

### Frontend (.env)
```env
VITE_API_BASE=https://8zaa4i3xma.execute-api.ap-south-1.amazonaws.com/prod/
VITE_COGNITO_USER_POOL_ID=us-east-1_xxx
VITE_COGNITO_CLIENT_ID=xxxxxxxxxxxx
```

### Backend (Lambda Environment)
```env
DDB_TABLE=SOYL-Designs
S3_BUCKET=soyl-assets-ap-south-1
IMAGE_QUEUE_URL=https://sqs.ap-south-1.amazonaws.com/381492072674/soyl-image-queue
```

## 💰 Cost Estimation

- **Lambda**: ~$0.20 per 1M requests
- **API Gateway**: ~$3.50 per 1M requests
- **DynamoDB**: ~$1.25 per 1M requests
- **S3**: ~$0.023 per GB/month
- **SQS**: ~$0.40 per 1M requests
- **Secrets Manager**: $0.40 per secret/month

**Total**: ~$5-10/month for development usage

## 🛡️ Security Features

- **WAF Protection**: OWASP managed rules
- **IAM Least Privilege**: Minimal permissions
- **Secrets Encryption**: AWS Secrets Manager
- **VPC Integration**: Ready for private networking
- **CORS Configuration**: Secure cross-origin requests

## 📈 Monitoring & Observability

- **X-Ray Tracing**: Complete request tracing
- **CloudWatch Logs**: Centralized logging
- **CloudWatch Metrics**: Performance monitoring
- **Error Tracking**: Automatic error capture

## 🚀 Deployment Options

### Frontend
- **Vercel**: One-click deployment
- **Voxel**: Alternative hosting
- **AWS S3 + CloudFront**: Static hosting

### Backend
- **AWS CDK**: Infrastructure as code
- **GitHub Actions**: CI/CD pipeline
- **Manual Deployment**: Direct CDK deploy

## 📚 Documentation

- [DEPLOYMENT.md](./DEPLOYMENT.md) - Complete deployment guide
- [API Documentation](./docs/api.md) - API reference
- [Architecture Guide](./docs/architecture.md) - System design

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see [LICENSE](./LICENSE) for details

## 🆘 Support

- **Issues**: [GitHub Issues](https://github.com/Ryan-gomezzz/SOYL_PROTOTYPE/issues)
- **Discussions**: [GitHub Discussions](https://github.com/Ryan-gomezzz/SOYL_PROTOTYPE/discussions)
- **Email**: [Your Email]

---

**Built with ❤️ by [Your Name]**