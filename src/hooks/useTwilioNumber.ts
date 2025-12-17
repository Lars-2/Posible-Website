import { useAuth } from '../context/AuthContext';

/**
 * Hook to get the authenticated user's Twilio number
 * This should be used for all API calls in the admin console that require a twilio_number
 */
export const useTwilioNumber = (): string | null => {
  const { user } = useAuth();
  return user?.twilio_number || null;
};

