import { useAuth } from '../context/AuthContext';

/**
 * Hook to get the authenticated user's database name
 * This should be used for all API calls in the admin console
 */
export const useDbName = (): string | null => {
  const { user } = useAuth();
  return user?.db_name || null;
};

