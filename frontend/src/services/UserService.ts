import instanceApi from '../lib/axios';

export async function getAdminUsers(page?: number, limit?: number, search?: string, active?: string, role?: string) {
  try {
    const params = new URLSearchParams();
    if (page) params.append('page', page.toString());
    if (limit) params.append('limit', limit.toString());
    if (search) params.append('search', search);
    if (active) params.append('active', active);
    if (role) params.append('role', role);
    const res = await instanceApi.get(`/users/admin/all?${params}`);
    return res.data || { users: [], pagination: { currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 10 } };
  } catch (error) {
    console.error('Error fetching admin users:', error);
    return { users: [], pagination: { currentPage: 1, totalPages: 1, totalItems: 0, itemsPerPage: 10 } };
  }
}

export async function adminDeleteUser(id: string) {
  try {
    const res = await instanceApi.delete(`/users/admin/delete/${id}`);
    return res.data;
  } catch (error) {
    console.error('Error deleting user:', error);
    return null;
  }
}

export async function adminRestoreUser(id: string) {
  try {
    const res = await instanceApi.put(`/users/admin/restore/${id}`);
    return res.data;
  } catch (error) {
    console.error('Error restoring user:', error);
    return null;
  }
}

export async function updateProfile(updateUserDto: any) {
  try {
    const res = await instanceApi.put(`/users/update-profile`, updateUserDto);
    return res.data;
  } catch (error) {
    console.error('Error updating profile:', error);
    return null;
  }
}
