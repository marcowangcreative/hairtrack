'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const MAP: Record<string, string> = {
  '1': '/dashboard',
  '2': '/factories',
  '3': '/samples',
  '4': '/whatsapp',
  '5': '/invoices',
  '6': '/timeline',
  '7': '/costs',
  '8': '/settings',
};

export function KeyboardNav() {
  const router = useRouter();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (!t) return;
      if (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable) return;
      const href = MAP[e.key];
      if (href) router.push(href);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [router]);
  return null;
}
