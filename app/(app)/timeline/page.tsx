import { Toolbar } from '@/components/toolbar';

export default function TimelinePage() {
  return (
    <>
      <Toolbar crumbs={['Workspace', 'Timeline']} />
      <div className="canvas">
        <div className="empty-state">
          12-week launch Gantt — ports <code>prototype/view_timeline.jsx</code>.
        </div>
      </div>
    </>
  );
}
