// App shell — sidebar + top bar + toolbar
const { useState, useEffect, useMemo, useRef } = React;

function Sidebar({ view, setView }) {
  const I = Icons;
  const items = [
    { id: "dashboard", label: "Dashboard", ico: I.dashboard, kbd: "1" },
    { id: "factories", label: "Factories", ico: I.factory, count: FACTORIES.length, kbd: "2" },
    { id: "samples", label: "Samples", ico: I.sample, count: SAMPLES.length, kbd: "3" },
    { id: "whatsapp", label: "WhatsApp", ico: I.whatsapp, count: WA_THREADS.reduce((a, t) => a + t.unread, 0), kbd: "4" },
    { id: "invoices", label: "Invoices", ico: I.doc, count: INVOICES.length, kbd: "5" },
    { id: "timeline", label: "Timeline", ico: I.calendar, kbd: "6" },
    { id: "costs", label: "Cost & margin", ico: I.money, kbd: "7" },
    { id: "settings", label: "Integrations", ico: I.zap, kbd: "8" },
  ];
  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="mark">HT</div>
        <div className="name">Hair Track</div>
        <div className="ws">Halo Launch</div>
      </div>

      <div className="group">
        <div className="group-label">Workspace</div>
        {items.map(it => {
          const Ic = it.ico;
          return (
            <button key={it.id} className={"nav-item" + (view === it.id ? " active" : "")} onClick={() => setView(it.id)}>
              <Ic />
              <span>{it.label}</span>
              {it.count != null && it.count > 0 ? <span className="count">{it.count}</span> : <span className="kbd">{it.kbd}</span>}
            </button>
          );
        })}
      </div>

      <div className="group">
        <div className="group-label">Pinned factories</div>
        {FACTORIES.slice(0, 4).map(f => (
          <button key={f.id} className="nav-item" onClick={() => setView("factories")}>
            <span className="ico" style={{ width: 14, height: 14, borderRadius: 3, background: f.swatch, border: "1px solid var(--line-2)" }} />
            <span style={{ fontSize: 12 }}>{f.short}</span>
            {f.unread > 0 && <span className="count" style={{ color: "var(--accent-fg)" }}>{f.unread}</span>}
          </button>
        ))}
      </div>

      <div className="footer">
        <div className="avatar">MK</div>
        <div className="who">
          <div className="name">Mia Kovács</div>
          <div className="role">Founder · halo</div>
        </div>
      </div>
    </aside>
  );
}

function TopNav({ view, setView }) {
  const I = Icons;
  const tabs = [
    { id: "dashboard", label: "Dashboard" },
    { id: "factories", label: "Factories", count: FACTORIES.length },
    { id: "samples", label: "Samples", count: SAMPLES.length },
    { id: "whatsapp", label: "WhatsApp", count: WA_THREADS.reduce((a,t)=>a+t.unread,0) },
    { id: "invoices", label: "Invoices", count: INVOICES.length },
    { id: "timeline", label: "Timeline" },
    { id: "costs", label: "Costs" },
  ];
  return (
    <header className="topnav">
      <div className="brand">
        <div className="mark">HT</div>
        <div className="name">Hair Track</div>
      </div>
      <div className="tabs">
        {tabs.map(t => (
          <button key={t.id} className={"tab" + (view === t.id ? " active" : "")} onClick={() => setView(t.id)}>
            <span>{t.label}</span>
            {t.count != null && t.count > 0 && <span className="count">{t.count}</span>}
          </button>
        ))}
      </div>
      <div className="right">
        <div className="search" style={{ minWidth: 220 }}>
          <I.search />
          <input placeholder="Search factories, samples…" />
          <span className="kbd">⌘K</span>
        </div>
        <button className="btn ghost sm"><I.bell /></button>
        <div className="avatar">MK</div>
      </div>
    </header>
  );
}

function Toolbar({ crumbs, right, tabs, activeTab, setTab }) {
  return (
    <>
      <div className="toolbar">
        <div className="crumbs">
          {crumbs.map((c, i) => (
            <React.Fragment key={i}>
              {i > 0 && <span className="sep">/</span>}
              <span className={i === crumbs.length - 1 ? "cur" : ""}>{c}</span>
            </React.Fragment>
          ))}
        </div>
        <div className="spacer" />
        {right}
      </div>
      {tabs && (
        <div className="tabs-row">
          {tabs.map(t => (
            <button key={t.id} className={"tab" + (activeTab === t.id ? " active" : "")} onClick={() => setTab && setTab(t.id)}>
              <span>{t.label}</span>
              {t.count != null && <span className="count">{t.count}</span>}
            </button>
          ))}
          <div className="spacer" />
          {t => null}
        </div>
      )}
    </>
  );
}

Object.assign(window, { Sidebar, TopNav, Toolbar });
