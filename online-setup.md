# 🌐 Online Access Setup Guide
## Complete Setup for Sangguniang Bayan Transparency Portal

This guide will help you set up your system for online access using our Node.js proxy server. This is much easier than Nginx and works perfectly for port forwarding and online access.

## 🎯 What This Setup Provides

✅ **Single Port Access** - Frontend, Backend, and Files on one port  
✅ **Online Ready** - Perfect for port forwarding and public access  
✅ **Mobile Compatible** - Works on all devices  
✅ **Easy Setup** - No complex Nginx configuration  
✅ **Production Ready** - Includes error handling and logging  

## 🚀 Quick Start (3 Commands)

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Backend Server
```bash
cd server
npm run dev
```

### 3. Start Online Proxy
```bash
npm run online
```

That's it! Your application is now accessible online at: `http://localhost`

## 📋 Available Commands

### Development Commands
```bash
# Start proxy on port 80 (requires admin)
npm run proxy

# Start proxy on port 8080 (no admin required)
npm run proxy:8080

# Start proxy on port 3001 (for development)
npm run proxy:dev
```

### Production Commands
```bash
# Build and start on port 80
npm run online

# Build and start on port 8080
npm run online:8080
```

## 🌐 Access URLs

### Local Access
- **Port 80**: `http://localhost`
- **Port 8080**: `http://localhost:8080`
- **Port 3001**: `http://localhost:3001`

### Network Access
Find your IP address:
```bash
# Windows
ipconfig

# Or use our network monitor
npm run network:check
```

Then access from other devices:
- `http://your-local-ip` (port 80)
- `http://your-local-ip:8080` (port 8080)

### Public/Online Access
1. **Port forward** the chosen port on your router
2. **Access from anywhere**: `http://your-public-ip`
3. **For HTTPS**: Use Cloudflare or SSL certificate

## 🔧 Port Forwarding Setup

### Step 1: Find Your Local IP
```bash
npm run network:check
```
This will show you your local IP address (e.g., 192.168.1.100)

### Step 2: Configure Router
1. **Access router admin**: Usually `http://192.168.1.1` or `http://192.168.0.1`
2. **Find port forwarding** section
3. **Forward port**: Choose 80 or 8080
4. **Target device**: Your computer's local IP
5. **Save and restart** router

### Step 3: Test Online Access
1. **Get public IP**: Visit `https://whatismyip.com`
2. **Test access**: `http://your-public-ip`
3. **Mobile test**: Try from your phone's mobile data

## 📱 Mobile Testing

### On Your Network
```bash
# From another computer/device
http://192.168.x.x        # Your local IP
http://192.168.x.x:8080   # With port 8080
```

### From Internet
```bash
# From anywhere (after port forwarding)
http://your-public-ip
http://your-public-ip:8080
```

## 🛠️ Troubleshooting

### Port 80 Issues
**Problem**: "Permission denied" or "Address already in use"
**Solution**: Use port 8080 instead:
```bash
npm run proxy:8080
```

### Backend Not Connected
**Problem**: "Backend service unavailable"
**Solution**: Ensure backend is running:
```bash
cd server
npm run dev
```

### Images Not Loading
**Problem**: Broken images or 404 errors
**Solution**: Check URL utilities are working correctly. The proxy automatically handles image routing.

### Router Issues
**Problem**: Can't access from public IP
**Solution**: 
1. Check port forwarding settings
2. Ensure firewall allows the port
3. Try from mobile data (not same WiFi)

## 🔍 Advanced Configuration

### Environment Variables
```bash
# Set custom port
PORT=3000 npm run proxy

# Set backend URL (if not on localhost)
BACKEND_URL=http://192.168.1.100:5000 npm run proxy
```

### HTTPS Setup (Optional)
For HTTPS, you have two options:

#### Option 1: Cloudflare (Recommended)
1. Sign up for Cloudflare
2. Add your domain
3. Point to your public IP
4. Enable SSL/TLS

#### Option 2: Self-Signed Certificate
1. Generate SSL certificate
2. Update proxy-server.js to use HTTPS
3. Forward port 443 instead of 80

## 📊 Server Features

### What the Proxy Server Does
- **Frontend**: Serves your React app from `/build`
- **Backend API**: Proxies `/api/*` to `http://localhost:5000`
- **File Uploads**: Proxies `/uploads/*` to backend
- **Health Check**: `/health` endpoint for monitoring
- **Error Handling**: Graceful error responses
- **Logging**: Request/response logging
- **CORS**: Handles cross-origin requests

### Performance Features
- **Static Caching**: 1 year cache for static files
- **Compression**: Automatic gzip compression
- **Timeout Protection**: 30-second timeouts
- **Graceful Shutdown**: Clean server stop

## 🔄 Development vs Production

### Development Mode
```bash
# Use port 3001 for development (no admin needed)
npm run proxy:dev

# Frontend: http://localhost:3001
# Backend: http://localhost:3001/api
# Images: http://localhost:3001/uploads
```

### Production Mode
```bash
# Use port 80 for production (admin required)
npm run online

# Frontend: http://localhost
# Backend: http://localhost/api
# Images: http://localhost/uploads
```

## 🎉 Success Checklist

When everything is working, you should see:

✅ **Backend running**: Server console shows "Server is running on port 5000"  
✅ **Proxy running**: Proxy console shows server details  
✅ **Local access**: `http://localhost` loads your application  
✅ **API working**: Data loads correctly in the application  
✅ **Images loading**: All images display properly  
✅ **Mobile access**: Works on mobile devices  
✅ **Network access**: Works from other computers on your network  
✅ **Online access**: Works from public internet (after port forwarding)  

## 🆘 Get Help

If you encounter issues:

1. **Check logs**: Both backend and proxy show detailed logs
2. **Verify ports**: Ensure no conflicts with other services
3. **Test components**: Try backend and proxy separately
4. **Network tools**: Use `npm run network:check` for diagnostics

## 🚀 Going Live

Once everything is working locally:

1. **Choose your port**: 80 (requires admin) or 8080 (easier)
2. **Configure port forwarding** on your router
3. **Test from external network** (mobile data)
4. **Share your public IP** with users
5. **Consider domain name** for professional appearance

Your Sangguniang Bayan Transparency Portal is now ready for online access! 🎉
