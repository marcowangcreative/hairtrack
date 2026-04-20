'use client';

import { useEffect } from 'react';
import { Icons } from './icons';

type Props = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  width?: number;
};

export function SideSheet({ open, title, onClose, children, width = 460 }: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  return (
    <>
      <div
        className={`sheet-backdrop${open ? ' open' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside
        className={`sheet${open ? ' open' : ''}`}
        style={{ width }}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <header className="sheet-head">
          <div className="sheet-title">{title}</div>
          <button
            type="button"
            className="btn ghost sm"
            onClick={onClose}
            aria-label="Close"
            title="Close (Esc)"
          >
            <Icons.x />
          </button>
        </header>
        <div className="sheet-body">{children}</div>
      </aside>
    </>
  );
}
