# 🚀 Vercel Deployment Guide
## Complete Setup for Sangguniang Bayan Transparency Portal

This guide will help you deploy your entire application (frontend + backend) on Vercel.app with automatic scaling and global CDN.

## 🎯 What This Setup Provides

✅ **Full Stack Deployment** - Frontend + Backend on Vercel  
✅ **Serverless Functions** - Automatic scaling and cold starts  
✅ **Global CDN** - Fast loading worldwide  
✅ **Custom Domain** - Professional branding  
✅ **Automatic HTTPS** - Free SSL certificate  
✅ **Zero Downtime** - Seamless deployments  
✅ **Environment Variables** - Secure configuration  

## 📋 Prerequisites

1. **Vercel Account** - Free at https://vercel.com
2. **GitHub Account** - For automatic deployments
3. **MongoDB Atlas** - Free tier available
4. **Domain Name** (Optional) - For custom branding

## 🚀 Quick Deployment (5 Steps)

### Step 1: Install Dependencies
```bash
npm install @vercel/node
```

### Step 2: Build Your Application
```bash
npm run build
```

### Step 3: Connect to Vercel
```bash
npx vercel login
npx vercel link
```

### Step 4: Deploy to Vercel
```bash
npx vercel --prod
```

### Step 5: Configure Environment Variables
In Vercel Dashboard → Settings → Environment Variables:
- `MONGODB_URI` - Your MongoDB connection string
- `JWT_SECRET` - Your JWT secret key

## 📁 Project Structure for Vercel

```
sangguniang-bayan-app/
├── api/                    # Vercel serverless functions
│   └── index.ts           # Main API handler
├── build/                 # Built React app
├── public/                # Static assets
├── src/                   # React source code
├── server/                # Backend source (for local development)
├── vercel.json           # Vercel configuration
├── package.json          # Dependencies and scripts
└── .env                  # Local environment variables
```

## ⚙️ Vercel Configuration (`vercel.json`)

### Frontend Build
- **Static Build**: React app built to `/build`
- **Serving**: All non-API routes serve `index.html`
- **Caching**: Static assets cached for 1 year

### Backend API
- **Serverless**: `/api/index.ts` handles all API requests
- **Routes**: All `/api/*` routes proxied to serverless function
- **Timeout**: 30 seconds maximum function duration

### File Uploads
- **Storage**: Files served through API routes
- **Caching**: Upload files cached for performance
- **Security**: CORS headers properly configured

## 🔧 Environment Variables

### Required Variables
```bash
# In Vercel Dashboard → Settings → Environment Variables
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database
JWT_SECRET=your-super-secret-jwt-key-here
NODE_ENV=production
```

### Optional Variables
```bash
FRONTEND_PORT=3000
API_TIMEOUT=30000
```

## 🌐 URL Structure on Vercel

### Development (Local)
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000/api/*`
- Images: `http://localhost:5000/uploads/*`

### Production (Vercel)
- Frontend: `https://your-app.vercel.app`
- Backend API: `https://your-app.vercel.app/api/*`
- Images: `https://your-app.vercel.app/uploads/*`

### Custom Domain
- Frontend: `https://yourdomain.com`
- Backend API: `https://yourdomain.com/api/*`
- Images: `https://yourdomain.com/uploads/*`

## 🔄 Automatic URL Detection

The application automatically detects where it's running:

```javascript
// In src/utils/imageUtils.ts
const isVercel = () => {
  return window.location.hostname.includes('vercel.app');
};

// Uses appropriate URL utilities
export const getImageUrl = isVercel() ? getVercelImageUrl : getLocalImageUrl;
```

## 📱 Mobile Compatibility

### Responsive Design
✅ **Mobile-First**: All admin pages mobile-compatible  
✅ **Touch-Friendly**: Proper button sizes and spacing  
✅ **Responsive Grids**: Adapts to all screen sizes  
✅ **Fast Loading**: Optimized for mobile networks  

### Vercel Mobile Performance
✅ **Global CDN**: Fast loading from any location  
✅ **Image Optimization**: Automatic image compression  
✅ **Code Splitting**: Only load what's needed  
✅ **HTTP/2**: Faster parallel requests  

## 🛠️ Development Workflow

### Local Development
```bash
# Start backend (traditional)
cd server && npm run dev

# Start frontend (traditional)
npm start

# Or use proxy server (recommended)
npm run online:8080
```

### Vercel Development
```bash
# Deploy to preview
npx vercel

# Deploy to production
npx vercel --prod

# Watch for changes and auto-deploy
npx vercel --prod --watch
```

## 🔍 Testing Your Deployment

### Health Check
```bash
# Test API health
curl https://your-app.vercel.app/health

# Expected response
{
  "status": "ok",
  "timestamp": "2024-03-15T12:00:00.000Z",
  "environment": "production"
}
```

### Frontend Test
1. Visit: `https://your-app.vercel.app`
2. Check: All pages load correctly
3. Test: Mobile responsiveness
4. Verify: Images and data load

### API Test
1. Test: User registration/login
2. Test: Data CRUD operations
3. Test: File uploads
4. Test: Admin functionality

## 🌍 Custom Domain Setup

### Step 1: Add Domain in Vercel
1. Go to Vercel Dashboard → Project → Settings → Domains
2. Add your custom domain (e.g., `sangguniang.gov.ph`)
3. Follow DNS instructions

### Step 2: Update DNS
```
Type: CNAME
Name: @ (or your subdomain)
Value: cname.vercel-dns.com
```

### Step 3: SSL Certificate
- ✅ **Automatic**: Vercel provides free SSL
- ✅ **Renewal**: Auto-renewed before expiration
- ✅ **Security**: Modern TLS protocols

## 📊 Performance Monitoring

### Vercel Analytics
- **Page Views**: Track visitor statistics
- **Performance**: Core Web Vitals
- **Errors**: Automatic error tracking
- **Speed**: Real user monitoring

### MongoDB Atlas Monitoring
- **Database Performance**: Query optimization
- **Storage Usage**: Monitor data growth
- **Security**: Access logs and alerts
- **Backups**: Automated backups

## 🔒 Security Features

### Vercel Security
- **HTTPS**: Automatic SSL/TLS
- **CORS**: Proper cross-origin configuration
- **Headers**: Security headers included
- **Rate Limiting**: Built-in protection

### Application Security
- **JWT Authentication**: Secure user sessions
- **Input Validation**: Prevent injection attacks
- **File Upload Security**: Type and size validation
- **Environment Variables**: Secure configuration

## 🚀 Scaling and Performance

### Vercel Scaling
- **Serverless**: Automatic scaling based on demand
- **Global CDN**: Content delivered from edge locations
- **Cold Starts**: Optimized for fast initialization
- **Concurrency**: Handle multiple simultaneous users

### Database Scaling
- **MongoDB Atlas**: Automatic scaling
- **Connection Pooling**: Efficient database connections
- **Indexing**: Optimized query performance
- **Caching**: Reduce database load

## 🔄 CI/CD Pipeline

### Automatic Deployments
```yaml
# Connected to GitHub
on: [push, pull_request]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
```

### Preview Deployments
- **Pull Requests**: Automatic preview URLs
- **Testing**: Test changes before production
- **Collaboration**: Share preview with team members
- **Feedback**: Comment and approve changes

## 🎉 Success Checklist

When deployment is complete, verify:

✅ **Frontend loads** at `https://your-app.vercel.app`  
✅ **API works** at `https://your-app.vercel.app/api/*`  
✅ **Images display** correctly  
✅ **Mobile responsive** on all devices  
✅ **Authentication** works properly  
✅ **Data operations** (CRUD) function  
✅ **File uploads** work correctly  
✅ **Admin panel** accessible  
✅ **Custom domain** (if configured)  
✅ **HTTPS security** active  

## 🆘 Troubleshooting

### Common Issues

#### API Not Working
**Problem**: API endpoints return 404 or 500 errors  
**Solution**: Check environment variables in Vercel dashboard

#### Images Not Loading
**Problem**: Broken images or 404 errors  
**Solution**: Verify URL utilities are using Vercel detection

#### Build Failures
**Problem**: Deployment fails during build  
**Solution**: Check build logs and fix TypeScript errors

#### Database Connection
**Problem**: MongoDB connection fails  
**Solution**: Verify IP whitelist in MongoDB Atlas

### Debug Tools
```bash
# Check deployment logs
npx vercel logs

# Check environment variables
npx vercel env ls

# Test locally with Vercel CLI
npx vercel dev
```

## 🎯 Going Live

### Final Steps
1. **Test thoroughly** on preview deployment
2. **Set up custom domain** for professional branding
3. **Configure monitoring** for performance tracking
4. **Set up backups** for data protection
5. **Document access** for your team

### Launch Day
1. **Deploy to production**: `npx vercel --prod`
2. **Test all functionality**
3. **Monitor performance**
4. **Share with users**
5. **Gather feedback**

Your Sangguniang Bayan Transparency Portal is now live on Vercel! 🎉

## 📞 Support

- **Vercel Documentation**: https://vercel.com/docs
- **MongoDB Atlas**: https://docs.mongodb.com/atlas
- **React Documentation**: https://react.dev
- **Community Forums**: Vercel Discord and GitHub Discussions
