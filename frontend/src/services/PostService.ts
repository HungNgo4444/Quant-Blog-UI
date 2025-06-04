import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export async function getPosts() {
    try {
      const res = await axios.get(`${API_URL}/posts?limit=6`);
      
      return res.data.posts || [];
    } catch (error) {
      console.error('Error fetching posts:', error);
      return [];
    }
  }