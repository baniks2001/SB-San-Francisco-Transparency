# 🌩️ Cloudflare Pages Deployment Guide
## Deploy Sangguniang Bayan Transparency Portal to Cloudflare

This guide will help you deploy your frontend to Cloudflare Pages while keeping your backend separate.

## 🎯 Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Cloudflare    │    │   Your Backend  │    │   Database      │
│     Pages       │    │   (Node.js)     │    │  (MongoDB)      │
│                 │    │                 │    │                 │
│  • Frontend     │◄──►│  • API Routes   │◄──►│  • Data Store   │
│  • Static Files │    │  • File Uploads │    │                 │
│  • Global CDN   │    │  • Processing   │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🚀 Quick Deployment Steps

### Step 1: Prepare for Cloudflare Deployment

#### Option A: Use Frontend-Only Package (Recommended)
```bash
# Copy frontend-only package.json
cp package-frontend.json package.json

# Install only frontend dependencies
npm install

# Build for production
npm run build
```

#### Option B: Clean Current Package
```bash
# Remove backend dependencies from package.json
# (Keep only React and frontend dependencies)
npm install
npm run build
```

### Step 2: Deploy to Cloudflare Pages

#### Method 1: Git Integration (Recommended)
1. **Push to GitHub/GitLab**
   ```bash
   git add .
   git commit -m "Ready for Cloudflare deployment"
   git push origin main
   ```

2. **Create Cloudflare Pages Account**
   - Go to: https://pages.cloudflare.com/
   - Sign up/login with Cloudflare
   - Connect your Git account

3. **Create New Project**
   - Choose your repository
   - Set build command: `npm run build`
   - Set build output directory: `build`
   - Click "Begin deployment"

#### Method 2: Direct Upload
1. **Build your project**
   ```bash
   npm run build
   ```

2. **Upload to Cloudflare Pages**
   - Go to Cloudflare Pages dashboard
   - Click "Upload assets"
   - Drag and drop your `build` folder
   - Deploy

### Step 3: Configure Backend API

#### Update Your API Configuration
In your deployed frontend, you need to point to your backend server:

1. **Update environment variables** in Cloudflare Pages:
   - Go to your project settings
   - Add environment variable: `REACT_APP_API_URL=https://your-backend-domain.com`

2. **Or update the redirects** in `_redirects`:
   ```text
   # Replace with your actual backend URL
   /api/*  https://your-backend-server.com/api/:splat  200
   /uploads/*  https://your-backend-server.com/uploads/:splat  200
   ```

## 🔧 Backend Deployment Options

### Option 1: Vercel/Heroku (Easy)
1. **Deploy backend to Vercel**
   ```bash
   cd server
   npm install
   # Deploy to Vercel
   ```

2. **Update frontend redirects**
   ```text
   /api/*  https://your-app.vercel.app/api/:splat  200
   ```

### Option 2: DigitalOcean/Railway (Professional)
1. **Deploy to DigitalOcean App Platform**
2. **Set up custom domain**
3. **Configure SSL**

### Option 3: Self-Hosted (Full Control)
1. **Use our proxy server** on a VPS
2. **Configure domain and SSL**
3. **Set up monitoring**

## 📋 Configuration Files

### `_headers` (Security & Caching)
```text
# Security headers
/*
  X-Frame-Options: DENY
  X-Content-Type-Options: nosniff
  X-XSS-Protection: "1; mode=block"

# Cache static assets for 1 year
/static/*
  Cache-Control: public, max-age=31536000, immutable

# Cache API responses for 1 hour
/api/*
  Cache-Control: public, max-age=3600
```

### `_redirects` (Routing)
```text
# React Router - all routes to index.html
/*    /index.html   200

# API routes to your backend
/api/*  https://your-backend-domain.com/api/:splat  200

# File uploads to backend
/uploads/*  https://your-backend-domain.com/uploads/:splat  200
```

### `package.json` (Frontend Only)
```json
{
  "name": "sangguniang-bayan-frontend",
  "dependencies": {
    "react": "^19.2.4",
    "axios": "^1.13.6",
    "react-router-dom": "^7.13.1",
    // ... other frontend dependencies only
  },
  "scripts": {
    "build": "react-scripts build"
  }
}
```

## 🌐 Domain Setup

### Custom Domain Configuration
1. **Add custom domain** in Cloudflare Pages
2. **Update DNS records** (Cloudflare handles this)
3. **Update API URLs** to use your custom domain

### SSL Certificate
- Cloudflare provides free SSL
- Automatic HTTPS redirection
- HSTS enabled by default

## 🔍 Troubleshooting

### Common Cloudflare Issues

#### "npm ci failed" Error
**Problem**: Backend dependencies included in package.json
**Solution**: Use frontend-only package.json
```bash
cp package-frontend.json package.json
npm install
npm run build
```

#### API Calls Not Working
**Problem**: Frontend can't reach backend
**Solution**: Configure proper redirects
```text
/api/*  https://your-backend.com/api/:splat  200
```

#### Images Not Loading
**Problem**: Upload URLs pointing to wrong server
**Solution**: Update image utilities
```javascript
// In production, use your backend domain
const API_BASE_URL = process.env.REACT_APP_API_URL || 'https://your-backend.com';
```

#### 404 Errors on Routes
**Problem**: React Router not working
**Solution**: Ensure `_redirects` is configured
```text
/*    /index.html   200
```

### Debug Steps
1. **Check build logs** in Cloudflare dashboard
2. **Verify redirects** in deployed site
3. **Test API endpoints** directly
4. **Check browser console** for errors

## 🚀 Production Checklist

### Before Deployment
✅ Remove backend dependencies from package.json  
✅ Test build locally: `npm run build`  
✅ Verify API URLs are correct  
✅ Set up redirects and headers  
✅ Test all functionality locally  

### After Deployment
✅ Test all pages load correctly  
✅ Verify API calls work  
✅ Check images and files load  
✅ Test on mobile devices  
✅ Test from different networks  
✅ Monitor performance  

### Security
✅ HTTPS enabled (automatic)  
✅ Security headers configured  
✅ API endpoints secured  
✅ File upload validation  
✅ Rate limiting on backend  

## 📊 Performance Optimization

### Cloudflare Features
- **Global CDN**: Automatic caching worldwide
- **Image Optimization**: Automatic image resizing
- **Minification**: JS/CSS auto-minified
- **HTTP/3**: Latest protocol support

### Additional Optimizations
```javascript
// In your React app
// Lazy load components
const LazyComponent = React.lazy(() => import('./Component'));

// Optimize images
<img src={optimizedImage} loading="lazy" alt="Description" />
```

## 🔄 CI/CD Pipeline

### Automatic Deployments
```yaml
# .github/workflows/deploy.yml
name: Deploy to Cloudflare Pages
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      - name: Install dependencies
        run: npm ci
      - name: Build
        run: npm run build
      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
```

## 🎉 Success Metrics

When deployment is successful, you should see:

✅ **Fast loading**: Global CDN serving  
✅ **HTTPS working**: Secure connection  
✅ **API functional**: Data loads correctly  
✅ **Mobile responsive**: Works on all devices  
✅ **SEO friendly**: Proper meta tags  
✅ **High performance**: Good PageSpeed scores  

## 🆘 Support

### Cloudflare Resources
- **Documentation**: https://developers.cloudflare.com/pages/
- **Community**: https://community.cloudflare.com/
- **Status**: https://www.cloudflarestatus.com/

### Common Issues
- **Build failures**: Check package.json dependencies
- **API errors**: Verify backend deployment
- **Routing issues**: Check _redirects file

Your Sangguniang Bayan Transparency Portal is now ready for global deployment! 🌍✨
