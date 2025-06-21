#  Quant Blog - Nền tảng viết Blog

[![Next.js](https://img.shields.io/badge/Next.js-14.0.3-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11.0.1-red?style=for-the-badge&logo=nestjs)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7.3-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![Redis](https://img.shields.io/badge/Redis-alpine-red?style=for-the-badge&logo=redis)](https://redis.io/)

## Tổng quan

**Quant Blog** là một nền tảng blog hiện đại được thiết kế để cung cấp trải nghiệm viết, đọc, tương tác với blog tối ưu. Dự án đảm bảo hiệu suất cao, bảo mật và khả năng mở rộng.

### Truy cập ứng dụng
https://quant-blog-ten.vercel.app


##  Screenshots & Demo

###  Trang chủ
- Giao diện với featured posts, recent posts, top posts
- Search và filter functionality
- Responsive design
![Giao diện trang chủ](./frontend/public/screenshot/blog-home.png)

###  Editor
- Rich text editor với TipTap
- Real-time preview
- Image upload và embed
![Giao diện viết bài](./frontend/public/screenshot/blog-create-post.png)

### Quản lý bài viết
- Người dùng quản lý bài viết của mình
![Giao diện quản lý bài](./frontend/public/screenshot/blog-posts-management.png)

### Bài viết
- Xem bài viết
![Giao diện bài viết](./frontend/public/screenshot/blog-post1.png)
![Giao diện bài viết](./frontend/public/screenshot/blog-post2.png)

### Profile tác giả
- Xem thông tin tác giả và các bài viết
![Giao diện bài viết](./frontend/public/screenshot/blog-profile.png)

###  Admin Dashboard
- Quản lý Bài viết, người dùng, danh mục, thẻ, thống kê
![Giao diện admin](./frontend/public/screenshot/blog-admin-dashboard.png)
![Giao diện admin quản lý](./frontend/public/screenshot/blog-admin-management.png)

##  Tính năng chính

###  Hệ thống xác thực & phân quyền
- **Đăng nhập/Đăng ký** với JWT Authentication
- **OAuth Google** integration
- **Phân quyền** theo vai trò (Admin, Author, Reader)
- **Session management** với Redis
- **Password hashing** với bcrypt

###  Quản lý nội dung
- **Rich Text Editor** với TipTap (WYSIWYG)
- **Markdown support** với syntax highlighting
- **Image upload** với Cloudinary integration
- **Draft/Publish workflow**
- **SEO optimization** (meta tags, OpenGraph, Twitter Cards)
- **Reading time calculation**

###  Hệ thống tổ chức nội dung
- **Categories** và **Tags** linh hoạt
- **Search functionality** với full-text search
- **Content filtering** và sorting
- **Related posts** suggestion

###  Tương tác người dùng
- **Comment system** với nested replies
- **Like/Unlike** posts
- **Save posts** cho sau
- **View tracking** và analytics
- **Real-time notifications**

###  Dashboard quản trị
- **Analytics dashboard** với Chart.js
- **User management**
- **Content moderation**
- **System monitoring**
- **Activity logs**

##  Công nghệ sử dụng

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **State Management**: Redux Toolkit
- **Rich Text Editor**: TipTap
- **Charts**: Chart.js + React-Chartjs-2
- **Forms**: React Hook Form + Zod validation
- **HTTP Client**: Axios

### Backend
- **Framework**: NestJS 11
- **Language**: TypeScript
- **Database**: PostgreSQL 16
- **ORM**: TypeORM
- **Cache**: Redis
- **Authentication**: JWT + Passport
- **File Upload**: Cloudinary
- **Email**: Nodemailer
- **API Documentation**: Swagger/OpenAPI

### DevOps & Tools
- **Containerization**: Docker + Docker Compose
- **Database Migration**: TypeORM migrations
- **Code Quality**: ESLint + Prettier
- **Testing**: Jest
- **Build Tool**: SWC (Super-fast bundler)

##  Performance & Optimization

### Frontend Optimization
- **Next.js Image Optimization**
- **Code Splitting** tự động
- **Static Site Generation** cho SEO
- **Service Worker** cho PWA
- **Bundle analysis** và optimization

### Backend Optimization
- **Database indexing** tối ưu
- **Redis caching** cho queries thường dùng
- **Connection pooling**
- **Query optimization** với TypeORM
- **Rate limiting** và security headers

##  Security Features

- **JWT Authentication** với refresh tokens
- **Password hashing** với bcrypt
- **CORS configuration**
- **Rate limiting**
- **Input validation** với class-validator
- **SQL injection prevention**
- **XSS protection**
