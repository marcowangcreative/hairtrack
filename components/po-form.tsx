'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icons } from './icons';
import type { Factory, Po, PoStatus, Sample } from '@/lib/types/db';

const STATUSES: PoStatus[] = [
  'draft',
  'sent',
  'confirmed',
  'in_production',
  'shipped',
  'received',
  'closed',
];

type Props = {
  po: Po | null;
  factories: Factory[];
  samples: Sample[];
  defaultFactoryId?: string;
  onDone: () => void;
};

export function PoForm({
  po,
  factories,
  samples,
  defaultFactoryId,
  onDone,
}: Props) {
  const router = useRouter();
  const isEdit = !!po;

  const [fields, setFields] = useState({
    factory_id: po?.factory_id ?? defaultFactoryId ?? '',
    sample_id: po?.sample_id ?? '',
    status: (po?.status ?? 'draft') as PoStatus,
    total: po?.total ?? '',
    currency: po?.currency ?? 'USD',
    deposit_paid: po?.deposit_paid ?? false,
    balance_paid: po?.balance_paid ?? false,
    placed_at: po?.placed_at ?? '',
    ship_by: po?.ship_by ?? '',
    notes: po?.notes ?? '',
  });
  const [busy, setBusy] = useState<'save' | 'delete' | null>(null);
  const [err, setErr] = useState<string | null>(null);

  function setField<K extends keyof typeof fields>(
    key: K,
    val: (typeof fields)[K]
  ) {
    setFields((f) => ({ ...f, [key]: val }));
  }

  const samplesForFactory = fields.factory_id
    ? samples.filter((s) => s.factory_id === fields.factory_id)
    : samples;

  async function save() {
    if (!fields.factory_id) {
      setErr('Factory is required');
      return;
    }
    setBusy('save');
    setErr(null);
    const body = {
      ...fields,
      sample_id: fields.sample_id || null,
      total: fields.total === '' ? null : Number(fields.total),
      placed_at: fields.placed_at || null,
      ship_by: fields.ship_by || null,
      notes: fields.notes || null,
    };
    const url = isEdit ? `/api/pos/${po!.id}` : '/api/pos';
    const method = isEdit ? 'PATCH' : 'POST';
    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => ({}));
    setBusy(null);
    if (!res.ok || !json.ok) {
      setErr(typeof json.error === 'string' ? json.error : 'save failed');
      return;
    }
    router.refresh();
    onDone();
  }

  async function remove() {
    if (!po) return;
    if (!window.confirm(`Delete ${po.id}?`)) return;
    setBusy('delete');
    setErr(null);
    const res = await fetch(`/api/pos/${po.id}`, { method: 'DELETE' });
    const json = await res.json().catch(() => ({}));
    setBusy(null);
    if (!res.ok || !json.ok) {
      setErr(typeof json.error === 'string' ? json.error : 'delete failed');
      return;
    }
    router.refresh();
    onDone();
  }

  return (
    <div className="form-grid">
      <div className="field-row">
        <div className="field">
          <div className="lbl">Factory *</div>
          <select
            value={fields.factory_id}
            onChange={(e) => setField('factory_id', e.target.value)}
          >
            <option value="">— select —</option>
            {factories.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <div className="lbl">Status</div>
          <select
            value={fields.status}
            onChange={(e) => setField('status', e.target.value as PoStatus)}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="field">
        <div className="lbl">Linked sample</div>
        <select
          value={fields.sample_id}
          onChange={(e) => setField('sample_id', e.target.value)}
        >
          <option value="">— none —</option>
          {samplesForFactory.map((s) => (
            <option key={s.id} value={s.id}>
              {s.id} · {s.name}
            </option>
          ))}
        </select>
      </div>

      <div className="field-row">
        <div className="field">
          <div className="lbl">Total</div>
          <input
            type="number"
            value={fields.total}
            onChange={(e) => setField('total', e.target.value)}
          />
        </div>
        <div className="field">
          <div className="lbl">Currency</div>
          <input
            maxLength={3}
            value={fields.currency}
            onChange={(e) =>
              setField('currency', e.target.value.toUpperCase())
            }
          />
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <div className="lbl">Placed</div>
          <input
            type="date"
            value={fields.placed_at}
            onChange={(e) => setField('placed_at', e.target.value)}
          />
        </div>
        <div className="field">
          <div className="lbl">Ship by</div>
          <input
            type="date"
            value={fields.ship_by}
            onChange={(e) => setField('ship_by', e.target.value)}
          />
        </div>
      </div>

      <div className="field-row">
        <label className="check">
          <input
            type="checkbox"
            checked={fields.deposit_paid}
            onChange={(e) => setField('deposit_paid', e.target.checked)}
          />
          Deposit paid
        </label>
        <label className="check">
          <input
            type="checkbox"
            checked={fields.balance_paid}
            onChange={(e) => setField('balance_paid', e.target.checked)}
          />
          Balance paid
        </label>
      </div>

      <div className="field">
        <div className="lbl">Notes</div>
        <textarea
          rows={3}
          value={fields.notes}
          onChange={(e) => setField('notes', e.target.value)}
        />
      </div>

      {err && <div className="form-error">{err}</div>}

      <div className="form-actions">
        {isEdit && (
          <button
            type="button"
            className="btn"
            onClick={remove}
            disabled={busy !== null}
          >
            <Icons.x /> {busy === 'delete' ? 'Deleting…' : 'Delete'}
          </button>
        )}
        <div className="spacer" style={{ flex: 1 }} />
        <button
          type="button"
          className="btn"
          onClick={onDone}
          disabled={busy !== null}
        >
          Cancel
        </button>
        <button
          type="button"
          className="btn primary"
          onClick={save}
          disabled={busy !== null}
        >
          <Icons.check />{' '}
          {busy === 'save' ? 'Saving…' : isEdit ? 'Save changes' : 'Create'}
        </button>
      </div>
    </div>
  );
}
