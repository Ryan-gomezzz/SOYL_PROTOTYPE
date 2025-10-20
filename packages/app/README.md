# SOYL - Story Of Your Life

A luxury AI fashion design platform that transforms your story into bespoke fashion pieces.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- pnpm 8+

### Installation & Development

```cmd
# Install dependencies
pnpm install

# Start development server
pnpm run dev

# Build for production
pnpm run build

# Preview production build
pnpm run preview

# Run tests
pnpm run test

# Lint code
pnpm run lint

# Format code
pnpm run format
```

### Environment Variables

Create a `.env.local` file:

```env
VITE_API_BASE=https://8zaa4i3xma.execute-api.ap-south-1.amazonaws.com/prod/
VITE_COGNITO_USER_POOL_ID=your-cognito-pool-id
VITE_COGNITO_CLIENT_ID=your-cognito-client-id
```

## 🌐 Deployment to Vercel

### Option 1: Vercel Dashboard
1. Go to [vercel.com](https://vercel.com)
2. Import `Ryan-gomezzz/SOYL_PROTOTYPE`
3. Set Root Directory: `packages/app`
4. Add environment variables
5. Deploy

### Option 2: Vercel CLI
```cmd
# Install Vercel CLI
npm install -g vercel

# Login and deploy
vercel login
vercel --prod

# Set environment variables
vercel env add VITE_API_BASE
vercel env add VITE_COGNITO_USER_POOL_ID
vercel env add VITE_COGNITO_CLIENT_ID
```

## 🎨 Design System

- **Colors**: Black, White, Gold (#D4AF37), Silver (#C0C0C0), Bronze (#CD7F32)
- **Typography**: Inter (UI), Playfair Display (Headings)
- **Framework**: React 18 + TypeScript + Vite + TailwindCSS
- **Animations**: Framer Motion
- **Canvas**: Fabric.js

## 📁 Project Structure

```
src/
├── components/     # Reusable UI components
├── pages/         # Route components
├── hooks/         # Custom React hooks
├── lib/           # Utilities and API
├── styles/        # Global styles
└── types/         # TypeScript definitions
```

## 🔧 Development

The app uses:
- **React Router** for navigation
- **Zustand** for state management
- **Framer Motion** for animations
- **Fabric.js** for canvas interactions
- **AWS Cognito** for authentication
- **TailwindCSS** for styling

## 📱 Features

- Luxury design system
- AI-powered fashion generation
- Interactive design canvas
- User authentication
- Design history dashboard
- Responsive design
- Accessibility compliant