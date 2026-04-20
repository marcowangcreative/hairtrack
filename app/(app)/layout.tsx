import { Sidebar } from '@/components/sidebar';
import { KeyboardNav } from '@/components/keyboard-nav';
import { AppShell } from '@/components/app-shell';
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
    <AppShell
      sidebar={<Sidebar counts={counts} pinnedFactories={pinned} user={user} />}
    >
      {children}
      <KeyboardNav />
    </AppShell>
  );
}
