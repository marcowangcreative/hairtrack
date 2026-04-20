'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export function LoginForm({ next }: { next: string }) {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || busy) return;
    setBusy(true);
    setErr(null);

    const supabase = createClient();
    const origin =
      typeof window !== 'undefined' ? window.location.origin : '';
    const redirectTo = `${origin}/auth/callback?next=${encodeURIComponent(
      next
    )}`;

    const { error } = await supabase.auth.signInWithOtp({
      email: email.trim(),
      options: { emailRedirectTo: redirectTo },
    });

    if (error) {
      setErr(error.message);
      setBusy(false);
      return;
    }
    router.push(`/login?sent=1&next=${encodeURIComponent(next)}`);
  }

  return (
    <form
      onSubmit={submit}
      style={{ display: 'flex', flexDirection: 'column', gap: 10 }}
    >
      <label
        className="mono"
        style={{
          fontSize: 10,
          color: 'var(--fg-3)',
          textTransform: 'uppercase',
          letterSpacing: '0.06em',
        }}
      >
        Email
      </label>
      <input
        type="email"
        required
        placeholder="you@studio.com"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        autoFocus
        style={{
          padding: '8px 10px',
          fontSize: 13,
          background: 'var(--bg)',
          border: '1px solid var(--line)',
          borderRadius: 4,
          color: 'var(--fg)',
          outline: 'none',
        }}
      />
      <button
        type="submit"
        className="btn primary"
        disabled={busy || !email.trim()}
        style={{ marginTop: 4, height: 32, justifyContent: 'center' }}
      >
        {busy ? 'Sending…' : 'Send magic link'}
      </button>
      {err && (
        <div
          style={{
            fontSize: 11.5,
            color: 'var(--danger)',
            marginTop: 4,
          }}
        >
          {err}
        </div>
      )}
    </form>
  );
}
