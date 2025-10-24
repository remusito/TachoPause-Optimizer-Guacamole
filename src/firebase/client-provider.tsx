'use client';

import { FirebaseProvider } from '@/firebase';
import { getFirebaseApp, getFirebaseAuth, getFirebaseFirestore } from '@/firebase/config';
import { useMemo, type ReactNode, useState, useEffect } from 'react';

export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const value = useMemo(() => {
    if (!mounted) return null;

    try {
      return {
        app: getFirebaseApp(),
        auth: getFirebaseAuth(),
        firestore: getFirebaseFirestore(),
      };
    } catch (error) {
      console.error('Error inicializando Firebase:', error);
      return null;
    }
  }, [mounted]);

  // No renderizar hasta que esté montado en cliente
  if (!mounted || !value) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return <FirebaseProvider value={value}>{children}</FirebaseProvider>;
}
