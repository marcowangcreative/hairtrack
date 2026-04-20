'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icons } from './icons';
import type { Factory, Invoice, InvoiceLineItem } from '@/lib/types/db';

type Props = {
  invoice: Invoice & { line_items: InvoiceLineItem[] };
  factories: Factory[];
};

export function InvoiceFieldsForm({ invoice, factories }: Props) {
  const router = useRouter();
  const [fields, setFields] = useState({
    factory_id: invoice.factory_id ?? '',
    invoice_number: invoice.invoice_number ?? '',
    invoice_date: invoice.invoice_date ?? '',
    due_date: invoice.due_date ?? '',
    currency: invoice.currency ?? 'USD',
    subtotal: invoice.subtotal ?? '',
    shipping: invoice.shipping ?? '',
    tax: invoice.tax ?? '',
    total: invoice.total ?? '',
    payment_terms: invoice.payment_terms ?? '',
  });
  const [busy, setBusy] = useState<'confirm' | 'delete' | 'reparse' | null>(
    null
  );
  const [err, setErr] = useState<string | null>(null);

  const set =
    (k: keyof typeof fields) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setFields((f) => ({ ...f, [k]: e.target.value }));
    };

  async function confirm() {
    setBusy('confirm');
    setErr(null);
    const payload = {
      factory_id: fields.factory_id || null,
      invoice_number: fields.invoice_number || null,
      invoice_date: fields.invoice_date || null,
      due_date: fields.due_date || null,
      currency: fields.currency || 'USD',
      subtotal: fields.subtotal === '' ? null : Number(fields.subtotal),
      shipping: fields.shipping === '' ? null : Number(fields.shipping),
      tax: fields.tax === '' ? null : Number(fields.tax),
      total: fields.total === '' ? null : Number(fields.total),
      payment_terms: fields.payment_terms || null,
    };
    const res = await fetch(`/api/invoices/${invoice.id}/confirm`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    setBusy(null);
    if (!res.ok || !json.ok) {
      setErr(json.error?.message ?? String(json.error) ?? 'confirm failed');
      return;
    }
    router.refresh();
  }

  async function reparse() {
    setBusy('reparse');
    setErr(null);
    const res = await fetch('/api/invoices/parse', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ invoiceId: invoice.id }),
    });
    const json = await res.json();
    setBusy(null);
    if (!res.ok || !json.ok) {
      setErr(json.error?.message ?? String(json.error) ?? 'reparse failed');
      return;
    }
    router.refresh();
  }

  async function remove() {
    if (!confirmNative('Delete this invoice?')) return;
    setBusy('delete');
    setErr(null);
    const res = await fetch(`/api/invoices/${invoice.id}`, {
      method: 'DELETE',
    });
    const json = await res.json();
    setBusy(null);
    if (!res.ok || !json.ok) {
      setErr(json.error?.message ?? String(json.error) ?? 'delete failed');
      return;
    }
    router.push('/invoices');
    router.refresh();
  }

  const isParsed = invoice.parse_status === 'parsed';
  const isConfirmed = invoice.parse_status === 'confirmed';
  const isFailed = invoice.parse_status === 'failed';

  return (
    <div className="inv-fields">
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          paddingBottom: 10,
          borderBottom: '1px solid var(--line)',
        }}
      >
        <Icons.sparkle />
        <div style={{ fontSize: 12.5, fontWeight: 500 }}>Extracted fields</div>
        <div className="spacer" style={{ flex: 1 }} />
        <span
          className={`pill ${
            isConfirmed
              ? 'ok'
              : isParsed
                ? 'accent'
                : isFailed
                  ? 'danger'
                  : 'dim'
          }`}
        >
          <span className="dot" />
          {invoice.parse_status}
        </span>
      </div>

      <div className="field">
        <div className="lbl">Factory</div>
        <select
          value={fields.factory_id}
          onChange={set('factory_id')}
          disabled={isConfirmed}
        >
          <option value="">— unassigned —</option>
          {factories.map((f) => (
            <option key={f.id} value={f.id}>
              {f.name}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div className="field">
          <div className="lbl">Invoice #</div>
          <input
            value={fields.invoice_number}
            onChange={set('invoice_number')}
            disabled={isConfirmed}
          />
        </div>
        <div className="field">
          <div className="lbl">Currency</div>
          <input
            value={fields.currency}
            onChange={set('currency')}
            maxLength={3}
            disabled={isConfirmed}
          />
        </div>
        <div className="field">
          <div className="lbl">Issue date</div>
          <input
            type="date"
            value={fields.invoice_date}
            onChange={set('invoice_date')}
            disabled={isConfirmed}
          />
        </div>
        <div className="field">
          <div className="lbl">Due date</div>
          <input
            type="date"
            value={fields.due_date}
            onChange={set('due_date')}
            disabled={isConfirmed}
          />
        </div>
        <div className="field">
          <div className="lbl">Subtotal</div>
          <input
            type="number"
            value={fields.subtotal}
            onChange={set('subtotal')}
            disabled={isConfirmed}
          />
        </div>
        <div className="field">
          <div className="lbl">Shipping</div>
          <input
            type="number"
            value={fields.shipping}
            onChange={set('shipping')}
            disabled={isConfirmed}
          />
        </div>
        <div className="field">
          <div className="lbl">Tax</div>
          <input
            type="number"
            value={fields.tax}
            onChange={set('tax')}
            disabled={isConfirmed}
          />
        </div>
        <div className="field">
          <div className="lbl">Total</div>
          <input
            type="number"
            value={fields.total}
            onChange={set('total')}
            disabled={isConfirmed}
          />
        </div>
      </div>

      <div className="field">
        <div className="lbl">Payment terms</div>
        <input
          value={fields.payment_terms}
          onChange={set('payment_terms')}
          disabled={isConfirmed}
        />
      </div>

      {invoice.line_items.length > 0 && (
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
            Line items · {invoice.line_items.length}
          </div>
          <div
            style={{
              border: '1px solid var(--line)',
              borderRadius: 4,
              fontSize: 11,
              fontFamily: 'var(--font-mono)',
            }}
          >
            {invoice.line_items.map((li, i) => (
              <div
                key={li.id}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '60px 1fr 40px 60px 70px',
                  gap: 8,
                  padding: '6px 10px',
                  borderBottom:
                    i === invoice.line_items.length - 1
                      ? 'none'
                      : '1px solid var(--line)',
                }}
              >
                <span style={{ color: 'var(--fg-3)' }}>{li.sku ?? '—'}</span>
                <span
                  style={{
                    color: 'var(--fg)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                  title={li.description ?? ''}
                >
                  {li.description ?? '—'}
                </span>
                <span style={{ color: 'var(--fg-2)', textAlign: 'right' }}>
                  {li.qty ?? '—'}
                </span>
                <span style={{ color: 'var(--fg-2)', textAlign: 'right' }}>
                  {li.unit_price != null ? `$${li.unit_price}` : '—'}
                </span>
                <span style={{ color: 'var(--fg)', textAlign: 'right' }}>
                  {li.total != null ? `$${li.total}` : '—'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {err && (
        <div
          style={{
            padding: '8px 10px',
            background: 'var(--danger-dim)',
            color: 'var(--danger)',
            fontSize: 11.5,
            borderRadius: 4,
            border:
              '1px solid color-mix(in oklch, var(--danger) 40%, transparent)',
          }}
        >
          {err}
        </div>
      )}

      <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
        {isFailed && (
          <button
            className="btn"
            onClick={reparse}
            disabled={busy !== null}
            style={{ flex: 1 }}
          >
            <Icons.sparkle /> {busy === 'reparse' ? 'Parsing…' : 'Retry parse'}
          </button>
        )}
        <button
          className="btn"
          onClick={remove}
          disabled={busy !== null}
          style={{ flex: 1 }}
        >
          <Icons.x /> {busy === 'delete' ? 'Deleting…' : 'Delete'}
        </button>
        {!isConfirmed && (
          <button
            className="btn primary"
            onClick={confirm}
            disabled={busy !== null}
            style={{ flex: 2 }}
          >
            <Icons.check />{' '}
            {busy === 'confirm' ? 'Saving…' : 'Confirm & save'}
          </button>
        )}
      </div>
    </div>
  );
}

function confirmNative(msg: string): boolean {
  if (typeof window === 'undefined') return false;
  return window.confirm(msg);
}
