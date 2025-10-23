'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';

const DEV_MODE_KEY = 'developer_mode_expiry';

interface DeveloperModeContextType {
  isDeveloperModeActive: boolean;
  activateDeveloperMode: () => void;
}

const DeveloperModeContext = createContext<DeveloperModeContextType | undefined>(
  undefined
);

export function DeveloperModeProvider({ children }: { children: ReactNode }) {
  const [isDeveloperModeActive, setIsDeveloperModeActive] = useState(false);

  useEffect(() => {
    try {
      const expiry = localStorage.getItem(DEV_MODE_KEY);
      if (expiry && new Date().getTime() < parseInt(expiry, 10)) {
        setIsDeveloperModeActive(true);
      }
    } catch (error) {
      console.error("Could not read from localStorage", error);
    }
  }, []);

  const activateDeveloperMode = useCallback(() => {
    try {
      const expiryTime = new Date().getTime() + 60 * 60 * 1000; // 1 hour from now
      localStorage.setItem(DEV_MODE_KEY, String(expiryTime));
      setIsDeveloperModeActive(true);
      console.log('Developer mode activated for 1 hour.');
    } catch (error) {
      console.error("Could not write to localStorage", error);
    }
  }, []);

  return (
    <DeveloperModeContext.Provider value={{ isDeveloperModeActive, activateDeveloperMode }}>
      {children}
    </DeveloperModeContext.Provider>
  );
}

export function useDeveloperMode() {
  const context = useContext(DeveloperModeContext);
  if (context === undefined) {
    throw new Error('useDeveloperMode must be used within a DeveloperModeProvider');
  }
  return context;
}
