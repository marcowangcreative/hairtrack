function TimelineView() {
  const I = Icons;
  const cols = WEEKS.length;
  const todayCol = 3; // "today" at Apr W4
  return (
    <>
      <Toolbar crumbs={["Workspace", "Timeline"]} right={<>
        <div className="seg">
          <button><I.chev style={{ transform: "rotate(180deg)" }}/></button>
          <button className="on">Weeks</button>
          <button>Months</button>
          <button><I.chev /></button>
        </div>
        <button className="btn"><I.filter /> All tracks</button>
        <button className="btn primary"><I.plus /> Add milestone</button>
      </>} />
      <div className="canvas">
        <div className="tl">
          <div className="tl-grid">
            <div className="tl-cell-left" style={{ fontFamily: "var(--font-mono)", fontSize: 10, color: "var(--fg-3)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Track</div>
            <div className="tl-cell-right" style={{ minHeight: 30 }}>
              <div className="tl-weeks" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
                {WEEKS.map(w => <div key={w} className="tl-week">{w}</div>)}
              </div>
            </div>
            {TIMELINE_ITEMS.map(it => {
              const fac = FACTORIES.find(f => f.id === it.factory);
              return (
                <React.Fragment key={it.id}>
                  <div className="tl-cell-left">
                    <span className="mono" style={{ fontSize: 10, color: "var(--fg-3)", width: 28 }}>{it.phase.slice(0,3).toUpperCase()}</span>
                    <div style={{ overflow: "hidden" }}>
                      <div style={{ fontSize: 12, color: "var(--fg)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{it.label}</div>
                      {fac && <div className="mono" style={{ fontSize: 10, color: "var(--fg-3)" }}>{fac.short}</div>}
                    </div>
                  </div>
                  <div className="tl-cell-right" style={{ minHeight: 40 }}>
                    <div className="tl-weeks" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
                      {Array.from({ length: cols }).map((_, i) => <div key={i} className="tl-week"></div>)}
                    </div>
                    {/* today marker */}
                    <div style={{ position: "absolute", top: 0, bottom: 0, left: `calc(${todayCol * (100/cols)}%)`, width: 1, background: "var(--accent)", opacity: 0.4 }} />
                    <div className={"tl-bar " + (it.status === "accent" ? "" : it.status)} style={{
                      left: `calc(${it.start * (100/cols)}% + 4px)`,
                      width: `calc(${(it.end - it.start) * (100/cols)}% - 8px)`
                    }}>
                      <span>{it.phase}</span>
                      <span style={{ opacity: 0.6, marginLeft: 6, fontSize: 10 }}>W{it.start+15}→W{it.end+15}</span>
                    </div>
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

window.TimelineView = TimelineView;
