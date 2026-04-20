'use client';

import { useState } from 'react';
import { Icons } from './icons';
import { SideSheet } from './side-sheet';
import { FactoryForm } from './factory-form';
import type { Factory } from '@/lib/types/db';

export function FactoryAddButton() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button className="btn primary" onClick={() => setOpen(true)}>
        <Icons.plus /> Add factory
      </button>
      <SideSheet
        open={open}
        title="Add factory"
        onClose={() => setOpen(false)}
      >
        <FactoryForm factory={null} onDone={() => setOpen(false)} />
      </SideSheet>
    </>
  );
}

export function FactoryEditButton({ factory }: { factory: Factory }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        className="btn"
        onClick={() => setOpen(true)}
        title="Edit factory"
      >
        <Icons.edit /> Edit
      </button>
      <SideSheet
        open={open}
        title={`Edit ${factory.name}`}
        onClose={() => setOpen(false)}
      >
        <FactoryForm factory={factory} onDone={() => setOpen(false)} />
      </SideSheet>
    </>
  );
}
