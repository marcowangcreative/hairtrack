'use client';

import { useState } from 'react';
import { Icons } from './icons';
import { SideSheet } from './side-sheet';
import { PoForm } from './po-form';
import type { Factory, Po, Sample } from '@/lib/types/db';

export function PoAddButton({
  factories,
  samples,
  defaultFactoryId,
}: {
  factories: Factory[];
  samples: Sample[];
  defaultFactoryId?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="btn primary" onClick={() => setOpen(true)}>
        <Icons.plus /> New PO
      </button>
      <SideSheet open={open} title="New PO" onClose={() => setOpen(false)}>
        <PoForm
          po={null}
          factories={factories}
          samples={samples}
          defaultFactoryId={defaultFactoryId}
          onDone={() => setOpen(false)}
        />
      </SideSheet>
    </>
  );
}

export function PoEditButton({
  po,
  factories,
  samples,
}: {
  po: Po;
  factories: Factory[];
  samples: Sample[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        className="btn sm"
        onClick={() => setOpen(true)}
        title={`Edit ${po.id}`}
      >
        <Icons.edit />
      </button>
      <SideSheet
        open={open}
        title={`Edit ${po.id}`}
        onClose={() => setOpen(false)}
      >
        <PoForm
          po={po}
          factories={factories}
          samples={samples}
          onDone={() => setOpen(false)}
        />
      </SideSheet>
    </>
  );
}
