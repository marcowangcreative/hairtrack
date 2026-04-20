/** Minimal icon set — outline, 14px default, matched stroke widths. Ported from prototype. */
type IconProps = {
  size?: number;
  strokeW?: number;
  viewBox?: string;
  className?: string;
};

function Base({
  size = 14,
  strokeW = 1.5,
  viewBox = '0 0 24 24',
  children,
  className,
}: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      className={className ? `ico ${className}` : 'ico'}
      width={size}
      height={size}
      viewBox={viewBox}
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeW}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

export const Icons = {
  dashboard: (p: IconProps) => (
    <Base {...p}>
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </Base>
  ),
  factory: (p: IconProps) => (
    <Base {...p}>
      <path d="M3 21V10l5 3V10l5 3V7l8 6v8H3z" />
      <rect x="6" y="17" width="2" height="2" />
      <rect x="11" y="17" width="2" height="2" />
      <rect x="16" y="17" width="2" height="2" />
    </Base>
  ),
  sample: (p: IconProps) => (
    <Base {...p}>
      <path d="M12 2v7l-5 9a3 3 0 003 4h4a3 3 0 003-4l-5-9V2" />
      <path d="M9 2h6" />
    </Base>
  ),
  doc: (p: IconProps) => (
    <Base {...p}>
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M8 13h8M8 17h5" />
    </Base>
  ),
  calendar: (p: IconProps) => (
    <Base {...p}>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </Base>
  ),
  money: (p: IconProps) => (
    <Base {...p}>
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
    </Base>
  ),
  search: (p: IconProps) => (
    <Base {...p}>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.35-4.35" />
    </Base>
  ),
  plus: (p: IconProps) => (
    <Base {...p}>
      <path d="M12 5v14M5 12h14" />
    </Base>
  ),
  more: (p: IconProps) => (
    <Base {...p}>
      <circle cx="12" cy="12" r="1" />
      <circle cx="19" cy="12" r="1" />
      <circle cx="5" cy="12" r="1" />
    </Base>
  ),
  zap: (p: IconProps) => (
    <Base {...p}>
      <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z" />
    </Base>
  ),
  bell: (p: IconProps) => (
    <Base {...p}>
      <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0" />
    </Base>
  ),
  sparkle: (p: IconProps) => (
    <Base {...p}>
      <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
    </Base>
  ),
  whatsapp: (p: IconProps) => (
    <Base {...p} strokeW={1.6}>
      <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
      <path
        d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1.2-1.5-2.2-1-1 1c-1-.4-1.8-1.2-2.2-2.2l1-1-1-2.2-1.5 1.2c-.1.2-.1.5 0 .7z"
        strokeWidth={1.4}
      />
    </Base>
  ),
  list: (p: IconProps) => (
    <Base {...p}>
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" />
    </Base>
  ),
  grid: (p: IconProps) => (
    <Base {...p}>
      <path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" />
    </Base>
  ),
  globe: (p: IconProps) => (
    <Base {...p}>
      <circle cx={12} cy={12} r={10} />
      <path d="M2 12h20M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" />
    </Base>
  ),
  filter: (p: IconProps) => (
    <Base {...p}>
      <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z" />
    </Base>
  ),
  link: (p: IconProps) => (
    <Base {...p}>
      <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
    </Base>
  ),
  chat: (p: IconProps) => (
    <Base {...p}>
      <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
    </Base>
  ),
} as const;

export type IconKey = keyof typeof Icons;
