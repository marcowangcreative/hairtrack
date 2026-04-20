'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

export function AppShell({
  sidebar,
  children,
}: {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  // Close drawer on navigation.
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Lock body scroll while drawer is open.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Esc closes the drawer.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <div className={'app sidebar-layout' + (open ? ' nav-open' : '')}>
      <div className="mobile-topbar">
        <button
          type="button"
          className="hamburger"
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
        <div className="mark">HT</div>
        <div className="name">Hair Track</div>
      </div>
      <div className="sidebar-wrap">{sidebar}</div>
      <div
        className="sidebar-backdrop"
        onClick={() => setOpen(false)}
        aria-hidden
      />
      <main className="main">{children}</main>
    </div>
  );
}
