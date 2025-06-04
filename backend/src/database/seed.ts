import { DataSource } from 'typeorm';
import { User, UserRole } from '../entities/user.entity';
import { Category } from '../entities/category.entity';
import { Tag } from '../entities/tag.entity';
import { Post } from '../entities/post.entity';
import * as bcrypt from 'bcryptjs';
import { PostStatus } from '../entities/post.entity';

export async function seed(dataSource: DataSource) {
  console.log('🌱 Starting database seeding...');

  const userRepository = dataSource.getRepository(User);
  const categoryRepository = dataSource.getRepository(Category);
  const tagRepository = dataSource.getRepository(Tag);
  const postRepository = dataSource.getRepository(Post);

  try {
    // 1. Create admin user
    const adminExists = await userRepository.findOne({ where: { email: 'admin@example.com' } });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('Admin123!', 10);
      const admin = userRepository.create({
        email: 'admin@example.com',
        name: 'Admin User',
        password: hashedPassword,
        role: UserRole.ADMIN,
        emailVerified: true,
        bio: 'Blog administrator and content manager',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        socialLinks: {
          website: 'https://example.com',
          twitter: '@admin',
          linkedin: 'https://linkedin.com/in/admin',
          github: 'https://github.com/admin',
        },
      });
      await userRepository.save(admin);
      console.log('✅ Admin user created');
    }

    // 2. Create sample user
    const userExists = await userRepository.findOne({ where: { email: 'user@example.com' } });
    if (!userExists) {
      const hashedPassword = await bcrypt.hash('User123!', 10);
      const user = userRepository.create({
        email: 'user@example.com',
        name: 'John Doe',
        password: hashedPassword,
        role: UserRole.USER,
        emailVerified: true,
        bio: 'Technology enthusiast and blogger',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        socialLinks: {
          website: 'https://johndoe.dev',
          twitter: '@johndoe',
          github: 'https://github.com/johndoe',
        },
      });
      await userRepository.save(user);
      console.log('✅ Sample user created');
    }

    // 3. Create categories
    const categories = [
      { name: 'Technology', slug: 'technology', description: 'Latest tech trends and innovations', color: '#3b82f6' },
      { name: 'Tutorial', slug: 'tutorial', description: 'Step-by-step guides and tutorials', color: '#10b981' },
      { name: 'Programming', slug: 'programming', description: 'Coding tips and best practices', color: '#8b5cf6' },
      { name: 'Web Development', slug: 'web-development', description: 'Frontend and backend development', color: '#f59e0b' },
      { name: 'DevOps', slug: 'devops', description: 'Infrastructure and deployment', color: '#ef4444' },
    ];

    for (const categoryData of categories) {
      const exists = await categoryRepository.findOne({ where: { slug: categoryData.slug } });
      if (!exists) {
        const category = categoryRepository.create(categoryData);
        await categoryRepository.save(category);
      }
    }
    console.log('✅ Categories created');

    // 4. Create tags
    const tags = [
      'TypeScript', 'JavaScript', 'React', 'Next.js', 'Node.js', 'NestJS',
      'PostgreSQL', 'MongoDB', 'Docker', 'Kubernetes', 'AWS', 'Firebase',
      'CSS', 'Tailwind', 'Material-UI', 'API', 'REST', 'GraphQL',
      'Testing', 'Jest', 'Cypress', 'Git', 'GitHub', 'CI/CD'
    ];

    for (const tagName of tags) {
      const slug = tagName.toLowerCase().replace(/[^a-z0-9]/g, '-');
      const exists = await tagRepository.findOne({ where: { slug } });
      if (!exists) {
        const tag = tagRepository.create({
          name: tagName,
          slug,
        });
        await tagRepository.save(tag);
      }
    }
    console.log('✅ Tags created');

    // 5. Create sample posts
    const admin = await userRepository.findOne({ where: { email: 'admin@example.com' } });
    const user = await userRepository.findOne({ where: { email: 'user@example.com' } });
    const techCategory = await categoryRepository.findOne({ where: { slug: 'technology' } });
    const tutorialCategory = await categoryRepository.findOne({ where: { slug: 'tutorial' } });
    const typescriptTag = await tagRepository.findOne({ where: { slug: 'typescript' } });
    const reactTag = await tagRepository.findOne({ where: { slug: 'react' } });
    const nextjsTag = await tagRepository.findOne({ where: { slug: 'next-js' } });

    const posts = [
      {
        title: 'Getting Started with TypeScript in 2024',
        slug: 'getting-started-with-typescript-2024',
        content: `# Getting Started with TypeScript in 2024

TypeScript has become an essential tool for modern web development. In this comprehensive guide, we'll explore everything you need to know to get started with TypeScript.

## What is TypeScript?

TypeScript is a strongly typed programming language that builds on JavaScript, giving you better tooling at any scale.

## Installation

\`\`\`bash
npm install -g typescript
\`\`\`

## Basic Types

\`\`\`typescript
let message: string = "Hello, TypeScript!";
let count: number = 42;
let isComplete: boolean = true;
\`\`\`

TypeScript provides powerful type checking that helps catch errors at compile time rather than runtime.`,
        excerpt: 'Learn the fundamentals of TypeScript and how to integrate it into your development workflow.',
        authorId: admin.id,
        categoryId: techCategory.id,
        tags: [typescriptTag],
        status: PostStatus.PUBLISHED,
        featuredImage: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&h=400&fit=crop',
      },
      {
        title: 'Building Modern React Applications with Next.js',
        slug: 'building-modern-react-applications-nextjs',
        content: `# Building Modern React Applications with Next.js

Next.js is a powerful React framework that provides everything you need to build production-ready applications.

## Key Features

- **Server-side Rendering (SSR)**
- **Static Site Generation (SSG)**
- **API Routes**
- **File-based Routing**
- **Image Optimization**

## Getting Started

\`\`\`bash
npx create-next-app@latest my-app --typescript --tailwind --eslint
cd my-app
npm run dev
\`\`\`

## Project Structure

\`\`\`
src/
  app/
    page.tsx
    layout.tsx
  components/
  lib/
\`\`\`

Next.js 13+ uses the new app directory structure with React Server Components.`,
        excerpt: 'Discover how to build scalable React applications using Next.js framework with TypeScript.',
        authorId: user.id,
        categoryId: tutorialCategory.id,
        tags: [reactTag, nextjsTag, typescriptTag],
        status: PostStatus.PUBLISHED,
        featuredImage: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&h=400&fit=crop',
      },
    ];

    for (const postData of posts) {
      const exists = await postRepository.findOne({ where: { slug: postData.slug } });
      if (!exists) {
        const post = postRepository.create({
          ...postData,
          readingTime: Math.ceil(postData.content.split(' ').length / 200), // Estimate reading time
          publishedAt: new Date(),
        });
        await postRepository.save(post);
      }
    }
    console.log('✅ Sample posts created');

    console.log('🎉 Database seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
} 