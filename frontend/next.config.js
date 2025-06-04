/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['localhost', 'example.com'],
    formats: ['image/avif', 'image/webp'],
  },
  env: {
    NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'dev-secret-key',
    NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'http://localhost:3000',
    DATABASE_URL: process.env.DATABASE_URL || 'file:./dev.db',
    EMAIL_SERVER_HOST: process.env.EMAIL_SERVER_HOST || 'smtp.gmail.com',
    EMAIL_SERVER_PORT: process.env.EMAIL_SERVER_PORT || '587',
    EMAIL_SERVER_USER: process.env.EMAIL_SERVER_USER || '',
    EMAIL_SERVER_PASSWORD: process.env.EMAIL_SERVER_PASSWORD || '',
    EMAIL_FROM: process.env.EMAIL_FROM || 'noreply@example.com',
  },
}

module.exports = nextConfig 