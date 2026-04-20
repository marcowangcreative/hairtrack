'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icons } from './icons';
import type { Factory, Sample, SampleStage } from '@/lib/types/db';

const STAGES: SampleStage[] = [
  'requested',
  'in_production',
  'shipping',
  'received',
  'approved',
  'rejected',
];

type Props = {
  sample: Sample | null;
  factories: Factory[];
  defaultFactoryId?: string;
  onDone: () => void;
};

export function SampleForm({
  sample,
  factories,
  defaultFactoryId,
  onDone,
}: Props) {
  const router = useRouter();
  const isEdit = !!sample;

  const [fields, setFields] = useState({
    name: sample?.name ?? '',
    factory_id: sample?.factory_id ?? defaultFactoryId ?? '',
    stage: (sample?.stage ?? 'requested') as SampleStage,
    requested_at: sample?.requested_at ?? '',
    eta: sample?.eta ?? '',
    received_at: sample?.received_at ?? '',
    notes: sample?.notes ?? '',
  });
  const [busy, setBusy] = useState<'save' | 'delete' | null>(null);
  const [err, setErr] = useState<string | null>(null);

  function setField<K extends keyof typeof fields>(
    key: K,
    val: (typeof fields)[K]
  ) {
    setFields((f) => ({ ...f, [key]: val }));
  }

  async function save() {
    if (!fields.name.trim()) {
      setErr('Name is required');
      return;
    }
    setBusy('save');
    setErr(null);
    const body = {
      ...fields,
      factory_id: fields.factory_id || null,
      requested_at: fields.requested_at || null,
      eta: fields.eta || null,
      received_at: fields.received_at || null,
      notes: fields.notes || null,
    };

    const url = isEdit ? `/api/samples/${sample!.id}` : '/api/samples';
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
    if (!sample) return;
    if (!window.confirm(`Delete ${sample.name}?`)) return;
    setBusy('delete');
    setErr(null);
    const res = await fetch(`/api/samples/${sample.id}`, {
      method: 'DELETE',
    });
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
      <div className="field">
        <div className="lbl">Name *</div>
        <input
          value={fields.name}
          onChange={(e) => setField('name', e.target.value)}
          placeholder='22" cuticle-aligned 1B'
          autoFocus
        />
      </div>

      <div className="field-row">
        <div className="field">
          <div className="lbl">Factory</div>
          <select
            value={fields.factory_id}
            onChange={(e) => setField('factory_id', e.target.value)}
          >
            <option value="">— unassigned —</option>
            {factories.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <div className="lbl">Stage</div>
          <select
            value={fields.stage}
            onChange={(e) => setField('stage', e.target.value as SampleStage)}
          >
            {STAGES.map((s) => (
              <option key={s} value={s}>
                {s.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <div className="lbl">Requested</div>
          <input
            type="date"
            value={fields.requested_at}
            onChange={(e) => setField('requested_at', e.target.value)}
          />
        </div>
        <div className="field">
          <div className="lbl">ETA</div>
          <input
            type="date"
            value={fields.eta}
            onChange={(e) => setField('eta', e.target.value)}
          />
        </div>
        <div className="field">
          <div className="lbl">Received</div>
          <input
            type="date"
            value={fields.received_at}
            onChange={(e) => setField('received_at', e.target.value)}
          />
        </div>
      </div>

      <div className="field">
        <div className="lbl">Notes</div>
        <textarea
          rows={4}
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
