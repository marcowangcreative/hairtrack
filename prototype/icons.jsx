// Minimal icon set — outline, 14px default, matched stroke widths
const Ico = ({ d, size = 14, stroke = 1.5, fill = "none", viewBox = "0 0 24 24", style, children }) => (
  <svg className="ico" width={size} height={size} viewBox={viewBox} fill={fill} stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" style={style}>
    {d ? <path d={d} /> : children}
  </svg>
);

const Icons = {
  dashboard: (p) => <Ico {...p}><rect x="3" y="3" width="7" height="9" rx="1"/><rect x="14" y="3" width="7" height="5" rx="1"/><rect x="14" y="12" width="7" height="9" rx="1"/><rect x="3" y="16" width="7" height="5" rx="1"/></Ico>,
  factory: (p) => <Ico {...p}><path d="M3 21V10l5 3V10l5 3V7l8 6v8H3z"/><rect x="6" y="17" width="2" height="2"/><rect x="11" y="17" width="2" height="2"/><rect x="16" y="17" width="2" height="2"/></Ico>,
  sample: (p) => <Ico {...p}><path d="M12 2v7l-5 9a3 3 0 003 4h4a3 3 0 003-4l-5-9V2"/><path d="M9 2h6"/></Ico>,
  chat: (p) => <Ico {...p}><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></Ico>,
  doc: (p) => <Ico {...p}><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><path d="M14 2v6h6"/><path d="M8 13h8M8 17h5"/></Ico>,
  calendar: (p) => <Ico {...p}><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></Ico>,
  money: (p) => <Ico {...p}><path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></Ico>,
  search: (p) => <Ico {...p}><circle cx="11" cy="11" r="7"/><path d="m21 21-4.35-4.35"/></Ico>,
  plus: (p) => <Ico {...p}><path d="M12 5v14M5 12h14"/></Ico>,
  filter: (p) => <Ico {...p}><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/></Ico>,
  more: (p) => <Ico {...p}><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></Ico>,
  upload: (p) => <Ico {...p}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><path d="M17 8l-5-5-5 5M12 3v12"/></Ico>,
  check: (p) => <Ico {...p}><path d="M20 6L9 17l-5-5"/></Ico>,
  x: (p) => <Ico {...p}><path d="M18 6L6 18M6 6l12 12"/></Ico>,
  chev: (p) => <Ico {...p}><path d="m9 18 6-6-6-6"/></Ico>,
  chevDown: (p) => <Ico {...p}><path d="m6 9 6 6 6-6"/></Ico>,
  pin: (p) => <Ico {...p}><path d="M12 17v5M8 3h8l-1 6 3 4H6l3-4z"/></Ico>,
  kanban: (p) => <Ico {...p}><rect x="3" y="3" width="5" height="18" rx="1"/><rect x="10" y="3" width="5" height="12" rx="1"/><rect x="17" y="3" width="4" height="7" rx="1"/></Ico>,
  list: (p) => <Ico {...p}><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></Ico>,
  timeline: (p) => <Ico {...p}><path d="M3 6h10M3 12h14M3 18h7"/><circle cx="16" cy="6" r="2"/><circle cx="20" cy="12" r="2"/><circle cx="13" cy="18" r="2"/></Ico>,
  truck: (p) => <Ico {...p}><path d="M1 3h15v13H1zM16 8h4l3 3v5h-7"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></Ico>,
  phone: (p) => <Ico {...p}><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></Ico>,
  link: (p) => <Ico {...p}><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></Ico>,
  globe: (p) => <Ico {...p}><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></Ico>,
  zap: (p) => <Ico {...p}><path d="M13 2 3 14h9l-1 8 10-12h-9l1-8z"/></Ico>,
  bell: (p) => <Ico {...p}><path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.73 21a2 2 0 01-3.46 0"/></Ico>,
  clock: (p) => <Ico {...p}><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></Ico>,
  tag: (p) => <Ico {...p}><path d="M20.59 13.41L13.42 20.58a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/><path d="M7 7h.01"/></Ico>,
  pkg: (p) => <Ico {...p}><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/><path d="M3.27 6.96 12 12.01l8.73-5.05M12 22.08V12"/></Ico>,
  paperclip: (p) => <Ico {...p}><path d="M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48"/></Ico>,
  send: (p) => <Ico {...p}><path d="m22 2-7 20-4-9-9-4zM22 2 11 13"/></Ico>,
  grid: (p) => <Ico {...p}><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></Ico>,
  whatsapp: (p) => <Ico {...p} viewBox="0 0 24 24" stroke="currentColor" fill="none" strokeWidth="1.6"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/><path d="M9 9.5c0 3 2.5 5.5 5.5 5.5l1.2-1.5-2.2-1-1 1c-1-.4-1.8-1.2-2.2-2.2l1-1-1-2.2-1.5 1.2c-.1.2-.1.5 0 .7z" strokeWidth="1.4"/></Ico>,
  star: (p) => <Ico {...p}><path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></Ico>,
  dot: (p) => <Ico {...p}><circle cx="12" cy="12" r="2" fill="currentColor"/></Ico>,
  sparkle: (p) => <Ico {...p}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/></Ico>,
};

window.Icons = Icons;
