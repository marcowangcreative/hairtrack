'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icons } from '@/components/icons';

export function WaComposer({
  threadId,
  to,
  canSend,
}: {
  threadId: string;
  to: string;
  canSend: boolean;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function send() {
    const text = draft.trim();
    if (!text || busy) return;
    setBusy(true);
    setErr(null);
    try {
      const res = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ thread_id: threadId, to, text }),
      });
      if (!res.ok) {
        const j = await res.json().catch(() => ({}));
        setErr(typeof j.error === 'string' ? j.error : 'send failed');
        return;
      }
      setDraft('');
      router.refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : 'send failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {err && (
        <div
          style={{
            padding: '6px 14px',
            fontSize: 11,
            color: 'var(--danger)',
            background: 'var(--danger-dim)',
            borderTop: '1px solid var(--line)',
          }}
        >
          {err}
        </div>
      )}
      <div className="wa-compose">
        <button className="btn ghost sm" disabled title="Attach (coming soon)">
          <Icons.paperclip />
        </button>
        <input
          placeholder={
            canSend
              ? 'Message on WhatsApp…'
              : 'Sign in + configure Telnyx to send'
          }
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey && canSend) {
              e.preventDefault();
              void send();
            }
          }}
          disabled={!canSend || busy}
        />
        <button className="btn" disabled title="AI drafts coming soon">
          <Icons.sparkle /> Draft reply
        </button>
        <button
          className="btn primary"
          onClick={send}
          disabled={!canSend || busy || !draft.trim()}
        >
          <Icons.send />
        </button>
      </div>
    </div>
  );
}
