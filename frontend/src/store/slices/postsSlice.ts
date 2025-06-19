import axios from 'axios';
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { PostsState, Post, PostFormData } from '../../types';
import { getBulkSaveStatus, toggleSavePost } from '../../services/PostService';

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const initialState: PostsState = {
  posts: [],
  currentPost: null,
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10,
  },
  saveStatus: {},
  saveLoading: false,
};
// Async thunks
export const fetchPosts = createAsyncThunk(
  'posts/fetchPosts',
  async (params: { page?: number; limit?: number; category?: string; tag?: string; search?: string; userId?: string; sort?: string } = {}, { rejectWithValue }) => {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append('page', params.page.toString());
      if (params.limit) queryParams.append('limit', params.limit.toString());
      if (params.category) queryParams.append('category', params.category);
      if (params.tag) queryParams.append('tag', params.tag);
      if (params.search) queryParams.append('search', params.search);
      if (params.sort) queryParams.append('sort', params.sort);
      if (params.userId) queryParams.append('userId', params.userId);
      const response = await axios.get(`${API_URL}/posts?${queryParams}`);
      
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchPostBySlug = createAsyncThunk(
  'posts/fetchPostBySlug',
  async (slug: string, { rejectWithValue }) => {
    try {
      const response = await axios.get(`${API_URL}/posts/${slug}`);
      
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchBulkSaveStatus = createAsyncThunk(
  'posts/fetchBulkSaveStatus',
  async (slugs: string[], { rejectWithValue, getState }) => {
    try {
      const state = getState() as { posts: PostsState };
      
      const uncachedSlugs = slugs.filter(slug => !(slug in state.posts.saveStatus));
      
      if (uncachedSlugs.length === 0) {
        return state.posts.saveStatus;
      }

      const response = await getBulkSaveStatus(uncachedSlugs);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const togglePostSave = createAsyncThunk(
  'posts/toggleSave',
  async (slug: string, { rejectWithValue }) => {
    try {
      const response = await toggleSavePost(slug);
      return { slug, ...response };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createPost = createAsyncThunk(
  'posts/createPost',
  async (postData: PostFormData, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/posts`, postData);

      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updatePost = createAsyncThunk(
  'posts/updatePost',
  async ({ slug, postData }: { slug: string; postData: Partial<PostFormData> }, { rejectWithValue }) => {
    try {
      const response = await axios.put(`${API_URL}/posts/${slug}`, postData);

      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const deletePost = createAsyncThunk(
  'posts/deletePost',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await axios.delete(`${API_URL}/posts/${id}`);

      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const likePost = createAsyncThunk(
  'posts/likePost',
  async (postId: string, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/posts/${postId}/like`);

      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const incrementViews = createAsyncThunk(
  'posts/incrementViews',
  async (postId: string, { rejectWithValue }) => {
    try {
      const response = await axios.post(`${API_URL}/posts/${postId}/view`);

      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const postsSlice = createSlice({
  name: 'posts',
  initialState,
  reducers: {
    clearCurrentPost: (state) => {
      state.currentPost = null;
    },
    clearError: (state) => {
      state.error = null;
    },
    updatePostInList: (state, action: PayloadAction<Post>) => {
      const index = state.posts.findIndex(post => post.id === action.payload.id);
      if (index !== -1) {
        state.posts[index] = action.payload;
      }
    },
    optimisticToggleSave: (state, action: PayloadAction<{ slug: string; saved: boolean }>) => {
      state.saveStatus[action.payload.slug] = action.payload.saved;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Posts
      .addCase(fetchPosts.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPosts.fulfilled, (state, action) => {
        state.loading = false;
        state.posts = action.payload.posts;
        state.pagination = action.payload.pagination;
        state.error = null;
      })
      .addCase(fetchPosts.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Post by Slug
      .addCase(fetchPostBySlug.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPostBySlug.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPost = action.payload;
        state.error = null;
      })
      .addCase(fetchPostBySlug.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch Bulk Save Status
      .addCase(fetchBulkSaveStatus.pending, (state) => {
        state.saveLoading = true;
      })
      .addCase(fetchBulkSaveStatus.fulfilled, (state, action) => {
        state.saveLoading = false;
        state.saveStatus = { ...state.saveStatus, ...action.payload };
      })
      .addCase(fetchBulkSaveStatus.rejected, (state, action) => {
        state.saveLoading = false;
      })
      // Toggle Save
      .addCase(togglePostSave.pending, (state, action) => {
        // Optimistic update đã được handle trong reducer
      })
      .addCase(togglePostSave.fulfilled, (state, action) => {
        state.saveStatus[action.payload.slug] = action.payload.saved;
      })
      .addCase(togglePostSave.rejected, (state, action) => {
        // Revert optimistic update nếu thất bại
        const slug = action.meta.arg;
        if (slug in state.saveStatus) {
          state.saveStatus[slug] = !state.saveStatus[slug];
        }
      })
      // Create Post
      .addCase(createPost.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPost.fulfilled, (state, action) => {
        state.loading = false;
        state.posts.unshift(action.payload);
        state.error = null;
      })
      .addCase(createPost.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update Post
      .addCase(updatePost.fulfilled, (state, action) => {
        const index = state.posts.findIndex(post => post.id === action.payload.id);
        if (index !== -1) {
          state.posts[index] = action.payload;
        }
        if (state.currentPost?.id === action.payload.id) {
          state.currentPost = action.payload;
        }
      })
      // Delete Post
      .addCase(deletePost.fulfilled, (state, action) => {
        state.posts = state.posts.filter(post => post.id !== action.payload);
        if (state.currentPost?.id === action.payload) {
          state.currentPost = null;
        }
      })
      // Like Post
      .addCase(likePost.fulfilled, (state, action) => {
        const { postId, likes } = action.payload;
        const post = state.posts.find(p => p.id === postId);
        if (post) {
          post.likeCount = likes;
        }
        if (state.currentPost?.id === postId) {
          state.currentPost!.likeCount = likes;
        }
      })
      // Increment Views
      .addCase(incrementViews.fulfilled, (state, action) => {
        const { postId, views } = action.payload;
        const post = state.posts.find(p => p.id === postId);
        if (post) {
          post.viewCount = views;
        }
        if (state.currentPost?.id === postId) {
          state.currentPost!.viewCount = views;
        }
      });
  },
});

export const { clearCurrentPost, clearError, updatePostInList, optimisticToggleSave } = postsSlice.actions;
export default postsSlice.reducer; 