'use client';

import { useAuth } from '@/firebase/auth/provider';
import { useDeveloperMode } from './use-developer-mode';

/**
 * A hook to easily access the user's premium status.
 * It gets the live premium state from the AuthProvider, which is connected to Firestore,
 * or checks if developer mode is active.
 */
export function usePremium() {
  const { isPremium: isUserPremium } = useAuth();
  const { isDeveloperModeActive } = useDeveloperMode();

  const isPremium = isUserPremium || isDeveloperModeActive;

  return { isPremium };
}
