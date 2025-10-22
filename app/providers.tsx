'use client';

import { ThemeProvider } from '@/components/theme-provider';
import { AchievementsProvider } from '@/hooks/use-achievements-provider';
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { AuthProvider } from '@/firebase/auth/provider';
import { PayPalScriptProvider } from '@paypal/react-paypal-js';
import { TooltipProvider } from '@/components/ui/tooltip';
import { DeveloperModeProvider } from '@/hooks/use-developer-mode';

const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'sb';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
      <DeveloperModeProvider>
        <PayPalScriptProvider options={{ clientId: PAYPAL_CLIENT_ID, currency: 'EUR', intent: 'capture' }}>
          <FirebaseClientProvider>
            <AchievementsProvider>
              <AuthProvider>
                <ThemeProvider
                    attribute="class"
                    defaultTheme="system"
                    enableSystem
                    disableTransitionOnChange
                >
                  <TooltipProvider>
                    {children}
                  </TooltipProvider>
                </ThemeProvider>
              </AuthProvider>
            </AchievementsProvider>
          </FirebaseClientProvider>
        </PayPalScriptProvider>
      </DeveloperModeProvider>
    )
}
