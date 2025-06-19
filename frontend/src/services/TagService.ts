import axios from "axios";
import instanceApi from '../lib/axios';

export const getAllTags = async () => {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/tags`);
    return response.data;
}

export async function getAdminTags(page?: number, limit?: number, search?: string) {
  try {
    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    if (limit) params.append('limit', limit.toString());
    if (search) params.append('search', search);

    const res = await instanceApi.get(`/tags/admin/all?${params}`);
    return res.data || { tags: [], pagination: { currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 10 } };
  } catch (error) {
    console.error('Error fetching admin tags:', error);
    return { tags: [], pagination: { currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 10 } };
  }
}

export async function adminCreateTag(name: string, slug: string, description?: string) {
  try {
    const res = await instanceApi.post('/tags', { name, slug, description });
    return res.data;
  } catch (error: any) {
    console.error('Error creating tag:', error);
    // Throw error with message from backend
    if (error.response?.data?.message) {
      const errorMessage = Array.isArray(error.response.data.message) 
        ? error.response.data.message.join(', ')
        : error.response.data.message;
      throw new Error(errorMessage);
    }
    throw new Error('Tạo thẻ thất bại');
  }
}

export async function adminUpdateTag(id: string, name: string, slug: string, description?: string) {
  try {
    const res = await instanceApi.put(`/tags/${id}`, { name, slug, description });
    return res.data;
  } catch (error: any) {
    console.error('Error updating tag:', error);
    // Throw error with message from backend
    if (error.response?.data?.message) {
      const errorMessage = Array.isArray(error.response.data.message) 
        ? error.response.data.message.join(', ')
        : error.response.data.message;
      throw new Error(errorMessage);
    }
    throw new Error('Cập nhật thẻ thất bại');
  }
}

export async function adminDeleteTag(id: string) {
  try {
    const res = await instanceApi.delete(`/tags/${id}`);
    return res.data;
  } catch (error) {
    console.error('Error deleting tag:', error);
    return null;
  }
}