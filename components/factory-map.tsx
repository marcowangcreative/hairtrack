'use client';

import { useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import type { FactoryListItem } from '@/lib/fetchers';

// Leaflet touches `window` at import time, so we must only load the
// actual map implementation on the client. We combine `next/dynamic`
// with `ssr: false` AND a mount guard to be bulletproof across
// Turbopack/Webpack.
const FactoryMapLeaflet = dynamic(() => import('./factory-map-leaflet'), {
  ssr: false,
});

function MapSkeleton() {
  return (
    <div className="factory-map-wrap">
      <div
        className="factory-map"
        style={{ display: 'grid', placeItems: 'center' }}
      >
        <div className="muted mono" style={{ fontSize: 12 }}>
          loading map…
        </div>
      </div>
      <div className="map-legend">
        <div className="legend-title">Factories</div>
      </div>
    </div>
  );
}

export function FactoryMap({ factories }: { factories: FactoryListItem[] }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return <MapSkeleton />;
  return <FactoryMapLeaflet factories={factories} />;
}
