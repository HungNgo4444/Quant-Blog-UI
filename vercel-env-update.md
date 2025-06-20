# VERCEL ENVIRONMENT VARIABLES UPDATE

## 📝 CẬP NHẬT TRÊN VERCEL DASHBOARD:

1. **Truy cập Vercel Dashboard:**
   - Vào https://vercel.com/dashboard
   - Chọn project `quant-blog-ten`

2. **Vào Settings → Environment Variables:**
   - Update variable `NEXT_PUBLIC_API_URL` 
   - Từ: `http://localhost:3001`
   - Thành: `https://your-render-app-name.onrender.com`

3. **Redeploy:**
   - Vào Deployments tab
   - Click "Redeploy" trên deployment mới nhất

## 🔗 RENDER APP URL:
Sau khi deploy trên Render xong, bạn sẽ có URL như:
```
https://quant-blog-backend-xxx.onrender.com
```

## ⚠️ LƯU Ý:
- Render free tier có thể sleep sau 15 phút không dùng
- Lần đầu request có thể mất 30s để wake up
- Consider upgrade nếu cần performance tốt hơn 