'use client';

import { AdSenseBanner } from './adsense-banner';
import { usePremium } from '@/hooks/use-premium';

export function FooterWithAd() {
  const { isPremium } = usePremium();

  // No mostrar anuncios a usuarios premium
  if (isPremium) {
    return (
      <footer className="w-full mt-auto border-t">
        <div className="text-center text-xs text-muted-foreground py-4">
          TachoPause Optimizer © 2025 - Versión Premium
        </div>
      </footer>
    );
  }

  return (
    <footer className="w-full mt-auto">
      <AdSenseBanner />
      <div className="text-center text-xs text-muted-foreground py-2 bg-muted/30">
        TachoPause Optimizer © 2025
      </div>
    </footer>
  );
}
