import { useAuth } from '../context/AuthContext';
import { adminApi } from '../services/adminApi';

/**
 * Custom hook that provides API methods with the authenticated user's db_name and twilio_number
 * Note: All methods will throw an error if db_name is not available (user not authenticated)
 */
export const useAdminApi = () => {
  const { user } = useAuth();
  const dbName = user?.db_name;
  const twilioNumber = user?.twilio_number;

  // Helper to ensure dbName is available
  const ensureDbName = (): string => {
    if (!dbName) {
      throw new Error('Database name not available. User may not be authenticated.');
    }
    return dbName;
  };

  // Helper to ensure twilioNumber is available
  const ensureTwilioNumber = (): string => {
    if (!twilioNumber) {
      throw new Error('Twilio number not available. User may not be authenticated.');
    }
    return twilioNumber;
  };

  return {
    // Users
    getUsers: () => adminApi.getUsers(ensureDbName()),
    createUser: (userData: any) => adminApi.createUser(userData, ensureDbName()),
    deleteUser: (phoneNumber: string) => adminApi.deleteUser(phoneNumber, ensureDbName()),

    // Schedules
    getSchedules: () => adminApi.getSchedules(ensureDbName()),
    createSchedule: (scheduleData: any) => adminApi.createSchedule(scheduleData, ensureDbName(), ensureTwilioNumber()),
    editSchedule: (scheduleId: number, scheduleData: any) => adminApi.editSchedule(scheduleId, scheduleData, ensureDbName()),
    deleteSchedule: (scheduleId: number) => adminApi.deleteSchedule(scheduleId, ensureDbName()),

    // CSV Upload
    uploadCSV: (file: File, primaryKey: string | null) => adminApi.uploadCSV(file, primaryKey, ensureDbName()),

    // Integrations
    getIntegrations: () => adminApi.getIntegrations(ensureDbName()),
    connectIntegration: (provider: string) => adminApi.connectIntegration(provider, ensureDbName()),
    disconnectIntegration: (provider: string) => adminApi.disconnectIntegration(provider, ensureDbName()),
    testIntegration: (provider: string) => adminApi.testIntegration(provider, ensureDbName()),
    saveToastApiKey: (apiKey: string, restaurantGuid: string | null) => adminApi.saveToastApiKey(apiKey, restaurantGuid, ensureDbName()),
  };
};

