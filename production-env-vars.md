# ENVIRONMENT VARIABLES CHO RENDER

## 🔧 BASIC CONFIG
```
NODE_ENV=production
API_PREFIX=v1
COOKIE_DOMAIN=.render.com
REGISTRATION_EXPIRE_TIME=3600
JWT_ACCESS_EXPIRATION_TIME=1d
JWT_REFRESH_EXPIRATION_TIME=15d
```

## 🔐 JWT SECRETS (Generate new ones for production!)
```
JWT_SECRET=[GENERATE_NEW_SECRET_KEY]
```

## 🐘 DATABASE (From Neon Tech)
```
DB_HOST=[NEON_HOST]
DB_PORT=5432
DB_USERNAME=[NEON_USERNAME]
DB_PASSWORD=[NEON_PASSWORD]  
DB_NAME=quant_blog
```

## 🔴 REDIS (From Upstash)
```
REDIS_URL=[UPSTASH_REDIS_URL]
REDIS_HOST=[UPSTASH_HOST]
REDIS_PORT=6379
REDIS_PASSWORD=[UPSTASH_PASSWORD]
REDIS_DB=0
```

## 🌐 FRONTEND
```
FRONTEND_URL=https://quant-blog-ten.vercel.app
```

## 📧 EMAIL (Same as your current)
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=465
EMAIL_SENDER=hoanyttv@gmail.com
EMAIL_PASSWORD=leuk voke jcuk obnl
```

## ☁️ CLOUDINARY (Same as your current)  
```
CLOUDINARY_CLOUD_NAME=dac8qgcug
CLOUDINARY_API_KEY=355279637337796
CLOUDINARY_API_SECRET=mekeVlRa_eJa6qo4W3pjNDOEzdU
```

---

## 🎯 STEPS TO SET:

1. **Generate JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

2. **Get Neon Database URL:**
- From Neon dashboard → Connection Details
- Parse connection string to get individual parts

3. **Get Upstash Redis URL:**
- From Upstash dashboard → Database → REST API
- Copy connection details

4. **Set on Render:**
- Go to your service → Environment tab
- Add all variables above
- Click "Save" 