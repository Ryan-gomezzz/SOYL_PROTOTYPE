# Image Generation Setup Guide

This guide explains how to configure image generation for the SOYL backend. The system supports multiple image generation providers with automatic fallback to placeholders.

## 🎨 Supported Providers

### 1. **Gemini Image Generation (Imagen 3)** - Recommended
- **Provider**: Google Gemini Imagen 3.0
- **Quality**: High-quality, fast generation
- **Cost**: Pay-per-use
- **Setup**: Requires Google Cloud API key

### 2. **OpenAI DALL-E 3**
- **Provider**: OpenAI DALL-E 3
- **Quality**: Excellent quality, creative outputs
- **Cost**: $0.040 per image (1024x1024)
- **Setup**: Requires OpenAI API key

### 3. **Stability AI (SDXL)**
- **Provider**: Stability AI Stable Diffusion XL
- **Quality**: High-quality, customizable
- **Cost**: $0.004 per image
- **Setup**: Requires Stability AI API key

### 4. **Replicate**
- **Provider**: Various models via Replicate
- **Quality**: Depends on model chosen
- **Cost**: Varies by model
- **Setup**: Requires Replicate API key

### 5. **Placeholder (Default)**
- **Provider**: Placeholder.com
- **Quality**: Basic placeholder images
- **Cost**: Free
- **Setup**: No setup required

## 🔧 Configuration Steps

### Step 1: Choose Your Provider

Set the `IMAGE_PROVIDER` environment variable in your Lambda:

```bash
# For Gemini (recommended)
aws lambda update-function-configuration \
  --function-name SoylStack-ImageWorker-XXXXX \
  --environment Variables='{IMAGE_PROVIDER=gemini}'

# For OpenAI
aws lambda update-function-configuration \
  --function-name SoylStack-ImageWorker-XXXXX \
  --environment Variables='{IMAGE_PROVIDER=openai}'

# For Stability AI
aws lambda update-function-configuration \
  --function-name SoylStack-ImageWorker-XXXXX \
  --environment Variables='{IMAGE_PROVIDER=stability}'

# For Replicate
aws lambda update-function-configuration \
  --function-name SoylStack-ImageWorker-XXXXX \
  --environment Variables='{IMAGE_PROVIDER=replicate}'

# For Placeholder (default)
aws lambda update-function-configuration \
  --function-name SoylStack-ImageWorker-XXXXX \
  --environment Variables='{IMAGE_PROVIDER=placeholder}'
```

### Step 2: Add API Keys to AWS Secrets Manager

#### For Gemini:
```bash
aws secretsmanager create-secret \
  --name "SOYL/GEMINI_API_KEY" \
  --secret-string "YOUR_GEMINI_API_KEY" \
  --description "Gemini API key for image generation"
```

#### For OpenAI:
```bash
aws secretsmanager create-secret \
  --name "SOYL/OPENAI_API_KEY" \
  --secret-string "YOUR_OPENAI_API_KEY" \
  --description "OpenAI API key for DALL-E 3"
```

#### For Stability AI:
```bash
aws secretsmanager create-secret \
  --name "SOYL/STABILITY_API_KEY" \
  --secret-string "YOUR_STABILITY_API_KEY" \
  --description "Stability AI API key for SDXL"
```

#### For Replicate:
```bash
aws secretsmanager create-secret \
  --name "SOYL/REPLICATE_API_KEY" \
  --secret-string "YOUR_REPLICATE_API_KEY" \
  --description "Replicate API key for image generation"
```

### Step 3: Get API Keys

#### Gemini API Key:
1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Enable the Imagen API in Google Cloud Console

#### OpenAI API Key:
1. Go to [OpenAI Platform](https://platform.openai.com/api-keys)
2. Create a new API key
3. Ensure you have credits in your account

#### Stability AI API Key:
1. Go to [Stability AI Platform](https://platform.stability.ai/account/keys)
2. Create a new API key
3. Add credits to your account

#### Replicate API Key:
1. Go to [Replicate](https://replicate.com/account/api-tokens)
2. Create a new API token
3. Add credits to your account

## 🚀 Quick Setup Commands

### Option 1: Use Gemini (Recommended)
```bash
# Set provider
aws lambda update-function-configuration \
  --function-name SoylStack-ImageWorker-XXXXX \
  --environment Variables='{IMAGE_PROVIDER=gemini}'

# Add API key (replace with your actual key)
aws secretsmanager create-secret \
  --name "SOYL/GEMINI_API_KEY" \
  --secret-string "YOUR_GEMINI_API_KEY"
```

### Option 2: Use OpenAI DALL-E 3
```bash
# Set provider
aws lambda update-function-configuration \
  --function-name SoylStack-ImageWorker-XXXXX \
  --environment Variables='{IMAGE_PROVIDER=openai}'

# Add API key (replace with your actual key)
aws secretsmanager create-secret \
  --name "SOYL/OPENAI_API_KEY" \
  --secret-string "YOUR_OPENAI_API_KEY"
```

### Option 3: Use Stability AI
```bash
# Set provider
aws lambda update-function-configuration \
  --function-name SoylStack-ImageWorker-XXXXX \
  --environment Variables='{IMAGE_PROVIDER=stability}'

# Add API key (replace with your actual key)
aws secretsmanager create-secret \
  --name "SOYL/STABILITY_API_KEY" \
  --secret-string "YOUR_STABILITY_API_KEY"
```

## 🧪 Testing Image Generation

### Test with a Design Request:
```bash
curl -X POST "https://YOUR_API_GATEWAY_URL/prod/designs" \
  -H "Content-Type: application/json" \
  -d '{
    "brief": "A luxurious black evening gown with gold accents for a gala event",
    "options": {
      "product": "dress",
      "style": "modern royal",
      "canvas": {"w": 600, "h": 800}
    }
  }'
```

### Check SQS Queue:
```bash
aws sqs get-queue-attributes \
  --queue-url https://sqs.ap-south-1.amazonaws.com/YOUR_ACCOUNT/soyl-image-queue \
  --attribute-names ApproximateNumberOfMessages
```

### Monitor Lambda Logs:
```bash
aws logs tail /aws/lambda/SoylStack-ImageWorker-XXXXX --follow
```

## 🔍 Troubleshooting

### Common Issues:

1. **No images generated**: Check if the SQS queue has messages
2. **API key errors**: Verify the secret exists in AWS Secrets Manager
3. **Provider errors**: Check the Lambda logs for specific error messages
4. **Timeout errors**: Increase Lambda timeout for slow providers

### Debug Commands:

```bash
# Check Lambda environment variables
aws lambda get-function-configuration \
  --function-name SoylStack-ImageWorker-XXXXX

# Check if secrets exist
aws secretsmanager list-secrets \
  --filters Key=name,Values=SOYL/

# Test secret retrieval
aws secretsmanager get-secret-value \
  --secret-id SOYL/GEMINI_API_KEY
```

## 💰 Cost Considerations

| Provider | Cost per Image | Quality | Speed |
|----------|----------------|---------|-------|
| Gemini | ~$0.02 | High | Fast |
| OpenAI DALL-E 3 | $0.040 | Excellent | Medium |
| Stability AI | $0.004 | High | Fast |
| Replicate | Varies | Varies | Varies |
| Placeholder | Free | Basic | Instant |

## 🎯 Recommendations

1. **Start with Gemini**: Best balance of quality, speed, and cost
2. **Use OpenAI for premium**: When you need the highest quality
3. **Use Stability for budget**: When cost is a primary concern
4. **Keep placeholder as fallback**: Ensures system always works

## 📝 Next Steps

1. Choose your preferred provider
2. Get the API key
3. Add it to AWS Secrets Manager
4. Update the Lambda environment variable
5. Test with a design request
6. Monitor the logs for any issues

The system will automatically fall back to placeholders if the chosen provider fails, ensuring your application always works!
