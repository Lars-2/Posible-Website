import { useAuth } from '../context/AuthContext';
import { adminApi } from '../services/adminApi';

/**
 * Custom hook that provides API methods with the authenticated user's db_name
 */
export const useAdminApi = () => {
  const { user } = useAuth();
  const dbName = user?.db_name;

  return {
    // Users
    getUsers: () => adminApi.getUsers(dbName),
    createUser: (userData: any) => adminApi.createUser(userData, dbName),
    deleteUser: (phoneNumber: string) => adminApi.deleteUser(phoneNumber, dbName),

    // Schedules
    getSchedules: (phoneNumber?: string) => adminApi.getSchedules(phoneNumber, dbName),
    createSchedule: (scheduleData: any) => adminApi.createSchedule(scheduleData, dbName),
    editSchedule: (scheduleId: number, scheduleData: any) => adminApi.editSchedule(scheduleId, scheduleData, dbName),
    deleteSchedule: (scheduleId: number, phoneNumber: string) => adminApi.deleteSchedule(scheduleId, phoneNumber, dbName),

    // Chat
    sendMessage: (query: string, phoneNumber?: string) => adminApi.sendMessage(query, phoneNumber, dbName),
    getConversationHistory: (phoneNumber?: string) => adminApi.getConversationHistory(phoneNumber, dbName),

    // CSV Upload
    uploadCSV: (file: File, primaryKey: string | null) => adminApi.uploadCSV(file, primaryKey, dbName),

    // Integrations
    getIntegrations: () => adminApi.getIntegrations(dbName),
    connectIntegration: (provider: string) => adminApi.connectIntegration(provider, dbName),
    disconnectIntegration: (provider: string) => adminApi.disconnectIntegration(provider, dbName),
    testIntegration: (provider: string) => adminApi.testIntegration(provider, dbName),
    saveToastApiKey: (apiKey: string, restaurantGuid: string | null) => adminApi.saveToastApiKey(apiKey, restaurantGuid, dbName),
  };
};

