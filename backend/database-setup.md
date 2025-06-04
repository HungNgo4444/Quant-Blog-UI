# PostgreSQL Database Setup Guide

## 1. Cài đặt PostgreSQL

### Windows:
```bash
# Download từ: https://www.postgresql.org/download/windows/
# Hoặc dùng Chocolatey:
choco install postgresql

# Hoặc dùng Scoop:
scoop install postgresql
```

### macOS:
```bash
# Homebrew:
brew install postgresql
brew services start postgresql
```

### Linux (Ubuntu/Debian):
```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

## 2. Tạo Database và User

```sql
-- Kết nối vào PostgreSQL
psql -U postgres

-- Tạo database
CREATE DATABASE quant_blog;

-- Tạo user (optional, có thể dùng postgres user)
CREATE USER blog_admin WITH PASSWORD 'your_secure_password';

-- Cấp quyền
GRANT ALL PRIVILEGES ON DATABASE quant_blog TO blog_admin;

-- Thoát
\q
```

## 3. Cấu hình Environment

Tạo file `.env` trong thư mục backend:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password_here
DB_NAME=quant_blog

# Application Configuration
PORT=3001
NODE_ENV=development

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this-in-production
JWT_REFRESH_EXPIRES_IN=30d

# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com

# Google OAuth (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# Frontend URL
FRONTEND_URL=http://localhost:3000
```

## 4. Chạy ứng dụng

```bash
# Cài đặt dependencies
cd backend
npm install

# Start development server
npm run start:dev
```

## 5. Auto Migration

TypeORM sẽ tự động tạo tables khi `synchronize: true` trong development mode.

Các entities đã được định nghĩa:
- **users**: Quản lý người dùng
- **posts**: Bài viết
- **categories**: Danh mục
- **tags**: Thẻ
- **post_tags**: Quan hệ many-to-many
- **comments**: Bình luận
- **likes**: Lượt thích
- **views**: Lượt xem
- **sessions**: Phiên đăng nhập
- **activity_logs**: Nhật ký hoạt động

## 6. Production Setup

Trong production, nên:
- Tắt `synchronize: false`
- Sử dụng migrations thay vì auto-sync
- Setup SSL connection
- Backup strategy

## 7. Useful Commands

```bash
# Xem database
psql -U postgres -d quant_blog

# List tables
\dt

# Describe table
\d users

# Exit
\q
```

## 8. Connection String Format

```
postgresql://username:password@host:port/database
```

Ví dụ:
```
postgresql://postgres:password@localhost:5432/quant_blog
``` 