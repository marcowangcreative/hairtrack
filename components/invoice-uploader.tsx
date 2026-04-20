'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Icons } from './icons';

export function InvoiceUploader() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File) {
    setError(null);
    const form = new FormData();
    form.append('file', file);

    const res = await fetch('/api/invoices/upload', {
      method: 'POST',
      body: form,
    });
    const json = await res.json();
    if (!res.ok || !json.ok) {
      setError(json.error?.message ?? json.error ?? 'upload failed');
      return;
    }
    startTransition(() => {
      router.push(`/invoices?id=${json.invoice.id}`);
      router.refresh();
    });
  }

  function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    const file = files[0];
    startTransition(() => {
      void upload(file);
    });
  }

  return (
    <div
      className={`dropzone${dragOver ? ' dragover' : ''}`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        handleFiles(e.dataTransfer.files);
      }}
      onClick={() => inputRef.current?.click()}
      style={{ cursor: 'pointer' }}
    >
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf,image/*"
        hidden
        onChange={(e) => handleFiles(e.target.files)}
      />
      {uploading ? (
        <>
          <div className="big">
            <Icons.sparkle /> Uploading & parsing…
          </div>
          <small>Claude is reading the file. This takes 5-15 seconds.</small>
        </>
      ) : (
        <>
          <div className="big">
            <Icons.upload /> Drop invoice · click to upload
          </div>
          <small>PDF · JPG · PNG · auto-parses on upload</small>
        </>
      )}
      {error && (
        <div
          style={{
            marginTop: 8,
            fontSize: 11,
            color: 'var(--danger)',
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
}
