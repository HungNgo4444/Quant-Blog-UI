# Quant Blog - Brownfield Architecture Document

## Introduction

Tài liệu này mô tả TRẠNG THÁI HIỆN TẠI của hệ thống Quant Blog, tập trung vào việc cải thiện UI/UX cho tốt hơn. Đây là một nền tảng blog chuyên về quant trading, blockchain, và DeFi được xây dựng với Next.js và NestJS.

### Document Scope

**Tập trung chính**: Cải thiện giao diện người dùng (UI) cho đẹp và chuyên nghiệp hơn
**Mục đích project**: Blog chia sẻ kiến thức về quant trading, blockchain, DeFi

### Change Log

| Date   | Version | Description                 | Author    |
| ------ | ------- | --------------------------- | --------- |
| 2025-09-29 | 1.0     | Initial brownfield analysis | BMad Master |

## Quick Reference - Key Files and Entry Points

### Critical Files for Understanding the System

- **Main Entry (Frontend)**: `frontend/src/app/layout.tsx`
- **Main Entry (Backend)**: `backend/src/main.ts`
- **Configuration**: `frontend/next.config.js`, `backend/src/app.module.ts`
- **Core UI Components**: `frontend/src/components/ui/` (shadcn/ui components)
- **Layout Components**: `frontend/src/components/Layout/Header.tsx`, `frontend/src/components/Layout/Footer.tsx`
- **Styling**: `frontend/src/styles/globals.css`, `frontend/tailwind.config.js`
- **Database**: `db.sql`, `docker-compose.yml`

### UI Improvement Focus Areas

**Cần cải thiện UI trong các file:**
- `frontend/src/components/Layout/Header.tsx` - Header navigation
- `frontend/src/components/Home/HomePage.tsx` - Landing page design
- `frontend/src/components/Posts/PostCard.tsx` - Post display cards
- `frontend/src/components/Editor/PostEditor.tsx` - Content creation UI
- `frontend/src/components/admin/dashboard/` - Admin interface

## High Level Architecture

### Technical Summary

**Kiến trúc**: Full-stack application với frontend và backend riêng biệt
**Pattern**: Monorepo structure với 2 ứng dụng độc lập

### Actual Tech Stack (from package.json)

| Category  | Technology | Version | Notes                      |
| --------- | ---------- | ------- | -------------------------- |
| **Frontend** |
| Framework | Next.js    | 14.0.3  | App Router, SSR/SSG        |
| Language  | TypeScript | ^5      | Strong typing              |
| Styling   | Tailwind CSS | ^3.3.0 | Utility-first CSS          |
| UI Library | shadcn/ui + Radix UI | Latest | Modern component library |
| State Management | Redux Toolkit | ^1.9.7 | Global state management |
| Rich Editor | TipTap | ^2.14.1 | WYSIWYG editor |
| Charts    | Chart.js + React-Chartjs-2 | ^4.4.0 + ^5.2.0 | Analytics dashboard |
| **Backend** |
| Framework | NestJS     | ^11.0.1 | Node.js framework          |
| Language  | TypeScript | ^5.7.3  | Strong typing              |
| Database  | PostgreSQL | 16      | Primary database           |
| ORM       | TypeORM    | ^0.3.24 | Database abstraction       |
| Cache     | Redis      | ^4.7.1  | Session & caching          |
| Auth      | JWT + Passport | ^11.0.0 | Authentication system |
| **DevOps** |
| Containerization | Docker + Compose | Latest | Local development |
| Build     | SWC        | ^1.10.7 | Fast compilation           |

### Repository Structure Reality Check

- **Type**: Monorepo với 2 applications
- **Package Manager**: npm
- **Notable**: Frontend và backend hoàn toàn tách biệt

## Source Tree and Module Organization

### Project Structure (Actual)

```text
Quant-Blog-main/
├── frontend/                    # Next.js application
│   ├── src/
│   │   ├── app/                # Next.js 14 App Router
│   │   ├── components/         # React components
│   │   │   ├── ui/            # shadcn/ui base components
│   │   │   ├── Layout/        # Layout components (Header, Footer)
│   │   │   ├── Home/          # Homepage components
│   │   │   ├── Posts/         # Blog post components
│   │   │   ├── Editor/        # TipTap editor components
│   │   │   ├── Auth/          # Authentication forms
│   │   │   ├── Admin/         # Admin dashboard
│   │   │   └── Common/        # Shared components
│   │   ├── services/          # API service layer
│   │   ├── store/             # Redux store & slices
│   │   ├── styles/            # CSS files
│   │   └── types/             # TypeScript type definitions
│   ├── public/                # Static assets & screenshots
│   └── tailwind.config.js     # Tailwind configuration
├── backend/                    # NestJS application
│   └── src/
│       ├── modules/           # Feature modules
│       │   ├── auth/         # Authentication module
│       │   ├── posts/        # Blog posts module
│       │   ├── users/        # User management
│       │   ├── categories/   # Post categories
│       │   ├── tags/         # Post tags
│       │   ├── comments/     # Comments system
│       │   ├── qa/           # Q&A community feature
│       │   └── dashboard/    # Admin analytics
│       ├── entities/         # TypeORM entities
│       ├── dto/              # Data transfer objects
│       └── common/           # Shared utilities
├── docs/                      # Documentation (NEW)
├── db.sql                     # Database schema
└── docker-compose.yml         # Development services
```

### Key Modules and Their Purpose

**Frontend Components (UI Focus)**:
- **Layout/Header.tsx**: Navigation bar - modern glass-morphism design với scroll effects
- **Home/HomePage.tsx**: Landing page - gradient backgrounds, hero section
- **ui/ folder**: shadcn/ui components - consistent design system
- **Posts/PostCard.tsx**: Blog post cards - cần cải thiện visual hierarchy
- **Editor/TipTap**: Rich text editor với toolbar - cần UI polish

**Backend Modules**:
- **auth**: JWT authentication với Google OAuth
- **posts**: Core blog functionality với categories/tags
- **qa**: Community Q&A feature
- **dashboard**: Admin analytics với Chart.js

## Current UI State Analysis

### ✅ Strengths (Đã có)

1. **Modern Tech Stack**:
   - Tailwind CSS với utility-first approach
   - shadcn/ui components cho consistency
   - Dark/Light mode toggle
   - Responsive design

2. **Design System**:
   - Consistent color palette (grays với accent colors)
   - Typography hierarchy với Inter font
   - Rounded corners (radius system)
   - Gradient effects

3. **Interactive Elements**:
   - Smooth transitions và hover effects
   - Glass-morphism cho header
   - Scroll-based animations
   - Mobile-friendly navigation

### 🔧 Areas Needing UI Improvement

1. **Visual Hierarchy**:
   - Post cards thiếu visual impact
   - Hero section cần compelling hơn
   - Categories/tags display cần improvement

2. **Color & Branding**:
   - Quá nhiều gray tones
   - Thiếu brand colors cho quant/finance theme
   - Cần accent colors cho CTAs

3. **Content Presentation**:
   - Blog post reading experience
   - Code syntax highlighting
   - Image galleries và media display

4. **Dashboard/Admin UI**:
   - Analytics charts cần modern styling
   - Table designs cần improvement
   - Form layouts cần polish

## Data Models and APIs

### Data Models
- **User Model**: `backend/src/entities/user.entity.ts`
- **Post Model**: `backend/src/entities/post.entity.ts`
- **Comment Model**: `backend/src/entities/comment.entity.ts`
- **Category/Tag Models**: `backend/src/entities/category.entity.ts`, `tag.entity.ts`

### API Specifications
- **REST APIs**: NestJS controllers trong `backend/src/modules/`
- **Authentication**: JWT-based với refresh tokens
- **File Upload**: Cloudinary integration
- **Database**: PostgreSQL với TypeORM

## Technical Debt and Known Issues

### UI-Related Technical Debt

1. **Styling Inconsistencies**:
   - Mix của inline styles và CSS classes
   - Không consistent spacing system
   - Some hardcoded colors thay vì design tokens

2. **Component Architecture**:
   - Một số components quá large (Header.tsx ~370 lines)
   - Thiếu reusable micro-components
   - Props drilling trong vài components

3. **Performance**:
   - Không optimized images trong post content
   - Bundle size có thể optimize thêm
   - CSS không được purged properly

### Workarounds cần biết

- **Theme System**: Redux state cho dark/light mode thay vì CSS variables
- **Mobile Menu**: Manual state management thay vì headless UI components
- **Image Handling**: Mix giữa Next/Image và regular img tags

## Integration Points and External Dependencies

### External Services
| Service  | Purpose  | Integration Type | Key Files                      |
| -------- | -------- | ---------------- | ------------------------------ |
| Cloudinary | Image hosting | SDK | `backend` file upload endpoints |
| Google OAuth | Authentication | Passport strategy | `backend/src/modules/auth/` |
| PostgreSQL | Primary database | TypeORM | `backend/src/entities/` |
| Redis | Caching/sessions | redis client | `backend` session management |

### Frontend-Backend Communication
- **API Base**: REST endpoints on backend port
- **Authentication**: JWT tokens trong headers
- **File Upload**: Multipart form data
- **Real-time**: Có thể cần WebSocket cho notifications (hiện tại polling)

## Development and Deployment

### Local Development Setup

```bash
# Frontend setup
cd frontend
npm install
npm run dev  # Port 3000

# Backend setup
cd backend
npm install
npm run start:dev  # Port depends on config

# Database
docker-compose up  # PostgreSQL + Redis
```

### Build and Deployment Process

- **Frontend**: `npm run build` (Next.js static export)
- **Backend**: `npm run build` (NestJS compilation)
- **Database**: Manual migrations với TypeORM
- **Deployment**: Hiện tại deployed trên Vercel (frontend)

## UI Improvement Recommendations

### Phase 1: Quick Wins (1-2 days)

1. **Color Palette Enhancement**:
   - Thêm brand colors cho finance/quant theme
   - Định nghĩa proper accent colors
   - Update gradient combinations

2. **Typography Improvements**:
   - Better heading hierarchy
   - Improved reading typography for blog posts
   - Code block styling improvements

3. **Component Polish**:
   - Post card redesign với better visual hierarchy
   - Button styles consistency
   - Form input improvements

### Phase 2: Major Improvements (3-5 days)

1. **Layout Modernization**:
   - Header/navigation redesign
   - Sidebar layouts cho content
   - Footer enhancement

2. **Content Experience**:
   - Blog post reading experience
   - Image galleries và media presentation
   - Search results presentation

3. **Dashboard Redesign**:
   - Modern admin interface
   - Chart và data visualization improvements
   - Table designs

### Phase 3: Advanced Features (5+ days)

1. **Animation System**:
   - Page transitions
   - Content loading states
   - Micro-interactions

2. **Advanced Components**:
   - Custom design system components
   - Advanced editor toolbar
   - Interactive data visualizations

## Files That Need UI Modification

### High Priority (UI Impact)

- `frontend/src/components/Layout/Header.tsx` - Navigation redesign
- `frontend/src/components/Home/HomePage.tsx` - Landing page hero
- `frontend/src/components/Posts/PostCard.tsx` - Post display cards
- `frontend/tailwind.config.js` - Color system expansion
- `frontend/src/styles/globals.css` - Typography và base styles

### Medium Priority

- `frontend/src/components/Editor/TipTap*.tsx` - Editor UI polish
- `frontend/src/components/admin/dashboard/` - Admin interface
- `frontend/src/components/Auth/` - Login/register forms
- `frontend/src/components/ui/` - Component refinements

### Integration Considerations

- Giữ nguyên functionality hiện có
- Maintain responsive design
- Ensure dark/light mode compatibility
- Follow existing TypeScript patterns
- Keep accessibility standards

## Appendix - Useful Commands and Scripts

### Development Commands

```bash
# Frontend
npm run dev         # Development server
npm run build       # Production build
npm run lint        # Code linting

# Backend
npm run start:dev   # Development server
npm run build       # Production build
npm run test        # Run tests

# Database
docker-compose up   # Start services
npm run db:seed     # Seed test data (backend)
```

### UI Development Tools

- **Tailwind Playground**: Test utility classes
- **Component Storybook**: Có thể setup cho component development
- **Browser DevTools**: Responsive design testing
- **Design Tokens**: Defined trong tailwind.config.js

---

## Success Criteria for UI Improvements

- ✅ Modernized visual design phù hợp với finance/quant theme
- ✅ Consistent design system across all components
- ✅ Improved user experience cho content consumption
- ✅ Professional admin dashboard interface
- ✅ Mobile-first responsive improvements
- ✅ Performance optimization cho UI assets
- ✅ Accessibility standards maintained