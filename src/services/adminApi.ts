import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'posible.pythonanywhere.com';

// Configure axios to send credentials (cookies) with requests
axios.defaults.withCredentials = true;

// Default db_name - in a real app this would come from authentication
const DEFAULT_DB_NAME = 'test';
const DEFAULT_PHONE_NUMBER = '+18014005585';
const DEFAULT_TWILIO_NUMBER = '+18442866647';

export const adminApi = {
  // Users
  getUsers: async (dbName = DEFAULT_DB_NAME) => {
    const response = await axios.get(`${API_BASE_URL}/api/users/${dbName}`);
    return response.data;
  },

  createUser: async (userData: any, dbName = DEFAULT_DB_NAME) => {
    const response = await axios.post(`${API_BASE_URL}/api/users/${dbName}`, userData);
    return response.data;
  },

  deleteUser: async (phoneNumber: string, dbName = DEFAULT_DB_NAME) => {
    const response = await axios.delete(`${API_BASE_URL}/api/users/${dbName}/${phoneNumber}`);
    return response.data;
  },

  // Schedules
  getSchedules: async (phoneNumber = DEFAULT_PHONE_NUMBER, dbName = DEFAULT_DB_NAME) => {
    const response = await axios.get(`${API_BASE_URL}/api/schedules/${dbName}/${phoneNumber}`);
    return response.data;
  },

  createSchedule: async (scheduleData: any, dbName = DEFAULT_DB_NAME) => {
    const response = await axios.post(`${API_BASE_URL}/api/schedules/${dbName}`, {
      ...scheduleData,
      twilio_number: scheduleData.twilio_number || DEFAULT_TWILIO_NUMBER,
    });
    return response.data;
  },

  editSchedule: async (scheduleId: number, scheduleData: any, dbName = DEFAULT_DB_NAME) => {
    const response = await axios.put(`${API_BASE_URL}/api/schedules/${dbName}/${scheduleId}`, scheduleData);
    return response.data;
  },

  deleteSchedule: async (scheduleId: number, phoneNumber: string, dbName = DEFAULT_DB_NAME) => {
    const response = await axios.delete(`${API_BASE_URL}/api/schedules/${dbName}/${scheduleId}`, {
      data: { to_number: phoneNumber }
    });
    return response.data;
  },

  // Chat
  sendMessage: async (query: string, phoneNumber = DEFAULT_PHONE_NUMBER, dbName = DEFAULT_DB_NAME) => {
    const response = await axios.post(`${API_BASE_URL}/api/chat/${dbName}`, {
      query,
      from_number: phoneNumber,
      twilio_number: DEFAULT_TWILIO_NUMBER,
    });
    return response.data;
  },

  getConversationHistory: async (phoneNumber = DEFAULT_PHONE_NUMBER, dbName = DEFAULT_DB_NAME) => {
    const response = await axios.get(`${API_BASE_URL}/api/conversation-history/${dbName}/${phoneNumber}`);
    return response.data;
  },

  // CSV Upload
  uploadCSV: async (file: File, primaryKey: string | null, dbName = DEFAULT_DB_NAME) => {
    const formData = new FormData();
    formData.append('file', file);
    if (primaryKey) {
      formData.append('primary_key', primaryKey);
    }

    const response = await axios.post(`${API_BASE_URL}/upload_csv/${dbName}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Integrations
  getIntegrations: async (dbName = DEFAULT_DB_NAME) => {
    const response = await axios.get(`${API_BASE_URL}/api/integrations/${dbName}`);
    return response.data;
  },

  connectIntegration: async (provider: string, dbName = DEFAULT_DB_NAME) => {
    const response = await axios.post(`${API_BASE_URL}/api/integrations/${dbName}/${provider}/connect`);
    return response.data;
  },

  disconnectIntegration: async (provider: string, dbName = DEFAULT_DB_NAME) => {
    const response = await axios.delete(`${API_BASE_URL}/api/integrations/${dbName}/${provider}`);
    return response.data;
  },

  testIntegration: async (provider: string, dbName = DEFAULT_DB_NAME) => {
    const response = await axios.get(`${API_BASE_URL}/api/integrations/${dbName}/${provider}/test`);
    return response.data;
  },

  saveToastApiKey: async (apiKey: string, restaurantGuid: string | null, dbName = DEFAULT_DB_NAME) => {
    const response = await axios.post(`${API_BASE_URL}/api/integrations/${dbName}/toast/api-key`, {
      api_key: apiKey,
      restaurant_guid: restaurantGuid,
    });
    return response.data;
  },
};

export { DEFAULT_DB_NAME, DEFAULT_PHONE_NUMBER, DEFAULT_TWILIO_NUMBER };

