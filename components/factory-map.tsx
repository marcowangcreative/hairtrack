'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import {
  ComposableMap,
  Geographies,
  Geography,
  Marker,
  createCoordinates,
  type Coordinates,
} from '@vnedyalk0v/react19-simple-maps';
import type { Topology } from 'topojson-specification';
import type { FactoryListItem } from '@/lib/fetchers';
import { lookupCoords } from '@/lib/geo';

type Pin = {
  id: string;
  name: string;
  short: string;
  city: string | null;
  country: string | null;
  swatch: string | null;
  coords: Coordinates;
  lifetimeSpend: number;
  unread: number;
};

export function FactoryMap({
  factories,
  topology,
}: {
  factories: FactoryListItem[];
  topology: Topology;
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
        coords: createCoordinates(c.lng, c.lat),
        lifetimeSpend: f.lifetimeSpend,
        unread: f.unread,
      });
    }
    return { pins, unmapped };
  }, [factories]);

  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div className="factory-map-wrap">
      <div className="factory-map">
        <ComposableMap
          projection="geoEqualEarth"
          projectionConfig={{ scale: 155 }}
          style={{ width: '100%', height: '100%' }}
        >
          <Geographies geography={topology}>
            {({ geographies }) =>
              geographies.map((geo, i) => (
                <Geography
                  key={String(geo.id ?? i)}
                  geography={geo}
                  style={{
                    default: {
                      fill: 'var(--bg-2)',
                      stroke: 'var(--line)',
                      strokeWidth: 0.4,
                      outline: 'none',
                    },
                    hover: {
                      fill: 'var(--bg-3)',
                      stroke: 'var(--line-2)',
                      strokeWidth: 0.4,
                      outline: 'none',
                    },
                    pressed: {
                      fill: 'var(--bg-3)',
                      outline: 'none',
                    },
                  }}
                />
              ))
            }
          </Geographies>

          {pins.map((p) => (
            <Marker
              key={p.id}
              coordinates={p.coords}
              onMouseEnter={() => setHovered(p.id)}
              onMouseLeave={() => setHovered(null)}
            >
              <Link href={`/factories?id=${encodeURIComponent(p.id)}&view=list`}>
                <g style={{ cursor: 'pointer' }}>
                  <circle
                    r={7}
                    fill={p.swatch ?? 'var(--accent)'}
                    stroke="var(--bg)"
                    strokeWidth={1.5}
                    opacity={hovered && hovered !== p.id ? 0.5 : 1}
                  />
                  {p.unread > 0 && (
                    <circle
                      r={3}
                      cx={5}
                      cy={-5}
                      fill="var(--danger)"
                      stroke="var(--bg)"
                      strokeWidth={1}
                    />
                  )}
                  {hovered === p.id && (
                    <g transform="translate(10, -8)">
                      <rect
                        x={0}
                        y={-14}
                        rx={3}
                        ry={3}
                        width={Math.max(p.name.length * 5.5, 40)}
                        height={20}
                        fill="var(--bg)"
                        stroke="var(--line-2)"
                        strokeWidth={0.6}
                      />
                      <text
                        x={6}
                        y={0}
                        fontSize={9}
                        fontFamily="var(--font-mono)"
                        fill="var(--fg)"
                      >
                        {p.name}
                      </text>
                    </g>
                  )}
                </g>
              </Link>
            </Marker>
          ))}
        </ComposableMap>
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
            <Link
              key={p.id}
              href={`/factories?id=${encodeURIComponent(p.id)}&view=list`}
              className={'legend-row' + (hovered === p.id ? ' active' : '')}
              onMouseEnter={() => setHovered(p.id)}
              onMouseLeave={() => setHovered(null)}
            >
              <span
                className="legend-dot"
                style={{ background: p.swatch ?? 'var(--accent)' }}
              />
              <div style={{ minWidth: 0, flex: 1 }}>
                <div className="legend-name">{p.name}</div>
                <div className="legend-meta mono">
                  {p.city ?? '—'}
                  {p.country ? `, ${p.country}` : ''}
                </div>
              </div>
              {p.unread > 0 && (
                <span className="pill accent" style={{ marginLeft: 'auto' }}>
                  <span className="dot" />
                  {p.unread}
                </span>
              )}
            </Link>
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
