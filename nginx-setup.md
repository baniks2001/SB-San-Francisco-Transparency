# Nginx Setup for Sangguniang Bayan Transparency Portal

This guide will help you set up Nginx to run both the frontend and backend on the same port, which is ideal for port forwarding and production deployment.

## 🎯 Benefits of Using Nginx

1. **Single Port Access**: Both frontend and backend accessible via one port
2. **Better Port Forwarding**: No need to forward multiple ports
3. **Production Ready**: Includes security headers, gzip compression, and caching
4. **SSL Ready**: Easy HTTPS configuration
5. **Load Balancing**: Can handle multiple backend instances

## 📋 Prerequisites

1. **Nginx installed** on your system
2. **Built React app**: Run `npm run build` first
3. **Backend running** on port 5000
4. **Admin privileges** (for port 80 on some systems)

## 🚀 Quick Setup

### 1. Build Your Application
```bash
cd C:\Users\Servando S. Tio III\Desktop\sangguniang-bayan-app
npm run build
```

### 2. Start Your Backend
```bash
cd C:\Users\Servando S. Tio III\Desktop\sangguniang-bayan-app\server
npm run dev
```

### 3. Start Nginx
```bash
# Navigate to your Nginx installation directory
cd C:\path\to\nginx

# Start Nginx with your configuration
nginx.exe -c "C:\Users\Servando S. Tio III\Desktop\sangguniang-bayan-app\nginx.conf"
```

### 4. Access Your Application
Open your browser and navigate to: `http://localhost`

## 📁 File Structure

```
sangguniang-bayan-app/
├── build/                  # Built React app
├── server/                 # Backend server
├── nginx.conf             # Nginx configuration
├── nginx-setup.md         # This documentation
└── src/
    ├── utils/
    │   ├── urlUtils.ts    # Dynamic URL handling
    │   └── imageUtils.ts  # Image URL utilities
    └── services/
        └── api.ts         # API service with /api prefix support
```

## 🔧 Configuration Details

### Nginx Configuration (`nginx.conf`)

#### Frontend Routes (`/`)
- Serves the built React app from `/build` directory
- Handles React Router with `try_files $uri $uri/ /index.html`
- Caches static assets for 1 year

#### Backend API (`/api`)
- Proxies requests to `http://localhost:5000`
- Handles CORS headers
- Supports preflight OPTIONS requests

#### File Uploads (`/uploads`)
- Proxies to backend upload directory
- Caches uploaded files
- Serves images, PDFs, and other media

### Application Configuration

The application automatically detects if it's running behind Nginx:

#### Development Mode (Separate Ports)
- Frontend: `http://localhost:3000`
- Backend: `http://localhost:5000`
- Images: `http://localhost:5000/uploads/`

#### Nginx Mode (Same Port)
- Frontend: `http://localhost`
- Backend: `http://localhost/api`
- Images: `http://localhost/uploads/`

## 🌐 Port Forwarding Setup

### For Local Network Access
1. **Port forward port 80** on your router to your machine
2. **Access from other devices**: `http://your-local-ip`

### For Public Access
1. **Port forward port 80** on your router
2. **Access from internet**: `http://your-public-ip`

## 🔒 Security Features

The Nginx configuration includes:

- **XSS Protection**: `X-XSS-Protection` header
- **Clickjacking Protection**: `X-Frame-Options` header
- **Content Type Protection**: `X-Content-Type-Options` header
- **CORS Headers**: Proper cross-origin handling
- **Gzip Compression**: Reduces bandwidth usage
- **Static File Caching**: Improves performance

## 🔍 Troubleshooting

### Common Issues

#### 1. "404 Not Found" for API routes
**Solution**: Ensure backend is running on port 5000

#### 2. "502 Bad Gateway"
**Solution**: Check if backend server is accessible at `http://localhost:5000`

#### 3. Images not loading
**Solution**: Verify the build path in nginx.conf matches your actual build directory

#### 4. Port 80 access denied
**Solution**: Run Nginx as administrator or use port 8080 instead

### Debug Commands

#### Check Nginx Configuration
```bash
nginx.exe -t -c "path\to\nginx.conf"
```

#### Reload Nginx
```bash
nginx.exe -s reload
```

#### Stop Nginx
```bash
nginx.exe -s quit
```

#### View Nginx Logs
```bash
# Access logs
tail -f logs/access.log

# Error logs
tail -f logs/error.log
```

## 🚀 Production Deployment

### For Production Use:

1. **Use HTTPS**: Uncomment the HTTPS server block in nginx.conf
2. **Domain Name**: Update `server_name` to your actual domain
3. **SSL Certificate**: Obtain and configure SSL certificates
4. **Environment Variables**: Set `NODE_ENV=production`

### Example Production Commands:
```bash
# Build for production
npm run build

# Set environment variable
set NODE_ENV=production

# Start backend in production mode
npm start

# Start Nginx with production config
nginx.exe -c "path\to\nginx.conf"
```

## 📱 Mobile Compatibility

With Nginx setup, your application works perfectly on:

- **Desktop browsers**
- **Mobile phones**
- **Tablets**
- **Any device with network access**

All mobile features work seamlessly including:
- Responsive design
- Touch-friendly interfaces
- Image loading
- API communication

## 🔄 Switching Between Modes

### From Nginx to Development
1. Stop Nginx
2. Run `npm start` for frontend
3. Backend continues on port 5000

### From Development to Nginx
1. Stop development server
2. Run `npm run build`
3. Start Nginx
4. Backend continues on port 5000

The application automatically detects the environment and adjusts URLs accordingly!

## 🎉 Result

With this Nginx setup, you now have:

✅ **Single port access** for the entire application
✅ **Perfect port forwarding** compatibility
✅ **Production-ready** configuration
✅ **Mobile-friendly** URLs and image handling
✅ **Secure** deployment with proper headers
✅ **Fast** performance with caching and compression

Your Sangguniang Bayan Transparency Portal is now ready for deployment! 🚀
