'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icons } from './icons';
import type { Factory, FactoryStatus } from '@/lib/types/db';

const STATUSES: FactoryStatus[] = ['active', 'evaluating', 'paused', 'archived'];

type Props = {
  factory: Factory | null; // null => create mode
  onDone: () => void;
};

export function FactoryForm({ factory, onDone }: Props) {
  const router = useRouter();
  const isEdit = !!factory;

  const [fields, setFields] = useState({
    name: factory?.name ?? '',
    short: factory?.short ?? '',
    city: factory?.city ?? '',
    country: factory?.country ?? '',
    specialty: factory?.specialty ?? '',
    status: (factory?.status ?? 'evaluating') as FactoryStatus,
    whatsapp: factory?.whatsapp ?? '',
    alibaba_url: factory?.alibaba_url ?? '',
    website: factory?.website ?? '',
    contact_name: factory?.contact_name ?? '',
    contact_role: factory?.contact_role ?? '',
    moq: factory?.moq ?? '',
    lead_time_days: factory?.lead_time_days ?? '',
    payment_terms: factory?.payment_terms ?? '',
    notes: factory?.notes ?? '',
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
      moq: fields.moq === '' ? null : Number(fields.moq),
      lead_time_days:
        fields.lead_time_days === '' ? null : Number(fields.lead_time_days),
    };

    const url = isEdit ? `/api/factories/${factory!.id}` : '/api/factories';
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
    if (!factory) return;
    if (!window.confirm(`Delete ${factory.name}? This cannot be undone.`))
      return;
    setBusy('delete');
    setErr(null);
    const res = await fetch(`/api/factories/${factory.id}`, {
      method: 'DELETE',
    });
    const json = await res.json().catch(() => ({}));
    setBusy(null);
    if (!res.ok || !json.ok) {
      setErr(typeof json.error === 'string' ? json.error : 'delete failed');
      return;
    }
    router.push('/factories');
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
          placeholder="Meilong Hair"
          autoFocus
        />
      </div>

      <div className="field-row">
        <div className="field">
          <div className="lbl">Short name</div>
          <input
            value={fields.short}
            onChange={(e) => setField('short', e.target.value)}
            placeholder="Meilong"
          />
        </div>
        <div className="field">
          <div className="lbl">Status</div>
          <select
            value={fields.status}
            onChange={(e) => setField('status', e.target.value as FactoryStatus)}
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <div className="lbl">City</div>
          <input
            value={fields.city}
            onChange={(e) => setField('city', e.target.value)}
            placeholder="Xuchang"
          />
        </div>
        <div className="field">
          <div className="lbl">Country</div>
          <input
            value={fields.country}
            onChange={(e) => setField('country', e.target.value)}
            placeholder="China"
          />
        </div>
      </div>

      <div className="field">
        <div className="lbl">Specialty</div>
        <input
          value={fields.specialty}
          onChange={(e) => setField('specialty', e.target.value)}
          placeholder="Cuticle-aligned, single donor"
        />
      </div>

      <div className="field-row">
        <div className="field">
          <div className="lbl">Contact name</div>
          <input
            value={fields.contact_name}
            onChange={(e) => setField('contact_name', e.target.value)}
            placeholder="Lin Wei"
          />
        </div>
        <div className="field">
          <div className="lbl">Role</div>
          <input
            value={fields.contact_role}
            onChange={(e) => setField('contact_role', e.target.value)}
            placeholder="Sales"
          />
        </div>
      </div>

      <div className="field">
        <div className="lbl">WhatsApp</div>
        <input
          value={fields.whatsapp}
          onChange={(e) => setField('whatsapp', e.target.value)}
          placeholder="+8613810427788"
        />
      </div>

      <div className="field-row">
        <div className="field">
          <div className="lbl">Alibaba URL</div>
          <input
            value={fields.alibaba_url}
            onChange={(e) => setField('alibaba_url', e.target.value)}
          />
        </div>
        <div className="field">
          <div className="lbl">Website</div>
          <input
            value={fields.website}
            onChange={(e) => setField('website', e.target.value)}
          />
        </div>
      </div>

      <div className="field-row">
        <div className="field">
          <div className="lbl">MOQ</div>
          <input
            type="number"
            value={fields.moq}
            onChange={(e) => setField('moq', e.target.value)}
          />
        </div>
        <div className="field">
          <div className="lbl">Lead time (days)</div>
          <input
            type="number"
            value={fields.lead_time_days}
            onChange={(e) => setField('lead_time_days', e.target.value)}
          />
        </div>
      </div>

      <div className="field">
        <div className="lbl">Payment terms</div>
        <input
          value={fields.payment_terms}
          onChange={(e) => setField('payment_terms', e.target.value)}
          placeholder="50% deposit / 50% before ship"
        />
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
