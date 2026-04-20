import type { SampleStage, FactoryStatus, InvoiceParseStatus } from '@/lib/types/db';

const STAGE_META: Record<SampleStage, { label: string; cls: string }> = {
  requested: { label: 'Requested', cls: 'dim' },
  in_production: { label: 'In production', cls: 'warn' },
  shipping: { label: 'Shipping', cls: 'accent' },
  received: { label: 'Received', cls: 'accent' },
  approved: { label: 'Approved', cls: 'ok' },
  rejected: { label: 'Rejected', cls: 'danger' },
};

const FACTORY_STATUS_META: Record<FactoryStatus, { label: string; cls: string }> = {
  active: { label: 'active', cls: 'ok' },
  evaluating: { label: 'evaluating', cls: 'warn' },
  paused: { label: 'paused', cls: 'dim' },
  archived: { label: 'archived', cls: 'dim' },
};

const INVOICE_STATUS_META: Record<InvoiceParseStatus, { label: string; cls: string }> =
  {
    pending: { label: 'Pending', cls: 'dim' },
    parsed: { label: 'Parsed', cls: 'accent' },
    confirmed: { label: 'Confirmed', cls: 'ok' },
    failed: { label: 'Failed', cls: 'danger' },
  };

function Pill({ cls, label }: { cls: string; label: string }) {
  return (
    <span className={`pill ${cls}`}>
      <span className="dot" />
      {label}
    </span>
  );
}

export function StagePill({ stage }: { stage: string }) {
  const meta = STAGE_META[stage as SampleStage] ?? { label: stage, cls: 'dim' };
  return <Pill {...meta} />;
}

export function FactoryStatusPill({ status }: { status: string }) {
  const meta =
    FACTORY_STATUS_META[status as FactoryStatus] ?? { label: status, cls: 'dim' };
  return <Pill {...meta} />;
}

export function InvoiceStatusPill({ status }: { status: string }) {
  const meta =
    INVOICE_STATUS_META[status as InvoiceParseStatus] ?? {
      label: status,
      cls: 'dim',
    };
  return <Pill {...meta} />;
}
