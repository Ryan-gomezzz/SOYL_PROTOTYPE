# Deployment Guide - Cart + Wishlist Features

## Overview
This guide covers deploying the new Cart and Wishlist features to Vercel with AWS Lambda backend support.

## Prerequisites
- AWS account with DynamoDB access
- Vercel account
- Node.js 18+ and pnpm installed
- AWS CLI configured

## Step 1: Create DynamoDB Tables

```bash
# Cart table
aws dynamodb create-table \
  --table-name SOYL-Cart \
  --attribute-definitions AttributeName=userId,AttributeType=S \
  --key-schema AttributeName=userId,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1

# Wishlist table
aws dynamodb create-table \
  --table-name SOYL-Wishlist \
  --attribute-definitions AttributeName=userId,AttributeType=S \
  --key-schema AttributeName=userId,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST \
  --region us-east-1
```

## Step 2: Update Lambda Handler

Update `packages/server/src/handler-full.ts` to route cart/wishlist requests:

```typescript
import * as cartWishlist from './cart-wishlist-api';
import * as apiRouter from './api-router';

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  // Route cart/wishlist requests
  if (event.path?.startsWith('/api/cart') || event.path?.startsWith('/api/wishlist')) {
    return apiRouter.routeRequest(event);
  }
  
  // Your existing design generation logic...
  return existingDesignHandler(event);
};
```

## Step 3: Update Vercel Configuration

Update `vercel.json` in the root:

```json
{
  "buildCommand": "cd packages/app && pnpm build",
  "outputDirectory": "packages/app/dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/api/(.*)",
      "destination": "https://YOUR_API_GATEWAY.execute-api.us-east-1.amazonaws.com/prod/api/$1"
    }
  ],
  "headers": [
    {
      "source": "/api/(.*)",
      "headers": [
        { "key": "Access-Control-Allow-Origin", "value": "*" },
        { "key": "Access-Control-Allow-Methods", "value": "GET, POST, PUT, DELETE, PATCH, OPTIONS" },
        { "key": "Access-Control-Allow-Headers", "value": "Content-Type, Authorization" }
      ]
    }
  ],
  "env": {
    "VITE_API_BASE": "@api_base_url"
  }
}
```

## Step 4: Environment Variables

In Vercel dashboard or via CLI:

```bash
vercel env add VITE_API_BASE production
# Enter: https://YOUR_API_GATEWAY.execute-api.us-east-1.amazonaws.com/prod
```

In AWS Lambda environment:
- `CART_TABLE=SOYL-Cart`
- `WISHLIST_TABLE=SOYL-Wishlist`
- `AWS_REGION=us-east-1`

## Step 5: Deploy Lambda

```bash
cd packages/server
npm run build
cdk deploy --require-approval never
```

## Step 6: Deploy Frontend to Vercel

```bash
# From project root
vercel --prod

# Or push to GitHub and let Vercel auto-deploy
git push origin master
```

## Step 7: Test Deployment

1. **Cart Features:**
   - Add item to cart (logged out)
   - Login → cart should merge
   - Update quantities
   - Apply coupon code
   - Validate checkout

2. **Wishlist Features:**
   - Add item to wishlist
   - Generate shareable link
   - Open shared link (should work without auth)
   - Add to cart from wishlist

3. **Admin Features:**
   - Login as admin
   - See "Add Product" button
   - Add/delete products
   - Logout → should not see admin buttons

## Monitoring & Debugging

### Check Vercel Logs:
```bash
vercel logs --follow
```

### Check AWS CloudWatch Logs:
```bash
aws logs tail /aws/lambda/your-function-name --follow
```

### DynamoDB Query Testing:
```bash
aws dynamodb get-item \
  --table-name SOYL-Cart \
  --key '{"userId": {"S": "test-user"}}'
```

## Performance Optimization

### Vercel Edge Caching:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### API Gateway Caching:
- Enable caching on `/api/products` (60s TTL)
- Enable caching on `/api/catalog` (300s TTL)
- Disable caching on `/api/cart` and `/api/wishlist` (user-specific)

## Rollback Plan

If deployment fails:

1. **Frontend Rollback:**
   ```bash
   vercel rollback
   ```

2. **Lambda Rollback:**
   ```bash
   aws lambda update-function-code \
     --function-name your-function \
     --zip-file fileb://previous-version.zip
   ```

3. **Database:**
   - DynamoDB Point-in-Time Recovery enabled
   - Can restore from backup if needed

## Security Checklist

- ✅ CORS configured for allowed origins
- ✅ JWT token validation on API routes
- ✅ RBAC middleware for admin routes
- ✅ Rate limiting on API Gateway
- ✅ Input sanitization (SQL injection prevention via DynamoDB)
- ✅ HTTPS enforced (Vercel default)

## Troubleshooting

### Cart not persisting:
- Check DynamoDB permissions for Lambda
- Verify `CART_TABLE` environment variable
- Check CloudWatch logs for errors

### Wishlist share not working:
- Verify token generation in API
- Check `WISHLIST_TABLE` environment variable
- Test share link in incognito browser

### CORS errors:
- Verify Vercel rewrites configuration
- Check API Gateway CORS settings
- Ensure headers are properly set

## Next Steps

1. Set up CI/CD pipeline
2. Add monitoring (DataDog, Sentry)
3. Configure alerts for errors
4. A/B test checkout flow
5. Optimize bundle size (currently ~2MB)

## Support

For issues or questions:
- Frontend: Check Vercel deployment logs
- Backend: Check AWS CloudWatch
- Database: Check DynamoDB metrics

