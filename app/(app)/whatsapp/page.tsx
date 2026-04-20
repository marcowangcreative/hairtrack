import Link from 'next/link';
import { Toolbar } from '@/components/toolbar';
import { Icons } from '@/components/icons';
import { WaThreadList } from '@/components/wa-thread-list';
import { WaComposer } from '@/components/wa-composer';
import { StagePill } from '@/components/pills';
import { getWhatsAppViewData } from '@/lib/fetchers';
import type { WaMessage } from '@/lib/types/db';

function timeOf(iso: string): string {
  return new Date(iso).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function dayLabelOf(iso: string): string {
  const d = new Date(iso);
  const now = new Date();
  const sameDay = d.toDateString() === now.toDateString();
  if (sameDay) return 'Today';
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    year:
      d.getFullYear() === now.getFullYear() ? undefined : 'numeric',
  });
}

function groupMessagesByDay(messages: WaMessage[]) {
  const groups: Array<{ day: string; items: WaMessage[] }> = [];
  let currentKey = '';
  for (const m of messages) {
    const key = new Date(m.sent_at).toDateString();
    if (key !== currentKey) {
      currentKey = key;
      groups.push({ day: dayLabelOf(m.sent_at), items: [] });
    }
    groups[groups.length - 1].items.push(m);
  }
  return groups;
}

export default async function WhatsAppPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string; factory?: string }>;
}) {
  const params = await searchParams;
  const data = await getWhatsAppViewData(params.id);

  const telnyxConfigured = Boolean(
    process.env.TELNYX_API_KEY && process.env.TELNYX_WHATSAPP_NUMBER
  );

  return (
    <>
      <Toolbar
        crumbs={['Workspace', 'WhatsApp']}
        right={
          <>
            <span
              className={`pill ${telnyxConfigured ? 'ok' : 'dim'}`}
              title={
                telnyxConfigured
                  ? 'Telnyx API key + number detected'
                  : 'Set TELNYX_API_KEY and TELNYX_WHATSAPP_NUMBER in .env.local'
              }
            >
              <span className="dot" />
              {telnyxConfigured
                ? `Connected · ${process.env.TELNYX_WHATSAPP_NUMBER}`
                : 'Not connected'}
            </span>
            <button className="btn" disabled>
              <Icons.filter /> Filter
            </button>
            <button className="btn" disabled>
              <Icons.plus /> New chat
            </button>
          </>
        }
      />

      {!data.configured ? (
        <div className="canvas">
          <div className="empty-state">
            Supabase isn&apos;t configured — set{' '}
            <code>NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
            <code>SUPABASE_SERVICE_ROLE_KEY</code> in <code>.env.local</code>.
          </div>
        </div>
      ) : data.threads.length === 0 ? (
        <div className="canvas">
          <div className="empty-state">
            No WhatsApp threads yet. Once Telnyx webhooks are wired, incoming
            messages will appear here.
          </div>
        </div>
      ) : (
        <div className="canvas" style={{ padding: 0, overflow: 'hidden' }}>
          <div className="wa-layout">
            <WaThreadList
              threads={data.threads}
              selectedId={data.selected?.id ?? null}
            />

            {data.selected ? (
              <ChatPane
                selected={data.selected}
                telnyxConfigured={telnyxConfigured}
              />
            ) : (
              <div
                className="wa-chat"
                style={{
                  display: 'grid',
                  placeItems: 'center',
                  color: 'var(--fg-3)',
                }}
              >
                Select a thread.
              </div>
            )}

            {data.selected && <ContextPane selected={data.selected} />}
          </div>
        </div>
      )}
    </>
  );
}

function ChatPane({
  selected,
  telnyxConfigured,
}: {
  selected: NonNullable<
    Awaited<ReturnType<typeof getWhatsAppViewData>>['selected']
  >;
  telnyxConfigured: boolean;
}) {
  const label = selected.name ?? selected.factory?.name ?? selected.wa_phone;
  const initial = (label ?? '?').trim().charAt(0).toUpperCase();
  const groups = groupMessagesByDay(selected.messages);

  return (
    <div className="wa-chat">
      <div className="head">
        <div
          className="avatar"
          style={{
            width: 30,
            height: 30,
            background: selected.factory?.swatch ?? undefined,
          }}
        >
          {initial}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 500 }}>{label}</div>
          <div
            className="mono"
            style={{ fontSize: 10, color: 'var(--fg-3)' }}
          >
            {selected.wa_phone}
            {selected.last_message_at && ' · '}
            {selected.last_message_at
              ? `last ${new Date(selected.last_message_at).toLocaleString([], {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}`
              : ''}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 4 }}>
          <button className="btn ghost sm" disabled>
            <Icons.phone />
          </button>
          <button className="btn ghost sm" disabled>
            <Icons.paperclip />
          </button>
          <button className="btn ghost sm" disabled>
            <Icons.more />
          </button>
        </div>
      </div>

      <div className="messages">
        {selected.messages.length === 0 && (
          <div
            className="muted"
            style={{ textAlign: 'center', padding: 20, fontSize: 12 }}
          >
            No messages yet.
          </div>
        )}
        {groups.map((g) => (
          <div
            key={g.day}
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}
          >
            <div className="wa-day">— {g.day} —</div>
            {g.items.map((m) => {
              const mine = m.direction === 'outbound';
              const isImg = m.media_type === 'image';
              return (
                <div
                  key={m.id}
                  className={
                    'wa-msg ' + (mine ? 'me' : 'them') + (isImg ? ' img' : '')
                  }
                >
                  {isImg ? (
                    <>
                      <div className="placeholder">sample photo</div>
                      {m.body && <div className="cap">{m.body}</div>}
                    </>
                  ) : (
                    m.body
                  )}
                  <span className="ts">
                    {timeOf(m.sent_at)}
                    {mine &&
                      (m.status === 'read'
                        ? ' ✓✓'
                        : m.status === 'delivered'
                        ? ' ✓✓'
                        : m.status === 'sent'
                        ? ' ✓'
                        : '')}
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      <WaComposer
        threadId={selected.id}
        to={selected.wa_phone}
        canSend={telnyxConfigured}
      />
    </div>
  );
}

const QUICK_REPLIES = [
  'Confirmed, proceed.',
  'Please send tracking.',
  'Revised swatch attached.',
  'Request updated proforma.',
];

function ContextPane({
  selected,
}: {
  selected: NonNullable<
    Awaited<ReturnType<typeof getWhatsAppViewData>>['selected']
  >;
}) {
  const fac = selected.factory;

  return (
    <div className="wa-context">
      <div className="block">
        <div className="label">Factory</div>
        {fac ? (
          <>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 6,
                  background: fac.swatch ?? 'var(--bg-2)',
                  flexShrink: 0,
                }}
              />
              <div style={{ minWidth: 0 }}>
                <div style={{ fontWeight: 500, fontSize: 13 }}>{fac.name}</div>
                <div
                  className="mono"
                  style={{ fontSize: 10, color: 'var(--fg-3)' }}
                >
                  {fac.id}
                  {fac.city ? ` · ${fac.city}` : ''}
                </div>
              </div>
            </div>
            <div className="kv" style={{ marginTop: 10 }}>
              <div className="k">Contact</div>
              <div className="v">{fac.contact_name ?? '—'}</div>
              <div className="k">MOQ</div>
              <div className="v mono">{fac.moq ?? '—'}</div>
              <div className="k">Lead</div>
              <div className="v mono">
                {fac.lead_time_days ? `${fac.lead_time_days}d` : '—'}
              </div>
              <div className="k">Terms</div>
              <div className="v mono" style={{ fontSize: 10 }}>
                {fac.payment_terms ?? '—'}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 4, marginTop: 10 }}>
              {fac.alibaba_url && (
                <a
                  href={fac.alibaba_url}
                  target="_blank"
                  rel="noreferrer"
                  className="btn sm"
                  style={{ flex: 1, justifyContent: 'center' }}
                >
                  <Icons.link /> Alibaba
                </a>
              )}
              <Link
                href={`/factories?id=${fac.id}`}
                className="btn sm"
                style={{ flex: 1, justifyContent: 'center' }}
              >
                Open profile
              </Link>
            </div>
          </>
        ) : (
          <div
            className="muted"
            style={{ fontSize: 11.5 }}
          >
            Unlinked — no factory assigned to this number.
          </div>
        )}
      </div>

      {fac && (
        <div className="block">
          <div className="label">Related samples · {selected.samples.length}</div>
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
              marginTop: 6,
            }}
          >
            {selected.samples.length === 0 && (
              <div className="muted" style={{ fontSize: 11.5 }}>
                No samples.
              </div>
            )}
            {selected.samples.slice(0, 4).map((s) => (
              <div
                key={s.id}
                style={{
                  display: 'flex',
                  gap: 8,
                  alignItems: 'center',
                  fontSize: 11.5,
                }}
              >
                <span
                  className="mono"
                  style={{ fontSize: 10, color: 'var(--fg-3)', width: 50 }}
                >
                  {s.id}
                </span>
                <span
                  style={{
                    flex: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    color: 'var(--fg-1)',
                  }}
                >
                  {s.name}
                </span>
                <StagePill stage={s.stage} />
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="block">
        <div className="label">Quick replies</div>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 5,
            marginTop: 6,
          }}
        >
          {QUICK_REPLIES.map((r) => (
            <button
              key={r}
              className="btn sm"
              style={{
                justifyContent: 'flex-start',
                background: 'var(--bg-1)',
              }}
              disabled
              title="Tap to prefill (coming soon)"
            >
              {r}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
