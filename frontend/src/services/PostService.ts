import instanceApi from '../lib/axios';
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Client-side function
export async function getPosts(page?: number, limit?: number, category?: string, tag?: string, search?: string, sort?: string, userId?: string) {
    try {
      const res = await instanceApi.get(`/posts?page=${page}&limit=${limit}&category=${category}&tag=${tag}&search=${search}&sort=${sort}&userId=${userId}`);
      
      return res.data || { posts: [], pagination: { currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 10 } };
    } catch (error) {
      console.error('Error fetching posts:', error);
      return { posts: [], pagination: { currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 10 } };
    }
}

export async function getFeaturedPosts(limit: number) {
  try {
    const res = await instanceApi.get(`/posts/featured?limit=${limit}`);
    return res.data.posts || [];
  } catch (error) {
    console.error('Error fetching featured posts:', error);
    return [];
  }
}

export async function getRecentPost(limit: number) {
  try {
    const res = await instanceApi.get(`/posts/recent?limit=${limit}`);
    return res.data.posts || [];
  } catch (error) {
    console.error('Error fetching recent posts:', error);
    return [];
  }
}

export async function getTopPosts(limit: number) {
  try {
    const res = await instanceApi.get(`/posts/top?limit=${limit}&sort=likes`);
    return res.data.posts || [];
  } catch (error) {
    console.error('Error fetching top posts:', error);
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

export async function getSavedPostsByUser(page: number = 1, limit: number = 10, category: string = '', tag: string = '', search: string = '') {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(category && { category }),
      ...(tag && { tag }),
      ...(search && { search })
    });

    const res = await instanceApi.get(`/posts/saved?${params}`);
    return res.data;
  } catch (error) {
    console.error('Error fetching saved posts by user:', error);
    throw error;
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

export async function getPostBySlugIncludingDrafts(slug: string) {

  try {
    const res = await instanceApi.get(`/posts/${slug}/include-draft`);
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

export async function updatePost(slug: string, postData: any) {
  try {
    const res = await instanceApi.put(`/posts/${slug}`, postData);
    return res.data;
  } catch (error) {
    console.error('Error updating post:', error);
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

export async function getUserPostsStats() {
  try {
    const res = await instanceApi.get('/posts/my-stats');
    return res.data;
  } catch (error) {
    console.error('Error fetching user posts stats:', error);
    throw error;
  }
}

export async function getAdminPosts(page?: number, limit?: number, status?: string, search?: string) {
  try {
    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    if (limit) params.append('limit', limit.toString());
    if (status && status !== 'all') params.append('status', status);
    if (search) params.append('search', search);

    const res = await instanceApi.get(`/posts/admin/all?${params}`);
    return res.data || { posts: [], pagination: { currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 10 } };
  } catch (error) {
    console.error('Error fetching admin posts:', error);
    return { posts: [], pagination: { currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 10 } };
  }
}