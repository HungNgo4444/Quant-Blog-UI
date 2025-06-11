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

export async function getPostsByUser(page: number, limit: number, category: string, tag: string, search: string) {
  try {
    const res = await instanceApi.get(`/posts/getByUser?page=${page}&limit=${limit}&category=${category}&tag=${tag}&search=${search}`);
    return res.data || [];
  } catch (error) {
    console.error('Error fetching posts by user:', error);
    return [];
  }
}

export async function getSavedPostsByUser(page: number, limit: number, category: string, tag: string, search: string) {
  try {
    const res = await instanceApi.get(`/posts/saved?page=${page}&limit=${limit}&category=${category}&tag=${tag}&search=${search}`);
    return res.data || [];
  } catch (error) {
    console.error('Error fetching saved posts by user:', error);
    return [];
  }
}

export async function toggleSavePost(slug: string) {
  try {
    const res = await instanceApi.post(`/posts/${slug}/save`);
    return res.data;
  } catch (error) {
    console.error('Error toggling save post:', error);
    throw error;
  }
}

export async function getSaveStatus(slug: string) {
  try {
    const res = await instanceApi.get(`/posts/${slug}/save-status`);
    return res.data;
  } catch (error) {
    console.error('Error getting save status:', error);
    return { saved: false };
  }
}

export async function getBulkSaveStatus(slugs: string[]) {
  try {
    const res = await instanceApi.post(`/posts/bulk/save-status`, { slugs });
    return res.data;
  } catch (error) {
    console.error('Error getting bulk save status:', error);
    return {};
  }
}

export async function getPostBySlug(slug: string) {
  try {
    const res = await axios.get(`${API_URL}/posts/${slug}`);
    return res.data;
  } catch (error) {
    console.error('Error getting post by slug:', error);
    return null;
  }
}

export async function trackViewPost(slug: string) {
  try {
    const res = await axios.post(`${API_URL}/posts/${slug}/view`);
    return res.data;
  } catch (error) {
    console.error('Error tracking view:', error);
  }
}

export async function getLikeStatus(slug: string) {
  try {
    const res = await instanceApi.get(`/posts/${slug}/like-status`);
    return res.data;
  } catch (error) {
    console.error('Error getting like status:', error);
    return { liked: false };
  }
}

export async function toggleLikePost(slug: string) {
  try {
    const res = await instanceApi.post(`/posts/${slug}/like`);
    return res.data;
  } catch (error) {
    console.error('Error toggling like post:', error);
    throw error;
  }
}

export async function createPost(postData: any) {
  try {
    const res = await instanceApi.post(`/posts`, postData);
    return res.data;
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
}

export async function deletePost(slug: string) {
  try {
    const res = await instanceApi.delete(`/posts/${slug}`);
    return res.data;
  } catch (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
}

// Server-side function để sử dụng trong Server Components
export async function getPostsServer() {
    try {
      const res = await axios.get(`${API_URL}/posts/featured?limit=12`, {
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
