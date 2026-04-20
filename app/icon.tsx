import { ImageResponse } from 'next/og';

export const size = { width: 512, height: 512 };
export const contentType = 'image/png';
export const runtime = 'edge';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          background: '#1a1a17',
          color: '#f6f4ee',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 240,
          fontWeight: 700,
          letterSpacing: '-0.04em',
          fontFamily: 'monospace',
        }}
      >
        HT
      </div>
    ),
    size
  );
}
