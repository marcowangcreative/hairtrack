import { Toolbar } from '@/components/toolbar';
import { Icons } from '@/components/icons';

export default function FactoriesPage() {
  return (
    <>
      <Toolbar
        crumbs={['Workspace', 'Factories']}
        right={
          <button className="btn primary">
            <Icons.plus /> New factory
          </button>
        }
      />
      <div className="canvas">
        <div className="empty-state">
          Factories view coming next — will port <code>prototype/view_factories.jsx</code>{' '}
          and wire to the <code>factories</code> + <code>samples</code> +{' '}
          <code>invoices</code> tables.
        </div>
      </div>
    </>
  );
}
