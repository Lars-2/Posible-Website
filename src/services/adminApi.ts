import axios from 'axios';

// Use environment variable or default to production backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.posibleai.com';

// Create a dedicated axios instance for admin API calls with credentials enabled
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // This ensures cookies are sent with every request
  headers: {
    'Content-Type': 'application/json',
  },
});

// Default Twilio number for sending messages
const DEFAULT_TWILIO_NUMBER = '+18442866647';

export const adminApi = {
  // Users
  getUsers: async (dbName: string) => {
    const response = await apiClient.get(`/api/users/${dbName}`);
    return response.data;
  },

  createUser: async (userData: any, dbName: string) => {
    const response = await apiClient.post(`/api/users/${dbName}`, userData);
    return response.data;
  },

  deleteUser: async (phoneNumber: string, dbName: string) => {
    const response = await apiClient.delete(`/api/users/${dbName}/${phoneNumber}`);
    return response.data;
  },

  // Schedules
  getSchedules: async (dbName: string) => {
    const response = await apiClient.get(`/api/schedules/${dbName}`);
    return response.data;
  },

  createSchedule: async (scheduleData: any, dbName: string, twilioNumber: string) => {
    const response = await apiClient.post(`/api/schedules/${dbName}`, {
      ...scheduleData,
      twilio_number: scheduleData.twilio_number || twilioNumber,
    });
    return response.data;
  },

  editSchedule: async (scheduleId: number, scheduleData: any, dbName: string) => {
    const response = await apiClient.put(`/api/schedules/${dbName}/${scheduleId}`, scheduleData);
    return response.data;
  },

  deleteSchedule: async (scheduleId: number, dbName: string) => {
    const response = await apiClient.delete(`/api/schedules/${dbName}/${scheduleId}`);
    return response.data;
  },

  // CSV Upload
  uploadCSV: async (file: File, primaryKey: string | null, dbName: string) => {
    const formData = new FormData();
    formData.append('file', file);
    if (primaryKey) {
      formData.append('primary_key', primaryKey);
    }

    const response = await apiClient.post(`/upload_csv/${dbName}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Integrations
  getIntegrations: async (dbName: string) => {
    const response = await apiClient.get(`/api/integrations/${dbName}`);
    return response.data;
  },

  connectIntegration: async (provider: string, dbName: string) => {
    const response = await apiClient.post(`/api/integrations/${dbName}/${provider}/connect`);
    return response.data;
  },

  disconnectIntegration: async (provider: string, dbName: string) => {
    const response = await apiClient.delete(`/api/integrations/${dbName}/${provider}`);
    return response.data;
  },

  testIntegration: async (provider: string, dbName: string) => {
    const response = await apiClient.get(`/api/integrations/${dbName}/${provider}/test`);
    return response.data;
  },

  saveToastApiKey: async (apiKey: string, restaurantGuid: string | null, dbName: string) => {
    const response = await apiClient.post(`/api/integrations/${dbName}/toast/api-key`, {
      api_key: apiKey,
      restaurant_guid: restaurantGuid,
    });
    return response.data;
  },
};
