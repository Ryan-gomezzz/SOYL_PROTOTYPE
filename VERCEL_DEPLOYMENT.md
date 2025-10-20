# Deploy SOYL Frontend to Vercel

## 🚀 Quick Deployment Guide

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Go to [vercel.com](https://vercel.com)** and sign in with GitHub

2. **Import Repository**:
   - Click "New Project"
   - Select "Import Git Repository"
   - Choose `Ryan-gomezzz/SOYL_PROTOTYPE`
   - Click "Import"

3. **Configure Project**:
   ```
   Framework Preset: Vite
   Root Directory: packages/app
   Build Command: pnpm run build
   Output Directory: dist
   Install Command: pnpm install
   ```

4. **Set Environment Variables**:
   ```
   VITE_API_BASE=https://8zaa4i3xma.execute-api.ap-south-1.amazonaws.com/prod/
   VITE_COGNITO_USER_POOL_ID=your-cognito-pool-id
   VITE_COGNITO_CLIENT_ID=your-cognito-client-id
   ```

5. **Deploy**: Click "Deploy" and wait for completion

### Option 2: Deploy via Vercel CLI

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**:
   ```bash
   vercel login
   ```

3. **Navigate to App Directory**:
   ```bash
   cd packages/app
   ```

4. **Deploy**:
   ```bash
   vercel --prod
   ```

5. **Set Environment Variables**:
   ```bash
   vercel env add VITE_API_BASE
   # Enter: https://8zaa4i3xma.execute-api.ap-south-1.amazonaws.com/prod/
   
   vercel env add VITE_COGNITO_USER_POOL_ID
   # Enter your Cognito User Pool ID
   
   vercel env add VITE_COGNITO_CLIENT_ID
   # Enter your Cognito Client ID
   ```

6. **Redeploy with Environment Variables**:
   ```bash
   vercel --prod
   ```

### Option 3: GitHub Actions (Automatic)

The repository already includes a GitHub Actions workflow for automatic Vercel deployment:

1. **Set GitHub Secrets**:
   - Go to your GitHub repository settings
   - Navigate to "Secrets and variables" → "Actions"
   - Add these secrets:
     ```
     VERCEL_TOKEN=your-vercel-token
     VITE_API_BASE=https://8zaa4i3xma.execute-api.ap-south-1.amazonaws.com/prod/
     VITE_COGNITO_USER_POOL_ID=your-cognito-pool-id
     VITE_COGNITO_CLIENT_ID=your-cognito-client-id
     ```

2. **Push to Main Branch**:
   ```bash
   git push origin main
   ```

3. **Automatic Deployment**: The workflow will automatically deploy to Vercel

## 🔧 Configuration Files

### vercel.json (Root)
```json
{
  "version": 2,
  "builds": [
    {
      "src": "packages/app/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "packages/app/$1"
    }
  ],
  "env": {
    "VITE_API_BASE": "https://8zaa4i3xma.execute-api.ap-south-1.amazonaws.com/prod/"
  }
}
```

### packages/app/vercel.json
```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/$1"
    }
  ]
}
```

## 🌐 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_BASE` | Backend API URL | `https://8zaa4i3xma.execute-api.ap-south-1.amazonaws.com/prod/` |
| `VITE_COGNITO_USER_POOL_ID` | AWS Cognito User Pool ID | `us-east-1_xxxxxxxxx` |
| `VITE_COGNITO_CLIENT_ID` | AWS Cognito Client ID | `xxxxxxxxxxxxxxxxxxxxxxxxxx` |

## 📱 Post-Deployment

1. **Test Your App**:
   - Visit your Vercel URL
   - Test design generation
   - Verify API connectivity

2. **Custom Domain** (Optional):
   - Go to Vercel dashboard
   - Navigate to your project
   - Go to "Settings" → "Domains"
   - Add your custom domain

3. **Monitor Performance**:
   - Use Vercel Analytics
   - Monitor Core Web Vitals
   - Check deployment logs

## 🚨 Troubleshooting

### Build Errors
- Ensure all dependencies are in `package.json`
- Check TypeScript compilation errors
- Verify Vite configuration

### Environment Variables
- Double-check variable names (must start with `VITE_`)
- Ensure values are correct
- Redeploy after adding new variables

### API Connection Issues
- Verify `VITE_API_BASE` is correct
- Check CORS settings on API Gateway
- Test API endpoints directly

## 📊 Performance Optimization

1. **Enable Vercel Analytics**:
   - Go to project settings
   - Enable "Vercel Analytics"

2. **Optimize Images**:
   - Use Vercel's Image Optimization
   - Compress images before upload

3. **Enable Edge Functions** (if needed):
   - For server-side logic
   - API route handlers

## 🔄 Continuous Deployment

Once set up, every push to the main branch will automatically trigger a new deployment. You can also:

- Deploy preview branches for testing
- Use Vercel's preview deployments
- Set up custom deployment hooks

## 📞 Support

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [GitHub Issues](https://github.com/Ryan-gomezzz/SOYL_PROTOTYPE/issues)
