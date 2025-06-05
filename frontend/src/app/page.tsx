import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import HomePage from '../components/Home/HomePage';
import axios from 'axios';
import { getPostsServer } from '../services/PostService';

export default async function Page() {
  // Chỉ fetch posts trên server (không cần auth)
  const posts = await getPostsServer()
  
  // User sẽ được fetch trên client-side để có refresh token
  return <HomePage postsData={posts} />;
} 