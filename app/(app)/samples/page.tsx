import { Toolbar } from '@/components/toolbar';
import { Icons } from '@/components/icons';

export default function SamplesPage() {
  return (
    <>
      <Toolbar
        crumbs={['Workspace', 'Samples']}
        right={
          <button className="btn primary">
            <Icons.plus /> Request sample
          </button>
        }
      />
      <div className="canvas">
        <div className="empty-state">
          Samples kanban/list view — ports <code>prototype/view_samples.jsx</code>.
        </div>
      </div>
    </>
  );
}
