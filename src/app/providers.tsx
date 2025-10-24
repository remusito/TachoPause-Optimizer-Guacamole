'use client';

import { ReactNode } from 'react';
import { AuthProvider } from '@/firebase/auth/provider';
import { ThemeProvider } from 'next-themes';
import { Toaster } from "@/components/ui/toaster"
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import { TooltipProvider } from '@/components/ui/tooltip';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { AchievementsProvider } from '@/hooks/use-achievements-provider';

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'sb';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <FirebaseClientProvider>
        <AchievementsProvider>
          <AuthProvider>
            <PayPalScriptProvider options={{ 'clientId': PAYPAL_CLIENT_ID, currency: 'EUR', intent: 'capture' }}>
              <TooltipProvider>
                {children}
                <Toaster />
              </TooltipProvider>
            </PayPalScriptProvider>
          </AuthProvider>
        </AchievementsProvider>
      </FirebaseClientProvider>
    </ThemeProvider>
  );
}
