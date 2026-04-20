'use client';

import { useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { Icons } from './icons';
import { SideSheet } from './side-sheet';

type Meta = {
  row_counts: Record<string, number>;
  input_tokens: number;
  output_tokens: number;
};

const SUGGESTIONS = [
  'Which factories have samples that are overdue?',
  'What\u2019s my total open invoice amount by factory?',
  'Which samples are stuck in the same stage for more than 14 days?',
  'Summarize every active factory in one line each.',
  'Which POs need payment attention?',
];

export function AskButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        type="button"
        className="btn primary"
        onClick={() => setOpen(true)}
      >
        <Icons.sparkle /> Ask Hair Track
      </button>
      <SideSheet
        open={open}
        title="Ask Hair Track"
        onClose={() => setOpen(false)}
        width={520}
      >
        <AskPanel key={open ? 'open' : 'closed'} />
      </SideSheet>
    </>
  );
}

function AskPanel() {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [meta, setMeta] = useState<Meta | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const taRef = useRef<HTMLTextAreaElement>(null);

  async function submit() {
    if (!question.trim() || busy) return;
    setBusy(true);
    setErr(null);
    setAnswer(null);
    setMeta(null);

    const res = await fetch('/api/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question: question.trim() }),
    });
    const json = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok || !json.ok) {
      setErr(typeof json.error === 'string' ? json.error : 'request failed');
      return;
    }
    setAnswer(json.answer as string);
    setMeta((json.meta as Meta) ?? null);
  }

  function pick(s: string) {
    setQuestion(s);
    taRef.current?.focus();
  }

  function onKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      submit();
    }
  }

  return (
    <div className="form-grid">
      <div className="field">
        <div className="lbl">Your question</div>
        <textarea
          ref={taRef}
          rows={3}
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={onKey}
          placeholder="e.g. Which factories have overdue samples?"
          autoFocus
        />
        <div
          className="mono"
          style={{ fontSize: 10, color: 'var(--fg-3)', marginTop: 4 }}
        >
          cmd/ctrl + enter to submit
        </div>
      </div>

      {!answer && !busy && (
        <div>
          <div
            className="mono"
            style={{
              fontSize: 10,
              color: 'var(--fg-3)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: 6,
            }}
          >
            Try
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {SUGGESTIONS.map((s) => (
              <button
                type="button"
                key={s}
                onClick={() => pick(s)}
                className="suggest"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {err && <div className="form-error">{err}</div>}

      {busy && (
        <div
          className="mono"
          style={{ fontSize: 11, color: 'var(--fg-2)', padding: '8px 0' }}
        >
          Thinking…
        </div>
      )}

      {answer && (
        <div className="ask-answer">
          <ReactMarkdown>{answer}</ReactMarkdown>
        </div>
      )}

      {meta && (
        <div
          className="mono"
          style={{
            fontSize: 10,
            color: 'var(--fg-3)',
            borderTop: '1px solid var(--line)',
            paddingTop: 8,
            display: 'flex',
            gap: 10,
            flexWrap: 'wrap',
          }}
        >
          <span>
            {Object.entries(meta.row_counts)
              .map(([k, v]) => `${v} ${k}`)
              .join(' · ')}
          </span>
          <span>·</span>
          <span>
            {meta.input_tokens} in / {meta.output_tokens} out
          </span>
        </div>
      )}

      <div className="form-actions">
        <div className="spacer" style={{ flex: 1 }} />
        <button
          type="button"
          className="btn primary"
          onClick={submit}
          disabled={busy || !question.trim()}
        >
          <Icons.sparkle /> {busy ? 'Asking…' : 'Ask'}
        </button>
      </div>
    </div>
  );
}
