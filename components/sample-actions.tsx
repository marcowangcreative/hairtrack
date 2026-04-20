'use client';

import { useState } from 'react';
import { Icons } from './icons';
import { SideSheet } from './side-sheet';
import { SampleForm } from './sample-form';
import type { Factory, Sample } from '@/lib/types/db';

export function SampleAddButton({
  factories,
  defaultFactoryId,
}: {
  factories: Factory[];
  defaultFactoryId?: string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="btn primary" onClick={() => setOpen(true)}>
        <Icons.plus /> New sample
      </button>
      <SideSheet
        open={open}
        title="New sample"
        onClose={() => setOpen(false)}
      >
        <SampleForm
          sample={null}
          factories={factories}
          defaultFactoryId={defaultFactoryId}
          onDone={() => setOpen(false)}
        />
      </SideSheet>
    </>
  );
}

export function SampleEditButton({
  sample,
  factories,
}: {
  sample: Sample;
  factories: Factory[];
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        className="btn sm"
        onClick={() => setOpen(true)}
        title="Edit sample"
      >
        <Icons.edit />
      </button>
      <SideSheet
        open={open}
        title={`Edit ${sample.name}`}
        onClose={() => setOpen(false)}
      >
        <SampleForm
          sample={sample}
          factories={factories}
          onDone={() => setOpen(false)}
        />
      </SideSheet>
    </>
  );
}
