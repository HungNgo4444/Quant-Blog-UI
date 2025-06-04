# Quant Blog - Hệ Thống Blog Toàn Diện

Một hệ thống blog hiện đại được xây dựng với Next.js, Redux, Material UI, và Tailwind CSS.

## 🚀 Tính Năng

### Hệ Thống Authentication
- ✅ Đăng ký/đăng nhập
- ✅ Xác thực email 
- ✅ Quên mật khẩu (gửi mail lấy code xác nhận)
- ✅ Bảo mật 2 lớp
- ✅ Quản lý thông tin cá nhân và avatar

### Editor & Content
- ✅ Editor Markdown với preview
- ✅ Tối ưu SEO
- ✅ Ước tính thời gian đọc
- ✅ Light mode / Dark mode

### Tracking & Analytics
- ✅ Theo dõi lượt xem (cả người dùng đăng nhập và ẩn danh)
- ✅ Tracking like/share
- ✅ Thống kê hiệu suất bài viết
- ✅ Analytics & Thống kê

### Quản Trị (Admin)
- ✅ Quản lý Bài viết (CRUD operations)
- ✅ Quản lý category
- ✅ Quản lý tags
- ✅ Quản trị Blog
- ✅ Quản lý thông tin tác giả
- ✅ Cấu hình thông tin blog

### Tính Năng Khác
- ✅ Liên kết mạng xã hội
- ✅ Responsive design
- ✅ Xem bài viết (cho user thường)

## 🛠️ Công Nghệ Sử Dụng

- **Frontend**: Next.js 14, React, TypeScript
- **UI**: Material UI, Tailwind CSS
- **State Management**: Redux Toolkit
- **Database**: SQLite với Prisma ORM
- **Authentication**: Custom JWT + NextAuth.js
- **Email**: Nodemailer
- **Styling**: CSS Modules, Tailwind CSS

## 📦 Cài Đặt

### Yêu Cầu Hệ Thống
- Node.js 18+ 
- npm hoặc yarn

### Bước 1: Clone Repository
```bash
git clone https://github.com/HungNgo4444/Quant-Blog.git
cd Quant-Blog
```

### Bước 2: Cài Đặt Dependencies
```bash
npm install
```

### Bước 3: Thiết Lập Môi Trường
Tạo file `.env.local` trong thư mục gốc:
```env
# Database
DATABASE_URL="file:./dev.db"

# NextAuth.js
NEXTAUTH_SECRET="your-secret-key-here"
NEXTAUTH_URL="http://localhost:3000"

# Email Configuration (Gmail example)
EMAIL_SERVER_HOST="smtp.gmail.com"
EMAIL_SERVER_PORT="587"
EMAIL_SERVER_USER="your-email@gmail.com"
EMAIL_SERVER_PASSWORD="your-app-password"
EMAIL_FROM="your-email@gmail.com"

# JWT Secret
JWT_SECRET="your-jwt-secret-here"
```

### Bước 4: Khởi Tạo Database
```bash
npx prisma db push
npx prisma generate
```

### Bước 5: Chạy Development Server

**Cách 1: Sử dụng script PowerShell (Windows)**
```powershell
.\start.ps1
```

**Cách 2: Chạy thủ công**
```bash
# Thiết lập biến môi trường
$env:DATABASE_URL="file:./dev.db"
npm run dev
```

**Cách 3: Linux/Mac**
```bash
DATABASE_URL="file:./dev.db" npm run dev
```

Truy cập: http://localhost:3000

## 📁 Cấu Trúc Project

```
├── src/
│   ├── app/                 # Next.js App Router
│   │   ├── api/            # API Routes
│   │   ├── auth/           # Authentication pages
│   │   └── admin/          # Admin pages
│   ├── components/         # React Components
│   ├── lib/               # Utilities và configs
│   ├── store/             # Redux store
│   └── styles/            # CSS files
├── prisma/                # Database schema
├── public/                # Static files
├── start.ps1             # PowerShell startup script
└── README.md
```

## 🔧 Scripts Có Sẵn

```bash
npm run dev          # Chạy development server
npm run build        # Build production
npm run start        # Chạy production server
npm run lint         # Chạy ESLint
```

## 📧 Cấu Hình Email

Để sử dụng tính năng gửi email, bạn cần:

1. **Gmail**: Tạo App Password tại Google Account settings
2. **Outlook**: Sử dụng SMTP settings của Outlook
3. **Custom SMTP**: Cấu hình theo provider của bạn

## 🚀 Deploy

### Vercel (Khuyến nghị)
1. Push code lên GitHub
2. Kết nối repository với Vercel
3. Thiết lập environment variables
4. Deploy!

### Docker
```bash
# Build image
docker build -t quant-blog .

# Run container
docker run -p 3000:3000 quant-blog
```

## 🤝 Đóng Góp

1. Fork repository
2. Tạo feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Tạo Pull Request

## 📄 License

MIT License - xem file [LICENSE](LICENSE) để biết thêm chi tiết.

## 📞 Liên Hệ

- GitHub: [@HungNgo4444](https://github.com/HungNgo4444)
- Email: your-email@example.com

---

⭐ Nếu project này hữu ích, hãy star repository! 