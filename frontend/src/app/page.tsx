import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import HomePage from '../components/Home/HomePage';
import axios from 'axios';
import { getPosts } from '../services/PostService';
import { getUser } from '../services/AuthService';

async function getServerSideData() {
  const cookieStore = cookies();
  const token = cookieStore.get('accessToken');
  
  try {
    // Fetch posts
    const posts = await getPosts()

    // Fetch user if authenticated
    let user = null;
    if (token?.value) {
      try {
        const userRes = await getUser(token.value)
        user = userRes.user;
      } catch (authError) {
        console.log('Auth check failed, user not authenticated');
        // Không throw error, chỉ để user = null
      }
    }

    return { posts, user };
  } catch (error) {
    console.error('Error fetching data:', error);
    return { posts: [], user: null };
  }
}

export default async function Page() {
  const data = await getServerSideData();
  
  return <HomePage initialData={data} />;
} 