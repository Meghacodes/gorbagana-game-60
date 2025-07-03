
# Gorbagana GameHub - Deployment Guide

This guide covers deploying the Gorbagana GameHub to various platforms and setting up the complete infrastructure.

## 🚀 Quick Deployment Options

### **Option 1: Lovable (Recommended for Testing)**
1. **Automatic Deployment**: The app is automatically deployed through Lovable
2. **Live Preview**: Available at your Lovable project URL
3. **Easy Updates**: Changes are deployed automatically
4. **Custom Domain**: Available with paid Lovable plans

### **Option 2: Vercel (Recommended for Production)**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy to Vercel
vercel --prod

# Configure environment variables in Vercel dashboard
```

### **Option 3: Netlify**
```bash
# Build the project
npm run build

# Deploy to Netlify
netlify deploy --prod --dir=dist
```

### **Option 4: Custom Server**
```bash
# Build for production
npm run build

# Serve using any static file server
# Example with serve:
npx serve -s dist -l 3000
```

## 🔧 Environment Configuration

### **Required Environment Variables**
```env
# Supabase Configuration (if using real backend)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Gorbagana Testnet Configuration (future)
VITE_GORBAGANA_RPC_URL=https://testnet-rpc.gorbagana.org
VITE_GORBAGANA_CHAIN_ID=gorbagana-testnet-1

# Optional: Analytics and Monitoring
VITE_ANALYTICS_ID=your-analytics-id
VITE_SENTRY_DSN=your-sentry-dsn
```

### **Platform-Specific Setup**

#### **Vercel**
1. Create `vercel.json` in project root:
```json
{
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
      "dest": "/index.html"
    }
  ]
}
```

2. Set environment variables in Vercel dashboard
3. Connect GitHub repository for automatic deployments

#### **Netlify**
1. Create `netlify.toml` in project root:
```toml
[build]
  publish = "dist"
  command = "npm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

2. Set environment variables in Netlify dashboard
3. Enable automatic deployments from Git

## 🗄️ Database Setup (Supabase)

### **1. Create Supabase Project**
1. Go to [supabase.com](https://supabase.com)
2. Create new project
3. Note down the project URL and anon key

### **2. Run Database Migrations**
```sql
-- Execute the SQL from supabase/migrations/ directory
-- This creates all necessary tables and functions
```

### **3. Configure Row Level Security**
The migrations include RLS policies, but verify they're active:
```sql
-- Check RLS status
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';
```

### **4. Enable Realtime**
```sql
-- Enable realtime for multiplayer functionality
ALTER PUBLICATION supabase_realtime ADD TABLE game_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE room_players;
```

## 🔗 Gorbagana Testnet Integration

### **Current Status**
- ✅ Database schema ready for blockchain integration
- ✅ Transaction logging system implemented
- ✅ Wallet connection simulation in place
- 🔄 Awaiting Gorbagana testnet specifications

### **Integration Checklist**
- [ ] Gorbagana testnet RPC endpoints
- [ ] GORB token contract addresses
- [ ] Backpack wallet SDK updates
- [ ] Smart contract deployment
- [ ] Gas fee optimization
- [ ] Transaction monitoring

## 🔒 Security Considerations

### **Frontend Security**
- All sensitive operations happen server-side
- Environment variables are properly prefixed with `VITE_`
- CSP headers configured for production
- HTTPS enforced in production

### **Database Security**
- Row Level Security (RLS) enabled on all tables
- Wallet-based access control
- Input validation and sanitization
- Rate limiting on API endpoints

### **Blockchain Security**
- Transaction signing happens in user's wallet
- No private keys stored on servers
- Multi-signature for admin operations
- Emergency pause mechanisms

## 📊 Monitoring & Analytics

### **Performance Monitoring**
```bash
# Add Sentry for error tracking
npm install @sentry/react @sentry/tracing

# Configure in main.tsx
import * as Sentry from "@sentry/react";

Sentry.init({
  dsn: "YOUR_SENTRY_DSN",
  environment: process.env.NODE_ENV,
});
```

### **Analytics Setup**
```bash
# Add Google Analytics 4
npm install gtag

# Configure tracking
```

### **Uptime Monitoring**
- Set up monitoring with services like:
  - UptimeRobot
  - Pingdom
  - StatusPage

## 🚨 Troubleshooting

### **Common Issues**

#### **Build Failures**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check TypeScript errors
npm run type-check
```

#### **Supabase Connection Issues**
```bash
# Verify environment variables
echo $VITE_SUPABASE_URL
echo $VITE_SUPABASE_ANON_KEY

# Test connection
curl "$VITE_SUPABASE_URL/rest/v1/" \
  -H "apikey: $VITE_SUPABASE_ANON_KEY"
```

#### **Real-time Not Working**
1. Check Supabase realtime is enabled
2. Verify tables are added to publication
3. Check WebSocket connections in browser dev tools

### **Performance Issues**
```bash
# Analyze bundle size
npm run build
npm install -g webpack-bundle-analyzer
npx webpack-bundle-analyzer dist/assets/*.js

# Optimize images
npm install -g imagemin-cli
imagemin src/assets/* --out-dir=dist/assets
```

## 🔄 CI/CD Pipeline

### **GitHub Actions Example**
```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

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
        
      - name: Run tests
        run: npm test
        
      - name: Build project
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
          
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 📱 Mobile Deployment

### **PWA Configuration**
The app includes PWA support. To enhance mobile experience:

1. **Install Prompt**: Implemented automatically
2. **Offline Support**: Service worker configured
3. **App Icons**: Multiple sizes included
4. **Splash Screens**: Configured for iOS and Android

### **Mobile App Stores** (Future)
- React Native conversion planned
- Expo managed workflow
- App Store and Google Play deployment

## 🔧 Advanced Configuration

### **Custom Domain Setup**
1. **DNS Configuration**:
   ```
   CNAME: your-domain.com -> your-deployment-url
   ```

2. **SSL Certificate**: Automatically handled by most platforms

3. **CDN Configuration**: For global performance optimization

### **Load Balancing** (High Traffic)
```nginx
# Nginx configuration example
upstream gamehub {
    server app1.example.com;
    server app2.example.com;
    server app3.example.com;
}

server {
    listen 80;
    server_name gorbagana-gamehub.com;
    
    location / {
        proxy_pass http://gamehub;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

## 📞 Support

For deployment issues:
- **GitHub Issues**: Technical problems
- **Discord**: Community support
- **Email**: deployment@gorbagana-gamehub.com

---

**🚀 Happy deploying! The Gorbagana gaming ecosystem awaits.**
