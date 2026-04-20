'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icons } from './icons';
import { ThemeToggle } from './theme-toggle';

type IconComponent = (typeof Icons)[keyof typeof Icons];

type NavItem = {
  href: string;
  label: string;
  icon: IconComponent;
  count?: number;
  kbd: string;
};

type Props = {
  counts: {
    factories: number;
    samples: number;
    whatsappUnread: number;
    invoicesOpen: number;
  };
  pinnedFactories: Array<{ id: string; short: string | null; swatch: string | null }>;
  user: { name: string; email: string; role: string } | null;
};

export function Sidebar({ counts, pinnedFactories, user }: Props) {
  const pathname = usePathname();

  const items: NavItem[] = [
    { href: '/dashboard', label: 'Dashboard', icon: Icons.dashboard, kbd: '1' },
    { href: '/factories', label: 'Factories', icon: Icons.factory, count: counts.factories, kbd: '2' },
    { href: '/samples', label: 'Samples', icon: Icons.sample, count: counts.samples, kbd: '3' },
    { href: '/whatsapp', label: 'WhatsApp', icon: Icons.whatsapp, count: counts.whatsappUnread, kbd: '4' },
    { href: '/invoices', label: 'Invoices', icon: Icons.doc, count: counts.invoicesOpen, kbd: '5' },
    { href: '/timeline', label: 'Timeline', icon: Icons.calendar, kbd: '6' },
    { href: '/costs', label: 'Cost & margin', icon: Icons.money, kbd: '7' },
    { href: '/settings', label: 'Integrations', icon: Icons.zap, kbd: '8' },
  ];

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="mark">HT</div>
        <div className="name">Hair Track</div>
        <div className="ws">Halo Launch</div>
      </div>

      <div className="group">
        <div className="group-label">Workspace</div>
        {items.map((it) => {
          const Ico = it.icon;
          const active = pathname === it.href || pathname.startsWith(it.href + '/');
          return (
            <Link
              key={it.href}
              href={it.href}
              className={'nav-item' + (active ? ' active' : '')}
            >
              <Ico />
              <span>{it.label}</span>
              {it.count != null && it.count > 0 ? (
                <span className="count">{it.count}</span>
              ) : (
                <span className="kbd">{it.kbd}</span>
              )}
            </Link>
          );
        })}
      </div>

      {pinnedFactories.length > 0 && (
        <div className="group">
          <div className="group-label">Pinned factories</div>
          {pinnedFactories.map((f) => (
            <Link key={f.id} href={`/factories?id=${f.id}`} className="nav-item">
              <span
                className="ico"
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: 3,
                  background: f.swatch ?? 'var(--bg-3)',
                  border: '1px solid var(--line-2)',
                }}
              />
              <span style={{ fontSize: 12 }}>{f.short ?? f.id}</span>
            </Link>
          ))}
        </div>
      )}

      <div className="footer">
        <div className="avatar">
          {(user?.name ?? 'HT').slice(0, 2).toUpperCase()}
        </div>
        <div className="who" style={{ flex: 1, minWidth: 0 }}>
          <div
            className="name"
            style={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {user?.name ?? 'Signed out'}
          </div>
          <div className="role">{user?.role ?? 'not signed in'}</div>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <ThemeToggle />
          {user && (
            <form action="/auth/signout" method="post">
              <button
                type="submit"
                className="btn ghost sm"
                title="Sign out"
                style={{
                  padding: '0 6px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                }}
              >
                out
              </button>
            </form>
          )}
        </div>
      </div>
    </aside>
  );
}
