import { Sidebar } from '@/components/sidebar';
import { KeyboardNav } from '@/components/keyboard-nav';
import { getSidebarCounts, getPinnedFactories } from '@/lib/fetchers';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [counts, pinned] = await Promise.all([
    getSidebarCounts(),
    getPinnedFactories(),
  ]);

  return (
    <div className="app sidebar-layout">
      <Sidebar counts={counts} pinnedFactories={pinned} />
      <main className="main">{children}</main>
      <KeyboardNav />
    </div>
  );
}
