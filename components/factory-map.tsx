'use client';

import dynamic from 'next/dynamic';
import type { FactoryListItem } from '@/lib/fetchers';

// Leaflet touches `window` at import time, so the actual map
// implementation must be loaded only on the client.
const FactoryMapLeaflet = dynamic(() => import('./factory-map-leaflet'), {
  ssr: false,
  loading: () => (
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
  ),
});

export function FactoryMap({ factories }: { factories: FactoryListItem[] }) {
  return <FactoryMapLeaflet factories={factories} />;
}
