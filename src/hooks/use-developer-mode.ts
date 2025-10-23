'use client';

import { create } from 'zustand';

const DEV_MODE_KEY = 'developer_mode_active';
const DEV_MODE_EXPIRATION_KEY = 'developer_mode_expiration';
const ONE_HOUR = 60 * 60 * 1000; // 1 hour in milliseconds

interface DeveloperModeState {
  isActive: boolean;
  activateDeveloperMode: () => void;
}

const checkDeveloperMode = () => {
  try {
    const isDevMode = localStorage.getItem(DEV_MODE_KEY);
    const expirationTime = localStorage.getItem(DEV_MODE_EXPIRATION_KEY);

    if (isDevMode === 'true' && expirationTime && Date.now() < parseInt(expirationTime, 10)) {
      return true;
    } else {
      localStorage.removeItem(DEV_MODE_KEY);
      localStorage.removeItem(DEV_MODE_EXPIRATION_KEY);
      return false;
    }
  } catch (error) {
    return false;
  }
};

export const useDeveloperMode = create<DeveloperModeState>((set) => ({
  isActive: checkDeveloperMode(),
  activateDeveloperMode: () => {
    const expirationTime = Date.now() + ONE_HOUR;
    try {
      localStorage.setItem(DEV_MODE_KEY, 'true');
      localStorage.setItem(DEV_MODE_EXPIRATION_KEY, expirationTime.toString());
      set({ isActive: true });
      console.log("Developer mode activated for 1 hour.");
    } catch (error) {
      console.warn('localStorage is not available, developer mode will not persist.');
      set({ isActive: true });
    }
  },
}));
