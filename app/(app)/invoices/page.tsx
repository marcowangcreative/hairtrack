import Link from 'next/link';
import { Toolbar } from '@/components/toolbar';
import { Icons } from '@/components/icons';
import { InvoiceStatusPill } from '@/components/pills';
import { InvoiceUploader } from '@/components/invoice-uploader';
import { InvoiceFieldsForm } from '@/components/invoice-fields-form';
import {
  getInvoicesViewData,
  type InvoiceListItem,
} from '@/lib/fetchers';

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  const data = await getInvoicesViewData(id);

  return (
    <>
      <Toolbar
        crumbs={['Workspace', 'Invoices']}
        right={
          <>
            <span className="pill dim">
              <Icons.sparkle /> Auto-parse on
            </span>
            <button className="btn" disabled title="Coming soon">
              <Icons.filter /> Filter
            </button>
          </>
        }
      />
      <div className="canvas" style={{ padding: 0 }}>
        {!data.configured ? (
          <div className="empty-state">
            Supabase isn&apos;t configured. Fill in <code>.env.local</code>.
          </div>
        ) : (
          <div className="inv-grid">
            <div className="inv-list">
              <InvoiceUploader />
              <div
                className="mono"
                style={{
                  fontSize: 10,
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  color: 'var(--fg-3)',
                  padding: '8px 14px 4px',
                }}
              >
                Recent · {data.invoices.length}
              </div>
              {data.invoices.length === 0 ? (
                <div
                  style={{
                    padding: '14px',
                    fontSize: 12,
                    color: 'var(--fg-3)',
                  }}
                >
                  No invoices yet. Drop a PDF or image above to get started.
                </div>
              ) : (
                data.invoices.map((inv) => (
                  <InvoiceRow
                    key={inv.id}
                    invoice={inv}
                    active={inv.id === data.selected?.id}
                  />
                ))
              )}
            </div>
            {data.selected ? (
              <div className="inv-preview">
                <InvoicePreview fileUrl={data.selected.file_url} />
                <InvoiceFieldsForm
                  invoice={data.selected}
                  factories={data.factories}
                />
              </div>
            ) : (
              <div className="empty-state">Upload an invoice to start.</div>
            )}
          </div>
        )}
      </div>
    </>
  );
}

function InvoiceRow({
  invoice,
  active,
}: {
  invoice: InvoiceListItem;
  active: boolean;
}) {
  const fileName = invoice.file_url.split('/').pop() ?? 'invoice';
  const amount =
    invoice.total != null
      ? `${invoice.currency ?? '$'} ${Number(invoice.total).toLocaleString()}`
      : '—';
  return (
    <Link
      href={`/invoices?id=${invoice.id}`}
      className={`inv-row${active ? ' active' : ''}`}
    >
      <div style={{ minWidth: 0 }}>
        <div className="fname" title={fileName}>
          {invoice.invoice_number ?? fileName}
        </div>
        <div className="meta">
          {invoice.factory?.short ?? 'Unassigned'}
          {' · '}
          {invoice.invoice_date
            ? new Date(invoice.invoice_date).toLocaleDateString()
            : new Date(invoice.created_at).toLocaleDateString()}
          {' · '}
          {amount}
        </div>
        <div style={{ marginTop: 6 }}>
          <InvoiceStatusPill status={invoice.parse_status} />
        </div>
      </div>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-end',
          gap: 3,
        }}
      >
        <Icons.doc strokeW={1.4} />
      </div>
    </Link>
  );
}

function InvoicePreview({ fileUrl }: { fileUrl: string }) {
  const isPdf = /\.pdf($|\?)/i.test(fileUrl);
  return (
    <div className="inv-doc">
      {isPdf ? (
        <iframe
          src={fileUrl}
          title="Invoice PDF"
          style={{
            width: '100%',
            maxWidth: 640,
            height: '100%',
            minHeight: 700,
            border: '1px solid var(--line)',
            borderRadius: 4,
            background: '#fff',
          }}
        />
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={fileUrl}
          alt="Invoice"
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            borderRadius: 4,
            border: '1px solid var(--line)',
            background: '#fff',
          }}
        />
      )}
    </div>
  );
}
