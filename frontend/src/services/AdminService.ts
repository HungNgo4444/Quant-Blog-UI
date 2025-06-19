import instanceApi from "../lib/axios";

export const getAdminStats = async () => {
  try {
    const response = await instanceApi.get('/dashboard/stats');
    return response.data;
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    return [];
  }
};

export const getAdminOverview = async () => {
  try {
    const response = await instanceApi.get('/dashboard/overview');
    return response.data;
  } catch (error) {
    console.error('Error fetching admin overview:', error);
    return [];
  }
};