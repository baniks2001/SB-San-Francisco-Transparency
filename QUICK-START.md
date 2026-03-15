# 🚀 Quick Start: Online Access

## 3 Commands to Go Online

### 1. Start Backend
```bash
cd server
npm run dev
```

### 2. Build Frontend
```bash
cd ..
npm run build
```

### 3. Start Online Server
```bash
setup-online.bat
```

## 🌐 Access URLs

After running setup-online.bat:

- **Local**: `http://localhost`
- **Network**: `http://your-local-ip`
- **Public**: `http://your-public-ip`

## 🔗 Router Setup (5 Minutes)

1. **Open Router**: `http://192.168.1.1`
2. **Login**: admin/password
3. **Find**: Port Forwarding
4. **Add Rule**:
   - External Port: 80
   - Internal Port: 80
   - Protocol: TCP
   - Internal IP: your-local-ip
5. **Save & Restart**

## 📱 Test Online Access

1. **Turn off WiFi** on your phone
2. **Open browser**
3. **Go to**: `http://your-public-ip`
4. **Should load!** 🎉

## 🆘 Need Help?

- **Detailed Guide**: `online-access-guide.md`
- **Auto Setup**: `setup-online.bat`
- **Manual Start**: `node proxy-server.js`

---

**That's it! Your Sangguniang Bayan Portal is now accessible from anywhere!** 🌟
