import axios from "axios";
import instanceApi from "../lib/axios";

export const getAllCategories = async () => {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/categories`);
    return response.data;
}

export const getAllCategoriesWithPostCount = async () => {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/categories/all-with-post-count`);
    return response.data;
}

export async function getAdminCategories(page?: number, limit?: number, search?: string) {
    try {
      const params = new URLSearchParams();
      if (page) params.append('page', page.toString());
      if (limit) params.append('limit', limit.toString());
      if (search) params.append('search', search);
  
      const res = await instanceApi.get(`/categories/admin/all?${params}`);
      return res.data || { categories: [], pagination: { currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 10 } };
    } catch (error) {
      console.error('Error fetching admin categories:', error);
      return { categories: [], pagination: { currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 10 } };
    }
  }

export async function adminCreateCategory(name: string, description: string, slug: string) {
  try {
    const res = await instanceApi.post('/categories', { name, description, slug });
    return res.data;
  } catch (error: any) {
    console.error('Error creating category:', error);
    // Throw error with message from backend
    if (error.response?.data?.message) {
      const errorMessage = Array.isArray(error.response.data.message) 
        ? error.response.data.message.join(', ')
        : error.response.data.message;
      throw new Error(errorMessage);
    }
    throw new Error('Tạo danh mục thất bại');
  }
}

export async function adminUpdateCategory(id: string, name: string, description: string, slug: string) {
  try {
    const res = await instanceApi.put(`/categories/${id}`, { name, description, slug });
    return res.data;
  } catch (error: any) {
    console.error('Error updating category:', error);
    // Throw error with message from backend
    if (error.response?.data?.message) {
      const errorMessage = Array.isArray(error.response.data.message) 
        ? error.response.data.message.join(', ')
        : error.response.data.message;
      throw new Error(errorMessage);
    }
    throw new Error('Cập nhật danh mục thất bại');
  }
}

export async function adminDeleteCategory(id: string) {
  try {
    const res = await instanceApi.delete(`/categories/${id}`);
    return res.data;
  } catch (error) {
    console.error('Error deleting category:', error);
    return null;
  }
}