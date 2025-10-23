'use client';

import { useEffect } from 'react';

interface AdSenseBannerProps {
  adSlot?: string;
  adFormat?: string;
  fullWidthResponsive?: boolean;
  style?: React.CSSProperties;
}

export function AdSenseBanner({
  adSlot = '',
  adFormat = 'auto',
  fullWidthResponsive = true,
  style = { display: 'block' }
}: AdSenseBannerProps) {
  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, []);

  return (
    <div className="w-full flex justify-center py-4 bg-muted/30 border-t">
      <ins
        className="adsbygoogle"
        style={style}
        data-ad-client="ca-pub-2279178254221933"
        data-ad-slot={adSlot || undefined}
        data-ad-format={adFormat}
        data-full-width-responsive={fullWidthResponsive.toString()}
      />
    </div>
  );
}
