'use client';

import 'leaflet/dist/leaflet.css';

import L from 'leaflet';
import Link from 'next/link';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  MapContainer,
  Marker,
  Popup,
  TileLayer,
  useMap,
} from 'react-leaflet';

import type { FactoryListItem } from '@/lib/fetchers';
import { lookupCoords } from '@/lib/geo';

type Pin = {
  id: string;
  name: string;
  short: string;
  city: string | null;
  country: string | null;
  swatch: string | null;
  lat: number;
  lng: number;
  lifetimeSpend: number;
  unread: number;
};

type LayerKey = 'streets' | 'satellite';

const LAYERS: Record<
  LayerKey,
  { url: string; attribution: string; maxZoom: number }
> = {
  streets: {
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    maxZoom: 19,
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution:
      'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community',
    maxZoom: 19,
  },
};

function makePinIcon(p: Pin) {
  const color = p.swatch ?? '#7c5cff';
  const ring = p.unread > 0 ? '#e5484d' : 'rgba(255,255,255,0.95)';
  return L.divIcon({
    className: 'ht-pin',
    html: `
      <span class="ht-pin-dot" style="background:${color};box-shadow:0 0 0 2px ${ring},0 2px 6px rgba(0,0,0,0.3)"></span>
      ${p.unread > 0 ? `<span class="ht-pin-badge">${p.unread}</span>` : ''}
    `,
    iconSize: [18, 18],
    iconAnchor: [9, 9],
  });
}

function FlyController({
  target,
}: {
  target: { lat: number; lng: number; zoom: number; key: number } | null;
}) {
  const map = useMap();
  useEffect(() => {
    if (!target) return;
    map.flyTo([target.lat, target.lng], target.zoom, { duration: 0.8 });
  }, [target, map]);
  return null;
}

export default function FactoryMapLeaflet({
  factories,
}: {
  factories: FactoryListItem[];
}) {
  const { pins, unmapped } = useMemo(() => {
    const pins: Pin[] = [];
    const unmapped: FactoryListItem[] = [];
    for (const f of factories) {
      const c = lookupCoords(f.city, f.country);
      if (!c) {
        unmapped.push(f);
        continue;
      }
      pins.push({
        id: f.id,
        name: f.name,
        short: f.short ?? f.name,
        city: f.city,
        country: f.country,
        swatch: f.swatch,
        lat: c.lat,
        lng: c.lng,
        lifetimeSpend: f.lifetimeSpend,
        unread: f.unread,
      });
    }
    return { pins, unmapped };
  }, [factories]);

  const [layer, setLayer] = useState<LayerKey>('streets');
  const [hovered, setHovered] = useState<string | null>(null);
  const [target, setTarget] = useState<{
    lat: number;
    lng: number;
    zoom: number;
    key: number;
  } | null>(null);
  const flyKeyRef = useRef(0);

  function flyTo(p: Pin) {
    flyKeyRef.current += 1;
    setTarget({ lat: p.lat, lng: p.lng, zoom: 11, key: flyKeyRef.current });
  }

  const layerCfg = LAYERS[layer];

  return (
    <div className="factory-map-wrap">
      <div className="factory-map">
        <MapContainer
          center={[20, 15]}
          zoom={2}
          minZoom={2}
          maxZoom={layerCfg.maxZoom}
          worldCopyJump
          scrollWheelZoom
          style={{ width: '100%', height: '100%' }}
        >
          <TileLayer
            key={layer}
            url={layerCfg.url}
            attribution={layerCfg.attribution}
            maxZoom={layerCfg.maxZoom}
          />

          {pins.map((p) => (
            <Marker
              key={p.id}
              position={[p.lat, p.lng]}
              icon={makePinIcon(p)}
              eventHandlers={{
                mouseover: () => setHovered(p.id),
                mouseout: () => setHovered(null),
              }}
            >
              <Popup>
                <div className="ht-pop">
                  <div className="ht-pop-row">
                    <span
                      className="ht-pop-sw"
                      style={{ background: p.swatch ?? '#7c5cff' }}
                    />
                    <strong>{p.name}</strong>
                  </div>
                  <div className="ht-pop-meta">
                    {p.city ?? '—'}
                    {p.country ? `, ${p.country}` : ''}
                  </div>
                  {p.lifetimeSpend > 0 && (
                    <div className="ht-pop-meta">
                      ${(p.lifetimeSpend / 1000).toFixed(1)}k lifetime
                    </div>
                  )}
                  <Link
                    href={`/factories?id=${encodeURIComponent(p.id)}&view=list`}
                    className="ht-pop-open"
                  >
                    Open factory →
                  </Link>
                </div>
              </Popup>
            </Marker>
          ))}

          <FlyController target={target} />
        </MapContainer>

        <div className="map-layer-toggle">
          <button
            type="button"
            className={'layer-btn' + (layer === 'streets' ? ' on' : '')}
            onClick={() => setLayer('streets')}
          >
            Streets
          </button>
          <button
            type="button"
            className={'layer-btn' + (layer === 'satellite' ? ' on' : '')}
            onClick={() => setLayer('satellite')}
          >
            Satellite
          </button>
        </div>
      </div>

      <div className="map-legend">
        <div className="legend-title">Factories</div>
        <div className="legend-rows">
          {pins.length === 0 && unmapped.length === 0 && (
            <div className="muted" style={{ fontSize: 12 }}>
              No factories yet.
            </div>
          )}
          {pins.map((p) => (
            <div
              key={p.id}
              className={'legend-row' + (hovered === p.id ? ' active' : '')}
              onMouseEnter={() => setHovered(p.id)}
              onMouseLeave={() => setHovered(null)}
            >
              <button
                type="button"
                className="legend-main"
                onClick={() => flyTo(p)}
                title="Fly to"
              >
                <span
                  className="legend-dot"
                  style={{ background: p.swatch ?? 'var(--accent)' }}
                />
                <div style={{ minWidth: 0, flex: 1, textAlign: 'left' }}>
                  <div className="legend-name">{p.name}</div>
                  <div className="legend-meta mono">
                    {p.city ?? '—'}
                    {p.country ? `, ${p.country}` : ''}
                  </div>
                </div>
              </button>
              {p.unread > 0 && (
                <span className="pill accent" style={{ marginRight: 6 }}>
                  <span className="dot" />
                  {p.unread}
                </span>
              )}
              <Link
                href={`/factories?id=${encodeURIComponent(p.id)}&view=list`}
                className="legend-open mono"
                title="Open factory"
              >
                open →
              </Link>
            </div>
          ))}
          {unmapped.length > 0 && (
            <div className="unmapped">
              <div className="legend-title small">Unmapped</div>
              {unmapped.map((f) => (
                <Link
                  key={f.id}
                  href={`/factories?id=${encodeURIComponent(f.id)}&view=list`}
                  className="legend-row dim"
                >
                  <span className="legend-dot" style={{ opacity: 0.4 }} />
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div className="legend-name">{f.name}</div>
                    <div className="legend-meta mono">
                      {f.city ?? f.country ?? 'location unknown'}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
