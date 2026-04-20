import { Toolbar } from '@/components/toolbar';

export default function WhatsAppPage() {
  return (
    <>
      <Toolbar crumbs={['Workspace', 'WhatsApp']} />
      <div className="canvas">
        <div className="empty-state">
          3-pane chat — ports <code>prototype/view_whatsapp.jsx</code> and wires to{' '}
          <code>wa_threads</code>, <code>wa_messages</code> with Supabase realtime.
        </div>
      </div>
    </>
  );
}
