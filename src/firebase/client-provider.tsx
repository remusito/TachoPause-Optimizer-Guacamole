'use client';

import { FirebaseProvider } from '@/firebase';
import { app, auth, db } from '@/firebase/config';
import { useMemo, type ReactNode } from 'react';

export function FirebaseClientProvider({ children }: { children: ReactNode }) {
  const value = useMemo(() => ({
    app,
    auth,
    firestore: db,
  }), []);
  
  return <FirebaseProvider value={value}>{children}</FirebaseProvider>;
}
