import instanceApi from '../lib/axios';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Client-side function
export async function getPosts() {
    try {
      const res = await instanceApi.get(`/posts?limit=6`);
      
      return res.data.posts || [];
    } catch (error) {
      console.error('Error fetching posts:', error);
      return [];
    }
}
// Server-side function để sử dụng trong Server Components
export async function getPostsServer() {
    try {
      const res = await axios.get(`${API_URL}/posts?limit=6`, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      return res.data.posts || [];
    } catch (error) {
      console.error('Error fetching posts on server:', error);
      return [];
    }
}
