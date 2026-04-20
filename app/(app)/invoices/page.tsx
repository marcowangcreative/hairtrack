import { Toolbar } from '@/components/toolbar';
import { Icons } from '@/components/icons';

export default function InvoicesPage() {
  return (
    <>
      <Toolbar
        crumbs={['Workspace', 'Invoices']}
        right={
          <button className="btn primary">
            <Icons.plus /> Upload invoice
          </button>
        }
      />
      <div className="canvas">
        <div className="empty-state">
          Invoice drop → parse → confirm — upload route is live at{' '}
          <code>POST /api/invoices/upload</code>. UI coming next.
        </div>
      </div>
    </>
  );
}
