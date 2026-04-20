import { Toolbar } from '@/components/toolbar';

export default function CostsPage() {
  return (
    <>
      <Toolbar crumbs={['Workspace', 'Cost & margin']} />
      <div className="canvas">
        <div className="empty-state">
          Per-SKU margin + cash runway — ports <code>prototype/view_costs.jsx</code>.
        </div>
      </div>
    </>
  );
}
