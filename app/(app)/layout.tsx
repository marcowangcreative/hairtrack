import { Sidebar } from '@/components/sidebar';
import { KeyboardNav } from '@/components/keyboard-nav';
import {
  getSidebarCounts,
  getPinnedFactories,
  getCurrentUser,
} from '@/lib/fetchers';

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [counts, pinned, user] = await Promise.all([
    getSidebarCounts(),
    getPinnedFactories(),
    getCurrentUser(),
  ]);

  return (
    <div className="app sidebar-layout">
      <Sidebar counts={counts} pinnedFactories={pinned} user={user} />
      <main className="main">{children}</main>
      <KeyboardNav />
    </div>
  );
}
