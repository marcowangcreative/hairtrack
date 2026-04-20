import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';
export const runtime = 'edge';

export default function AppleIcon() {
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
          fontSize: 90,
          fontWeight: 700,
          letterSpacing: '-0.04em',
          fontFamily: 'monospace',
          borderRadius: 36,
        }}
      >
        HT
      </div>
    ),
    size
  );
}
