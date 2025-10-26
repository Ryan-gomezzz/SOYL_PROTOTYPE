# Admin & Database Setup Guide

## Admin Login System

### Default Admin Credentials
- **Email**: `admin@soyl.com`
- **Password**: `admin123`

**⚠️ IMPORTANT**: Change this password in production!

### Role-Based Access Control

The system now has three user roles:
1. **Guest** - Not logged in, can view public pages
2. **User** - Logged in users, can view and use features
3. **Admin** - Full access to add/remove products and manage content

### How to Use

1. **Admin Login**:
   - Go to `/login`
   - Enter email: `admin@soyl.com`
   - Enter password: `admin123`
   - Click "Sign In"
   - You'll be redirected to `/admin` panel

2. **User Login**:
   - Register new users at `/login` (signup form)
   - Users are created with 'user' role by default
   - They can access `/dashboard` but not `/admin`

3. **Admin Panel Features**:
   - View all products in a table
   - Add new products
   - Delete products
   - View statistics
   - Full product management

## Database Storage

### Current Implementation
- **Frontend**: Uses localStorage for demo/development
- **Backend Ready**: AWS DynamoDB tables are configured in CDK

### Storage Structure

#### Products (Catalog)
```typescript
{
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: 'luxury' | 'casual' | 'formal' | 'accessories';
  createdAt: string;
}
```

#### Users
```typescript
{
  id: string;
  email: string;
  role: 'admin' | 'user' | 'guest';
  name?: string;
  createdAt: string;
}
```

### Production Database Setup

#### 1. DynamoDB Tables
The backend already includes DynamoDB configuration:

**Designs Table** (`SOYL-Designs`):
- PartitionKey: `designId` (String)
- Already deployed with CDK

**Add Products Table** (To be created):
```typescript
{
  TableName: 'SOYL-Products',
  PartitionKey: 'productId',
  Attributes: [
    { name: 'productId', type: 'STRING' },
    { name: 'category', type: 'STRING' },
    { name: 'createdAt', type: 'STRING' }
  ]
}
```

#### 2. Backend API Endpoints (To be added)

Add these endpoints to `packages/server/src/handler.ts`:

```typescript
// GET /api/products
// POST /api/products
// DELETE /api/products/:id

// GET /api/users
// POST /api/users
// PUT /api/users/:id
```

#### 3. AWS Cognito Setup

For production authentication:

1. **Create User Pool**:
```bash
aws cognito-idp create-user-pool \
  --pool-name soyl-users \
  --policies "PasswordPolicy={MinimumLength=8,RequireUppercase=true,RequireLowercase=true,RequireNumbers=true,RequireSymbols=true}"
```

2. **Create User Pool Client**:
```bash
aws cognito-idp create-user-pool-client \
  --user-pool-id <POOL_ID> \
  --client-name soyl-web-client \
  --no-generate-secret \
  --explicit-auth-flows ALLOW_USER_SRP_AUTH
```

3. **Set Environment Variables**:
```bash
VITE_COGNITO_USER_POOL_ID=<your-pool-id>
VITE_COGNITO_CLIENT_ID=<your-client-id>
```

## 3D Model Upload

### Adding Placeholders to 3D Studio

The 3D studio expects GLB files in `/public/models/`:

1. **Download or Create Models**:
   - Visit [Sketchfab](https://sketchfab.com) for free models
   - Search for "t-shirt", "jacket", "hoodie", etc.
   - Download GLB format

2. **Place Files**:
   - Put files in `packages/app/public/models/`
   - Example: `packages/app/public/models/t-shirt.glb`

3. **Update Component**:
   - In `DesignStudio3D.tsx`, change the model URL:
   ```typescript
   <ThreeViewer modelUrl="/models/t-shirt.glb" />
   ```

### Supported Model Formats
- **GLB** (recommended) - Binary format, single file
- **GLTF** - JSON format, requires separate files

### Model Requirements
- Size: < 5MB recommended
- File format: GLB or GLTF
- Centered at origin (0,0,0)
- Scale: 1-2 units tall for clothing
- Clean topology

## Production Deployment

### Step 1: Deploy Backend
```bash
cd packages/server
pnpm install
pnpm run build
cdk deploy
```

### Step 2: Set Environment Variables
Add to Vercel or your hosting platform:
```
VITE_COGNITO_USER_POOL_ID=your-pool-id
VITE_COGNITO_CLIENT_ID=your-client-id
VITE_API_URL=https://your-api-url.execute-api.region.amazonaws.com
```

### Step 3: Create Database Tables
```bash
aws dynamodb create-table \
  --table-name SOYL-Products \
  --attribute-definitions \
    AttributeName=productId,AttributeType=S \
  --key-schema \
    AttributeName=productId,KeyType=HASH \
  --billing-mode PAY_PER_REQUEST
```

### Step 4: Update Code
Replace localStorage calls in Catalog/Admin with API calls to your backend.

## Security Notes

⚠️ **Change Default Password**: Update `ADMIN_PASSWORD` in `packages/app/src/lib/auth.ts`

⚠️ **Use JWT Tokens**: In production, implement proper JWT token verification

⚠️ **Environment Variables**: Never commit API keys or secrets

⚠️ **Input Validation**: Always validate user inputs on both frontend and backend

⚠️ **HTTPS Only**: Enforce HTTPS in production

## Testing

### Test Admin Access
1. Login with admin credentials
2. Navigate to `/admin`
3. Try adding a product
4. Verify only admins can access

### Test User Access
1. Register a new user account
2. Try accessing `/admin` - should redirect
3. Verify user can access `/dashboard`

### Test Product Management
1. As admin, add products in admin panel
2. View products in catalog
3. Verify products appear for all users

