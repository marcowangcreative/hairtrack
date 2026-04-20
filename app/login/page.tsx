import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { LoginForm } from './login-form';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; sent?: string; error?: string }>;
}) {
  const params = await searchParams;
  const hasSupabase = Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  if (hasSupabase) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) redirect(params.next || '/dashboard');
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        background: 'var(--bg)',
        padding: 24,
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 380,
          border: '1px solid var(--line)',
          borderRadius: 8,
          padding: 28,
          background: 'var(--bg-1)',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 20,
          }}
        >
          <div
            className="mark"
            style={{
              width: 28,
              height: 28,
              borderRadius: 4,
              background: 'var(--fg)',
              color: 'var(--bg)',
              display: 'grid',
              placeItems: 'center',
              fontFamily: 'var(--font-mono)',
              fontWeight: 700,
              fontSize: 13,
            }}
          >
            HT
          </div>
          <div>
            <div style={{ fontWeight: 600, letterSpacing: '-0.01em' }}>
              Hair Track
            </div>
            <div
              className="mono"
              style={{ fontSize: 10, color: 'var(--fg-3)' }}
            >
              Sign in with a magic link
            </div>
          </div>
        </div>

        {!hasSupabase ? (
          <div className="empty-state" style={{ padding: 12, textAlign: 'left' }}>
            Supabase isn&apos;t configured. Set{' '}
            <code>NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
            <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> in{' '}
            <code>.env.local</code>.
          </div>
        ) : params.sent ? (
          <div style={{ fontSize: 13, color: 'var(--fg-1)', lineHeight: 1.5 }}>
            Check your inbox — we sent a magic link. Click it to sign in. You
            can close this tab.
          </div>
        ) : (
          <LoginForm next={params.next ?? '/dashboard'} />
        )}

        {params.error && (
          <div
            style={{
              marginTop: 14,
              padding: '8px 10px',
              background: 'var(--danger-dim)',
              color: 'var(--danger)',
              fontSize: 11.5,
              borderRadius: 4,
              border: '1px solid color-mix(in oklch, var(--danger) 40%, transparent)',
            }}
          >
            {params.error}
          </div>
        )}
      </div>
    </div>
  );
}
