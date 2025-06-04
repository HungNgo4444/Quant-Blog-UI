# PostgreSQL Quick Start Guide

## 🚀 Hướng dẫn nhanh setup PostgreSQL cho blog

### 1. Cài đặt PostgreSQL

#### Windows:
```bash
# Download từ: https://www.postgresql.org/download/windows/
# Hoặc dùng Chocolatey:
choco install postgresql

# Hoặc dùng Scoop:
scoop install postgresql
```

#### macOS:
```bash
# Homebrew:
brew install postgresql
brew services start postgresql
```

### 2. Tạo Database

```bash
# Kết nối PostgreSQL
psql -U postgres

# Tạo database
CREATE DATABASE quant_blog;

# Thoát
\q
```

### 3. Cấu hình Backend

```bash
cd backend

# Tạo file .env từ template
cp env-example.txt .env

# Chỉnh sửa .env với thông tin database của bạn:
# DB_PASSWORD=your_postgres_password
```

### 4. Cài đặt và chạy

```bash
# Install dependencies
npm install

# Chạy server (sẽ tự động tạo tables)
npm run start:dev

# Server chạy tại: http://localhost:3001
# API docs tại: http://localhost:3001/api/docs
```

### 5. Kiểm tra kết nối

Truy cập: http://localhost:3001/health/database

### 6. Tạo dữ liệu mẫu (Optional)

```bash
npm run db:seed
```

Sẽ tạo:
- **Admin user**: admin@example.com / Admin123!
- **Sample user**: user@example.com / User123!
- **Categories**: Technology, Tutorial, Programming, Web Development, DevOps
- **Tags**: TypeScript, React, Next.js, Node.js, etc.
- **Sample posts**: 2 bài viết mẫu

### 7. Chạy Frontend

```bash
cd ..
npm run dev
```

Frontend: http://localhost:3000

## 🔧 Troubleshooting

### Lỗi kết nối database:
```bash
# Kiểm tra PostgreSQL đang chạy
pg_isready -h localhost -p 5432

# Windows: kiểm tra service
services.msc → PostgreSQL

# macOS: restart service
brew services restart postgresql
```

### Lỗi password authentication:
1. Kiểm tra password trong file `.env`
2. Reset password PostgreSQL user nếu cần

### Kiểm tra tables được tạo:
```sql
psql -U postgres -d quant_blog
\dt
```

Bạn sẽ thấy các tables:
- users
- posts  
- categories
- tags
- post_tags
- comments
- likes
- views
- sessions
- activity_logs

## 📊 Database Schema

```
users (id, email, name, password, role, bio, avatar, social_links...)
├── posts (author_id → users.id)
├── comments (author_id → users.id)
├── likes (user_id → users.id)
├── views (user_id → users.id)
├── sessions (user_id → users.id)
└── activity_logs (user_id → users.id)

categories (id, name, slug, description, color)
└── posts (category_id → categories.id)

tags (id, name, slug)
└── post_tags (many-to-many: posts ↔ tags)
```

## 🎯 Kết quả

Sau khi setup xong:
- ✅ Backend NestJS với PostgreSQL
- ✅ Authentication & authorization
- ✅ Admin dashboard
- ✅ Post management
- ✅ User profiles
- ✅ API documentation
- ✅ Health checks
- ✅ Sample data

Bạn có thể đăng nhập admin panel tại: http://localhost:3000/admin với tài khoản admin@example.com 