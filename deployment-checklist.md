# 🚀 DEPLOYMENT CHECKLIST

## ✅ Frontend (Completed)
- [x] Vercel deployment successful
- [x] Domain: https://quant-blog-ten.vercel.app

## 🗄️ Database (Neon Tech)
- [ ] 1. Tạo account Neon Tech
- [ ] 2. Tạo project "quant-blog-production"  
- [ ] 3. Tạo database "quant_blog"
- [ ] 4. Copy connection string
- [ ] 5. Test connection

## 🔴 Redis (Upstash)
- [ ] 1. Tạo account Upstash
- [ ] 2. Tạo database "quant-blog-redis"
- [ ] 3. Region: Singapore
- [ ] 4. Copy connection details
- [ ] 5. Test connection

## 🖥️ Backend (Render)
- [ ] 1. Push code to GitHub
- [ ] 2. Tạo account Render  
- [ ] 3. Connect GitHub repo
- [ ] 4. Configure build settings
- [ ] 5. Set environment variables
- [ ] 6. Deploy và test

## 🔗 Integration
- [ ] 1. Update Vercel env với Render URL
- [ ] 2. Test frontend → backend connection  
- [ ] 3. Test authentication flow
- [ ] 4. Test Redis functionality
- [ ] 5. Test database operations

## 🧪 Final Testing
- [ ] Register new account
- [ ] Email verification  
- [ ] Login/logout
- [ ] Create post
- [ ] Upload image
- [ ] Save/unsave posts

---

## 🆘 TROUBLESHOOTING

### Common Issues:
1. **CORS Error:** Check FRONTEND_URL in backend env
2. **Database Connection:** Verify Neon connection string
3. **Redis Error:** Check Upstash credentials  
4. **Build Failed:** Check Node version (16+)
5. **500 Error:** Check backend logs on Render

### Useful Commands:
```bash
# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Test database connection
psql "postgresql://username:password@host/dbname?sslmode=require"

# Test Redis connection  
redis-cli -h host -p port -a password ping
``` 